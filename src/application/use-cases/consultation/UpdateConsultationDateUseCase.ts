import { inject, injectable } from 'tsyringe';
import { IConsultationBookingRepository } from '../../../domain/repositories/IConsultationBookingRepository';
import { ConsultationBooking } from '../../../domain/entities/ConsultationBooking';

export interface IUpdateConsultationDateUseCase {
    execute(id: string, newDate: string): Promise<ConsultationBooking | null>;
}

@injectable()
export class UpdateConsultationDateUseCase implements IUpdateConsultationDateUseCase {
    constructor(
        @inject('IConsultationBookingRepository') private bookingRepo: IConsultationBookingRepository
    ) {}

    async execute(id: string, newDate: string): Promise<ConsultationBooking | null> {
        const existing = await this.bookingRepo.findById(id);
        if (!existing) {
            throw new Error('Consultation not found');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDateObj = new Date(newDate);
        selectedDateObj.setHours(0, 0, 0, 0);

        if (selectedDateObj < today) {
            throw new Error('Consultation date cannot be in the past');
        }

        // Check one consultation per day rule
        const bookingsOnDate = await this.bookingRepo.findByDate(newDate);
        const otherBookings = bookingsOnDate.filter(b => b.id !== id && b.status !== 'REJECTED');
        if (otherBookings.length > 0) {
            throw new Error('Another consultation is already booked for this date');
        }

        const updatedBooking = await this.bookingRepo.update(id, { appointmentDate: newDate });
        return updatedBooking;
    }
}
