import { inject, injectable } from 'tsyringe';
import { ICreateConsultationBookingUseCase } from '../../interfaces/use-cases/consultation/IConsultationBookingUseCases';
import { IConsultationBookingRepository } from '../../../domain/repositories/IConsultationBookingRepository';
import { ConsultationBooking } from '../../../domain/entities/ConsultationBooking';
import cloudinary from '../../../infrastructure/config/cloudinary';
import { IEmailService } from '../../../domain/services/IEmailService';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import type { INotificationRepository } from '../../../domain/repositories/INotificationRepository';

@injectable()
export class CreateConsultationBookingUseCase implements ICreateConsultationBookingUseCase {
    constructor(
        @inject('IConsultationBookingRepository') private bookingRepo: IConsultationBookingRepository,
        @inject('IEmailService') private emailService: IEmailService,
        @inject('IUserRepository') private userRepository: IUserRepository,
        @inject('INotificationRepository') private notificationRepo: INotificationRepository
    ) {}

    async execute(bookingData: any): Promise<ConsultationBooking> {
        if (bookingData.medicalReports && Array.isArray(bookingData.medicalReports)) {
            const uploadedReports: string[] = [];
            for (const report of bookingData.medicalReports) {
                if (typeof report === 'string' && report.startsWith('data:')) {
                    try {
                        const uploadRes = await cloudinary.uploader.upload(report, {
                            folder: 'natureEdibles/consultations',
                            resource_type: 'auto'
                        });
                        uploadedReports.push(uploadRes.secure_url);
                    } catch (error) {
                        console.error('Error uploading medical report:', error);
                        throw new Error('Failed to upload medical report.');
                    }
                } else if (typeof report === 'string') {
                    uploadedReports.push(report);
                }
            }
            bookingData.medicalReports = uploadedReports;
        }

        const newBooking = await this.bookingRepo.create(bookingData);

        if (newBooking) {
            // Send Admin In-App Notification
            try {
                // Find admin user by role 'ADMIN' which matches the auth middleware rule
                const admins = await this.userRepository.findByRole('ADMIN');
                
                let adminId = process.env.DEFAULT_ADMIN_ID; 
                
                if (!adminId && admins && admins.length > 0) {
                    adminId = admins[0].id;
                }
                
                if (adminId) {
                    await this.notificationRepo.create({
                        userId: adminId,
                        type: 'NEW_CONSULTATION_BOOKING',
                        title: 'New Consultation Booking',
                        message: `${newBooking.fullName || 'A customer'} submitted a consultation booking for ${newBooking.appointmentDate} at ${newBooking.appointmentTime}.`,
                        relatedId: newBooking.id
                    });
                } else {
                    console.warn('[CreateConsultationBookingUseCase] No Admin ID found to send in-app notification.');
                }
            } catch (error) {
                console.error('Error creating admin notification:', error);
            }

            try {
                const user = await this.userRepository.findById(newBooking.userId);
                const userEmail = user?.email || 'N/A';
                
                const adminEmail = process.env.ADMIN_EMAIL || 'admin@natureedibles.com';
                
                // Add user email to details payload for the admin email
                const detailsForAdmin = {
                    ...newBooking,
                    userEmail
                };

                await this.emailService.sendNewConsultationAdminEmail(adminEmail, detailsForAdmin);
            } catch (error) {
                console.error('Error in CreateConsultationBookingUseCase sending admin email:', error);
            }
        }

        return newBooking;
    }
}
