import { inject, injectable } from 'tsyringe';
import { IGetConsultationByIdUseCase } from '../../interfaces/use-cases/consultation/IConsultationBookingUseCases';
import { IConsultationBookingRepository } from '../../../domain/repositories/IConsultationBookingRepository';
import { ConsultationBooking } from '../../../domain/entities/ConsultationBooking';

@injectable()
export class GetConsultationByIdUseCase implements IGetConsultationByIdUseCase {
    constructor(@inject('IConsultationBookingRepository') private bookingRepo: IConsultationBookingRepository) {}

    async execute(id: string): Promise<ConsultationBooking | null> {
        return this.bookingRepo.findById(id);
    }
}
