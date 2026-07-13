export interface DaySchedule {
    enabled: boolean;
    startTime: string; // e.g., "09:00"
    endTime: string;   // e.g., "17:00"
    slotDurationMinutes: number; // e.g., 30
    maxDailyBookings: number; // e.g., 10
}

export interface BreakSchedule {
    id: string;
    title: string;     // e.g., "Lunch Break"
    startTime: string; // e.g., "13:00"
    endTime: string;   // e.g., "14:00"
}

export interface LeaveDate {
    id: string;
    date: string; // YYYY-MM-DD
    reason?: string;
    status: string; // e.g., "Active"
}

export interface SpecialSchedule {
    id: string;
    date: string; // YYYY-MM-DD
    enabled: boolean;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    maxBookings: number;
}

export class ConsultationSettings {
    constructor(
        public readonly id: string,
        public doctorName: string,
        public doctorDesignation: string,
        public consultationFee: number,
        public bookingEnabled: boolean,
        public slotGapMinutes: number,
        public minAdvanceBookingHours: number,
        public maxAdvanceBookingDays: number,
        public workingDays: {
            monday: DaySchedule;
            tuesday: DaySchedule;
            wednesday: DaySchedule;
            thursday: DaySchedule;
            friday: DaySchedule;
            saturday: DaySchedule;
            sunday: DaySchedule;
        },
        public breaks: BreakSchedule[],
        public leaveDates: LeaveDate[],
        public specialSchedules: SpecialSchedule[],
        public readonly createdAt: Date = new Date(),
        public readonly updatedAt: Date = new Date()
    ) {}
}
