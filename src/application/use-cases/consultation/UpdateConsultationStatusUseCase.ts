import { inject, injectable } from 'tsyringe';
import { IUpdateConsultationStatusUseCase } from '../../interfaces/use-cases/consultation/IConsultationBookingUseCases';
import { IConsultationBookingRepository } from '../../../domain/repositories/IConsultationBookingRepository';
import { ConsultationBooking } from '../../../domain/entities/ConsultationBooking';

@injectable()
export class UpdateConsultationStatusUseCase implements IUpdateConsultationStatusUseCase {
    constructor(@inject('IConsultationBookingRepository') private bookingRepo: IConsultationBookingRepository) {}

    async execute(id: string, updates: Partial<ConsultationBooking>): Promise<ConsultationBooking | null> {
        return this.bookingRepo.update(id, updates);
    }
}
