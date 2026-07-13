import { inject, injectable } from 'tsyringe';
import { IGetAdminConsultationsUseCase } from '../../interfaces/use-cases/consultation/IConsultationBookingUseCases';
import { IConsultationBookingRepository } from '../../../domain/repositories/IConsultationBookingRepository';
import { ConsultationBooking } from '../../../domain/entities/ConsultationBooking';

@injectable()
export class GetAdminConsultationsUseCase implements IGetAdminConsultationsUseCase {
    constructor(@inject('IConsultationBookingRepository') private bookingRepo: IConsultationBookingRepository) {}

    async execute(filters: any, page: number, limit: number): Promise<{ bookings: ConsultationBooking[], total: number }> {
        return this.bookingRepo.findAll(filters, page, limit);
    }
}
