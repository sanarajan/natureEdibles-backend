import { ConsultationBooking } from '../../../../domain/entities/ConsultationBooking';

export interface ICreateConsultationBookingUseCase {
    execute(bookingData: any): Promise<ConsultationBooking>;
}

export interface IGetAvailableSlotsUseCase {
    execute(date: string): Promise<{ slots: string[], message?: string }>;
}

export interface IGetUserConsultationsUseCase {
    execute(userId: string): Promise<ConsultationBooking[]>;
}

export interface IGetAdminConsultationsUseCase {
    execute(filters: any, page: number, limit: number): Promise<{ bookings: ConsultationBooking[], total: number }>;
}

export interface IUpdateConsultationStatusUseCase {
    execute(id: string, updates: Partial<ConsultationBooking>): Promise<ConsultationBooking | null>;
}

export interface IGetConsultationByIdUseCase {
    execute(id: string): Promise<ConsultationBooking | null>;
}
