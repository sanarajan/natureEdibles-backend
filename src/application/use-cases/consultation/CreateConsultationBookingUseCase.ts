import { inject, injectable } from 'tsyringe';
import { ICreateConsultationBookingUseCase } from '../../interfaces/use-cases/consultation/IConsultationBookingUseCases';
import { IConsultationBookingRepository } from '../../../domain/repositories/IConsultationBookingRepository';
import { ConsultationBooking } from '../../../domain/entities/ConsultationBooking';

@injectable()
export class CreateConsultationBookingUseCase implements ICreateConsultationBookingUseCase {
    constructor(@inject('IConsultationBookingRepository') private bookingRepo: IConsultationBookingRepository) {}

    async execute(bookingData: any): Promise<ConsultationBooking> {
        return this.bookingRepo.create(bookingData);
    }
}
