import mongoose, { Schema, Document } from 'mongoose';

export interface IDaySchedule {
    enabled: boolean;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    maxDailyBookings: number;
}

export interface IBreakSchedule {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
}

export interface ILeaveDate {
    id: string;
    date: string;
    reason?: string;
    status: string;
}

export interface ISpecialSchedule {
    id: string;
    date: string;
    enabled: boolean;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    maxBookings: number;
}

export interface IConsultationSettingsDocument extends Document {
    doctorName: string;
    doctorDesignation: string;
    consultationFee: number;
    bookingEnabled: boolean;
    slotGapMinutes: number;
    minAdvanceBookingHours: number;
    maxAdvanceBookingDays: number;
    workingDays: {
        monday: IDaySchedule;
        tuesday: IDaySchedule;
        wednesday: IDaySchedule;
        thursday: IDaySchedule;
        friday: IDaySchedule;
        saturday: IDaySchedule;
        sunday: IDaySchedule;
    };
    breaks: IBreakSchedule[];
    leaveDates: ILeaveDate[];
    specialSchedules: ISpecialSchedule[];
    createdAt: Date;
    updatedAt: Date;
}

const DayScheduleSchema = new Schema<IDaySchedule>({
    enabled: { type: Boolean, default: false },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' },
    slotDurationMinutes: { type: Number, default: 30 },
    maxDailyBookings: { type: Number, default: 20 }
}, { _id: false });

const BreakScheduleSchema = new Schema<IBreakSchedule>({
    id: { type: String, required: true },
    title: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
}, { _id: false });

const LeaveDateSchema = new Schema<ILeaveDate>({
    id: { type: String, required: true },
    date: { type: String, required: true },
    reason: { type: String, required: false },
    status: { type: String, required: true, default: 'Active' }
}, { _id: false });

const SpecialScheduleSchema = new Schema<ISpecialSchedule>({
    id: { type: String, required: true },
    date: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' },
    slotDurationMinutes: { type: Number, default: 30 },
    maxBookings: { type: Number, default: 20 }
}, { _id: false });

const ConsultationSettingsSchema = new Schema<IConsultationSettingsDocument>({
    doctorName: { type: String, required: true, default: 'Dr. Default' },
    doctorDesignation: { type: String, required: true, default: 'Chief Consultant' },
    consultationFee: { type: Number, required: true, default: 500 },
    bookingEnabled: { type: Boolean, required: true, default: true },
    slotGapMinutes: { type: Number, required: true, default: 0 },
    minAdvanceBookingHours: { type: Number, required: true, default: 24 },
    maxAdvanceBookingDays: { type: Number, required: true, default: 30 },
    workingDays: {
        monday: { type: DayScheduleSchema, default: () => ({ enabled: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, maxDailyBookings: 20 }) },
        tuesday: { type: DayScheduleSchema, default: () => ({ enabled: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, maxDailyBookings: 20 }) },
        wednesday: { type: DayScheduleSchema, default: () => ({ enabled: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, maxDailyBookings: 20 }) },
        thursday: { type: DayScheduleSchema, default: () => ({ enabled: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, maxDailyBookings: 20 }) },
        friday: { type: DayScheduleSchema, default: () => ({ enabled: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, maxDailyBookings: 20 }) },
        saturday: { type: DayScheduleSchema, default: () => ({ enabled: false, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, maxDailyBookings: 20 }) },
        sunday: { type: DayScheduleSchema, default: () => ({ enabled: false, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, maxDailyBookings: 20 }) }
    },
    breaks: { type: [BreakScheduleSchema], default: [] },
    leaveDates: { type: [LeaveDateSchema], default: [] },
    specialSchedules: { type: [SpecialScheduleSchema], default: [] }
}, { timestamps: true });

export const ConsultationSettingsModel = mongoose.model<IConsultationSettingsDocument>('ConsultationSettings', ConsultationSettingsSchema);
