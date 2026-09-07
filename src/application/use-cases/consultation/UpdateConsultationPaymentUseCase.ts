import { inject, injectable } from 'tsyringe';
import { IUpdateConsultationPaymentUseCase } from '../../interfaces/use-cases/consultation/IConsultationBookingUseCases';
import { IConsultationBookingRepository } from '../../../domain/repositories/IConsultationBookingRepository';
import { ConsultationBooking } from '../../../domain/entities/ConsultationBooking';
import { IEmailService } from '../../../domain/services/IEmailService';

@injectable()
export class UpdateConsultationPaymentUseCase implements IUpdateConsultationPaymentUseCase {
    constructor(
        @inject('IConsultationBookingRepository') private bookingRepo: IConsultationBookingRepository,
        @inject('IEmailService') private emailService: IEmailService
    ) {}

    async execute(id: string, upiReference: string): Promise<ConsultationBooking | null> {
        const updatedBooking = await this.bookingRepo.update(id, { 
            upiReference, 
            paymentStatus: 'PAID' 
        });

        if (updatedBooking) {
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@natureedibles.com';
            this.emailService.sendNewConsultationAdminEmail(adminEmail, updatedBooking).catch(console.error);
        }

        return updatedBooking;
    }
}
