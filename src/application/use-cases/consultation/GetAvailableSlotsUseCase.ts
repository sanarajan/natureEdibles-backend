import { inject, injectable } from 'tsyringe';
import { IGetAvailableSlotsUseCase } from '../../interfaces/use-cases/consultation/IConsultationBookingUseCases';
import { IConsultationSettingsRepository } from '../../../domain/repositories/IConsultationSettingsRepository';
import { IConsultationBookingRepository } from '../../../domain/repositories/IConsultationBookingRepository';

@injectable()
export class GetAvailableSlotsUseCase implements IGetAvailableSlotsUseCase {
    constructor(
        @inject('IConsultationSettingsRepository') private settingsRepo: IConsultationSettingsRepository,
        @inject('IConsultationBookingRepository') private bookingRepo: IConsultationBookingRepository
    ) {}

    async execute(dateStr: string): Promise<{ slots: string[], message?: string }> {
        const settings = await this.settingsRepo.getSettings();
        if (!settings.bookingEnabled) {
            return { slots: [], message: 'No consultation available.' };
        }

        // Parse date as local time midnight to avoid timezone offset issues
        const requestedDate = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check advance booking constraints
        const diffDays = Math.round((requestedDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        if (diffDays > settings.maxAdvanceBookingDays) {
            return { slots: [], message: 'No consultation available.' };
        }

        const now = new Date();
        
        if (diffDays < 0) {
            return { slots: [], message: 'No consultation available.' };
        }

        let scheduleParams = {
            enabled: false,
            startTime: '00:00',
            endTime: '00:00',
            slotDurationMinutes: 30,
            maxBookings: 20
        };

        // 1. Check if date is in Special Schedule
        const specialMatch = settings.specialSchedules?.find(s => s.date === dateStr);
        if (specialMatch) {
            scheduleParams = {
                enabled: specialMatch.enabled,
                startTime: specialMatch.startTime,
                endTime: specialMatch.endTime,
                slotDurationMinutes: specialMatch.slotDurationMinutes,
                maxBookings: specialMatch.maxBookings
            };
        } else {
            // 2. Check if date is in Leave Dates
            const leaveMatch = settings.leaveDates?.find(l => l.date === dateStr && l.status === 'Active');
            if (leaveMatch) {
                return { slots: [], message: 'This day is marked as a leave. Consultation is unavailable.' };
            }

            // 3. Fallback to Weekly Schedule
            const dayOfWeek = requestedDate.getDay(); // 0 = Sunday, 1 = Monday
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayName = days[dayOfWeek] as keyof typeof settings.workingDays;
            const daySchedule = settings.workingDays[dayName];
            
            scheduleParams = {
                enabled: daySchedule.enabled,
                startTime: daySchedule.startTime,
                endTime: daySchedule.endTime,
                slotDurationMinutes: daySchedule.slotDurationMinutes,
                maxBookings: daySchedule.maxDailyBookings
            };
        }

        if (!scheduleParams.enabled) {
            return { slots: [], message: 'No consultation available on this day.' };
        }

        // Check existing bookings
        const existingBookings = await this.bookingRepo.findByDate(dateStr);
        if (existingBookings.length >= scheduleParams.maxBookings) {
            return { slots: [], message: 'Fully booked for this day.' };
        }

        const bookedSlots = existingBookings.map(b => b.appointmentTime);

        // Generate slots
        const slots: string[] = [];
        const [startH, startM] = scheduleParams.startTime.split(':').map(Number);
        const [endH, endM] = scheduleParams.endTime.split(':').map(Number);
        
        let currentTime = startH * 60 + startM;
        const endTime = endH * 60 + endM;
        const duration = scheduleParams.slotDurationMinutes;
        const gap = settings.slotGapMinutes;

        while (currentTime + duration <= endTime) {
            const slotH = Math.floor(currentTime / 60);
            const slotM = currentTime % 60;
            const slotStr = `${slotH.toString().padStart(2, '0')}:${slotM.toString().padStart(2, '0')}`;

            // Check if it's in the past (for today)
            let isPast = false;
            let isTooSoon = false;
            // Parse safely as local date
            const slotDate = new Date(dateStr + 'T00:00:00');
            slotDate.setHours(slotH, slotM, 0, 0);
            const diffHoursToSlot = (slotDate.getTime() - now.getTime()) / (1000 * 3600);

            if (diffDays === 0) {
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                if (currentTime <= currentMinutes) {
                    isPast = true;
                }
            }
            
            if (diffHoursToSlot < settings.minAdvanceBookingHours) {
                isTooSoon = true;
            }

            // Check breaks
            let inBreak = false;
            for (const b of settings.breaks || []) {
                const [bStartH, bStartM] = b.startTime.split(':').map(Number);
                const [bEndH, bEndM] = b.endTime.split(':').map(Number);
                const bStart = bStartH * 60 + bStartM;
                const bEnd = bEndH * 60 + bEndM;

                if ((currentTime >= bStart && currentTime < bEnd) || 
                    (currentTime + duration > bStart && currentTime + duration <= bEnd)) {
                    inBreak = true;
                    break;
                }
            }

            if (!isPast && !isTooSoon && !inBreak && !bookedSlots.includes(slotStr)) {
                slots.push(slotStr);
            }

            currentTime += duration + gap;
        }

        if (slots.length === 0) {
            return { slots: [], message: 'No slots available' };
        }

        return { slots };
    }
}
