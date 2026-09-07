import { inject, injectable } from 'tsyringe';
import { IUpdateConsultationStatusUseCase } from '../../interfaces/use-cases/consultation/IConsultationBookingUseCases';
import { IConsultationBookingRepository } from '../../../domain/repositories/IConsultationBookingRepository';
import { ConsultationBooking } from '../../../domain/entities/ConsultationBooking';
import { IEmailService } from '../../../domain/services/IEmailService';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import type { INotificationRepository } from '../../../domain/repositories/INotificationRepository';

@injectable()
export class UpdateConsultationStatusUseCase implements IUpdateConsultationStatusUseCase {
    constructor(
        @inject('IConsultationBookingRepository') private bookingRepo: IConsultationBookingRepository,
        @inject('IEmailService') private emailService: IEmailService,
        @inject('IUserRepository') private userRepository: IUserRepository,
        @inject('INotificationRepository') private notificationRepo: INotificationRepository
    ) {}

    async execute(id: string, updates: Partial<ConsultationBooking>): Promise<ConsultationBooking | null> {
        const existing = await this.bookingRepo.findById(id);
        if (!existing) {
            throw new Error('Consultation not found');
        }

        // Only enforce validation if consultation status is being updated
        if (updates.status && updates.status !== existing.status) {
            if (existing.status === 'APPROVED' || existing.status === 'REJECTED') {
                throw new Error('This consultation booking status has already been finalized.');
            }
            if (updates.status === 'APPROVED') {
                updates.approvedAt = new Date();
            } else if (updates.status === 'REJECTED') {
                updates.rejectedAt = new Date();
            }
        }

        // Enforce payment status transitions
        if (updates.paymentStatus && updates.paymentStatus !== existing.paymentStatus) {
            if (updates.paymentStatus === 'REFUNDED') {
                if (existing.status !== 'REJECTED' || existing.paymentStatus !== 'REFUND_PENDING') {
                    throw new Error('Mark as Refunded is allowed only when consultation is REJECTED and payment is REFUND_PENDING.');
                }
            } else if (updates.paymentStatus === 'REFUND_PENDING') {
                const isNewRejectOfPaid = updates.status === 'REJECTED' && existing.paymentStatus === 'PAID';
                const isManualFixOfOldRecord = existing.status === 'REJECTED' && existing.paymentStatus === 'PENDING' && (!updates.status || updates.status === 'REJECTED');

                if (!isNewRejectOfPaid && !isManualFixOfOldRecord) {
                     throw new Error('REFUND_PENDING is allowed only when rejecting a PAID booking or manually fixing an old REJECTED booking.');
                }
            }
        }

        const updatedBooking = await this.bookingRepo.update(id, updates);

        if (updatedBooking) {
            // Notifications & Emails (safely caught to avoid rolling back DB)
            try {
                const userId = updatedBooking.userId;

                // Handle Consultation Status Changes
                if (updates.status === 'APPROVED') {
                    console.log(`[UpdateConsultation] Creating APPROVED notification for userId: ${userId}`);
                    await this.notificationRepo.create({
                        userId,
                        type: 'CONSULTATION_APPROVED',
                        title: 'Consultation Approved',
                        message: `Your consultation scheduled for ${updatedBooking.appointmentDate} at ${updatedBooking.appointmentTime} has been approved.`,
                        relatedId: id
                    });
                } else if (updates.status === 'REJECTED') {
                    console.log(`[UpdateConsultation] Creating REJECTED notification for userId: ${userId}`);
                    await this.notificationRepo.create({
                        userId,
                        type: 'CONSULTATION_REJECTED',
                        title: 'Consultation Rejected',
                        message: `Your consultation was rejected. Reason: ${updatedBooking.rejectionReason || 'No reason provided.'}`,
                        relatedId: id
                    });
                }

                // Handle Payment Status Changes
                if (updates.paymentStatus === 'REFUNDED') {
                    console.log(`[UpdateConsultation] Creating REFUNDED notification for userId: ${userId}`);
                    await this.notificationRepo.create({
                        userId,
                        type: 'CONSULTATION_REFUNDED',
                        title: 'Refund Completed',
                        message: `Your consultation payment refund has been completed.`,
                        relatedId: id
                    });
                } else if (updates.paymentStatus === 'REFUND_PENDING' && existing.paymentStatus !== 'REFUND_PENDING') {
                    console.log(`[UpdateConsultation] Creating REFUND_PENDING notification for userId: ${userId}`);
                    await this.notificationRepo.create({
                        userId,
                        type: 'CONSULTATION_REFUND_PENDING',
                        title: 'Refund Pending',
                        message: `Your consultation payment refund is pending.`,
                        relatedId: id
                    });
                }
            } catch (error) {
                console.error('[UpdateConsultation] Error creating notification:', error);
            }

            try {
                console.log(`[UpdateConsultation] Looking up user by ID: ${updatedBooking.userId} for emails`);
                const user = await this.userRepository.findById(updatedBooking.userId);
                if (user && user.email) {
                    console.log(`[UpdateConsultation] Found user email: ${user.email}, proceeding to send status emails`);
                    if (updates.status === 'APPROVED') {
                        await this.emailService.sendConsultationApprovedEmail(
                            user.email,
                            updatedBooking.fullName,
                            updatedBooking.appointmentDate,
                            updatedBooking.appointmentTime
                        );
                    } else if (updates.status === 'REJECTED') {
                        await this.emailService.sendConsultationRejectedEmail(
                            user.email,
                            updatedBooking.fullName,
                            updatedBooking.rejectionReason || 'No reason provided',
                            updatedBooking.appointmentDate,
                            updatedBooking.appointmentTime,
                            updatedBooking.paymentStatus || 'PENDING'
                        );
                    }
                    
                    if (updates.paymentStatus === 'REFUNDED') {
                        await this.emailService.sendConsultationRefundedEmail(
                            user.email,
                            updatedBooking.fullName,
                            updatedBooking.appointmentDate
                        );
                    }
                } else {
                    console.warn(`[UpdateConsultation] WARNING: User not found or has no email for ID: ${updatedBooking.userId}. Emails skipped.`);
                }
            } catch (error) {
                console.error('[UpdateConsultation] Error sending email:', error);
            }
        }

        return updatedBooking;
    }
}
