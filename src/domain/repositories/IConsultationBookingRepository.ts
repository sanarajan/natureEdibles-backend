import { ConsultationBooking } from '../entities/ConsultationBooking';

export interface IConsultationBookingRepository {
    create(booking: ConsultationBooking): Promise<ConsultationBooking>;
    findById(id: string): Promise<ConsultationBooking | null>;
    findByUserId(userId: string): Promise<ConsultationBooking[]>;
    findAll(filters?: any, page?: number, limit?: number): Promise<{ bookings: ConsultationBooking[], total: number }>;
    findByDate(date: string): Promise<ConsultationBooking[]>;
    update(id: string, updates: Partial<ConsultationBooking>): Promise<ConsultationBooking | null>;
}
