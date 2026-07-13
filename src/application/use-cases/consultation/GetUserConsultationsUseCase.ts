import { inject, injectable } from 'tsyringe';
import { IGetUserConsultationsUseCase } from '../../interfaces/use-cases/consultation/IConsultationBookingUseCases';
import { IConsultationBookingRepository } from '../../../domain/repositories/IConsultationBookingRepository';
import { ConsultationBooking } from '../../../domain/entities/ConsultationBooking';

@injectable()
export class GetUserConsultationsUseCase implements IGetUserConsultationsUseCase {
    constructor(@inject('IConsultationBookingRepository') private bookingRepo: IConsultationBookingRepository) {}

    async execute(userId: string): Promise<ConsultationBooking[]> {
        return this.bookingRepo.findByUserId(userId);
    }
}
