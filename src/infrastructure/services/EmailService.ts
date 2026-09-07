import nodemailer from 'nodemailer';
import { injectable } from 'tsyringe';
import { IEmailService } from '../../domain/services/IEmailService';

@injectable()
export class EmailService implements IEmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER || 'test@example.com',
                pass: process.env.EMAIL_PASS || 'password',
            },
        });
    }

    async sendVerificationEmail(email: string, otp: string): Promise<void> {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const verificationLink = `${clientUrl}/verify-email?email=${encodeURIComponent(email)}&token=${otp}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@nature.com',
            to: email,
            subject: 'Verify Your Email Address',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Email Verification</h2>
                    <p>Thank you for registering. Please click the button below to verify your email address:</p>
                    <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                    <p>Or copy and paste this link in your browser: <br/> <a href="${verificationLink}">${verificationLink}</a></p>
                    <p>This link will expire in 5 minutes.</p>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `,
        };

        try {
            if (process.env.EMAIL_USER) {
                await this.transporter.sendMail(mailOptions);
                console.log(`Verification email sent to ${email}`);
            } else {
                console.log(`[DEV MODE] Verification Link for ${email}:\n => ${verificationLink}`);
            }
        } catch (error) {
            console.error('Error sending verification email:', error);
            // In dev mode gracefully fallback to console
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[DEV MODE] Verification Link for ${email}:\n => ${verificationLink}`);
                return;
            }
            throw new Error('Failed to send verification email');
        }
    }

    async sendWelcomeWithReferralEmail(email: string, referralId: string, offerPercentage: number, joiningDiscount: number): Promise<void> {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@nature.com',
            to: email,
            subject: 'Welcome to Natural Edibles - Here is your Referral Code!',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Welcome to Natural Edibles!</h2>
                    <p>Your email has been successfully verified.</p>
                    <p>We are excited to share your unique referral code:</p>
                    <h3 style="background-color: #f4f4f4; padding: 10px; display: inline-block; border-radius: 5px; color: #333;">${referralId}</h3>
                    <p>Share this code with your friends!</p>
                    <p>When they use your code, <strong>they get ${joiningDiscount}% off</strong> their first order, and <strong>you earn a ${offerPercentage}%</strong> reward!</p>
                    <a href="${clientUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;">Start Shopping</a>
                </div>
            `,
        };

        try {
            if (process.env.EMAIL_USER) {
                await this.transporter.sendMail(mailOptions);
                console.log(`Welcome/Referral email sent to ${email}`);
            } else {
                console.log(`[DEV MODE] Welcome/Referral email for ${email}:\n Referral Code => ${referralId} with ${offerPercentage}%`);
            }
        } catch (error) {
            console.error('Error sending welcome/referral email:', error);
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[DEV MODE] Welcome/Referral email for ${email}:\n Referral Code => ${referralId} with ${offerPercentage}%`);
                return;
            }
            throw new Error('Failed to send welcome/referral email');
        }
    }

    async sendShippingEmail(email: string, orderId: string, productName: string, agencyName: string, trackingNumber: string, trackingUrl: string): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@nature.com',
            to: email,
            subject: `Your order item has been shipped - ${orderId}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4CAF50;">Good News! Your Item is on its Way</h2>
                    <p>Hello,</p>
                    <p>We are happy to inform you that an item from your order <strong>${orderId}</strong> has been shipped.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Product:</strong> ${productName}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Shipping Agency:</strong> ${agencyName}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
                    </div>

                    <p>You can track your package using the link below:</p>
                    <a href="${trackingUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Your Order</a>
                    
                    <p style="margin-top: 20px;">Or copy and paste this link into your browser:<br/>
                    <a href="${trackingUrl}">${trackingUrl}</a></p>
                    
                    <p>Thank you for shopping with Natural Edibles!</p>
                </div>
            `,
        };

        try {
            if (process.env.EMAIL_USER) {
                await this.transporter.sendMail(mailOptions);
                console.log(`Shipping email sent to ${email} for order ${orderId}`);
            } else {
                console.log(`[DEV MODE] Shipping Email for ${email}:\n Product => ${productName}\n Agency => ${agencyName}\n Tracking => ${trackingNumber}\n URL => ${trackingUrl}`);
            }
        } catch (error) {
            console.error('Error sending shipping email:', error);
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[DEV MODE] Shipping Email for ${email}:\n Product => ${productName}\n Agency => ${agencyName}\n Tracking => ${trackingNumber}\n URL => ${trackingUrl}`);
                return;
            }
            throw new Error('Failed to send shipping email');
        }
    }

    async sendConsultationApprovedEmail(email: string, name: string, date: string, time: string): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@nature.com',
            to: email,
            subject: 'Consultation Booking Approved',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4CAF50;">Consultation Approved</h2>
                    <p>Hello ${name},</p>
                    <p>Your consultation booking for <strong>${date}</strong> at <strong>${time}</strong> has been approved.</p>
                    <p>We look forward to helping you with your health journey.</p>
                    <p>Thank you,</p>
                    <p>Natural Edibles Team</p>
                </div>
            `,
        };

        try {
            if (process.env.EMAIL_USER) {
                await this.transporter.sendMail(mailOptions);
                console.log(`Consultation approval email sent to ${email}`);
            } else {
                console.log(`[DEV MODE] Consultation Approval Email for ${email}`);
            }
        } catch (error) {
            console.error('Error sending consultation approval email:', error);
            if (process.env.NODE_ENV !== 'production') return;
            throw new Error('Failed to send consultation approval email');
        }
    }

    async sendConsultationRejectedEmail(email: string, name: string, reason: string, date: string, time: string, paymentStatus: string): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@nature.com',
            to: email,
            subject: 'Consultation Rejected',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #d9534f;">Consultation Rejected</h2>
                    <p>Hello ${name},</p>
                    <p>We regret to inform you that your consultation booking for <strong>${date}</strong> at <strong>${time}</strong> could not be approved at this time.</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    ${paymentStatus === 'REFUND_PENDING' ? '<p><strong>Your refund is pending and will be processed.</strong></p>' : ''}
                    <p>If you have any questions, please contact our support team.</p>
                    <p>Thank you,</p>
                    <p>Natural Edibles Team</p>
                </div>
            `,
        };

        try {
            if (process.env.EMAIL_USER) {
                await this.transporter.sendMail(mailOptions);
                console.log(`Consultation rejection email sent to ${email}`);
            } else {
                console.log(`[DEV MODE] Consultation Rejection Email for ${email}`);
            }
        } catch (error) {
            console.error('Error sending consultation rejection email:', error);
            if (process.env.NODE_ENV !== 'production') return;
            throw new Error('Failed to send consultation rejection email');
        }
    }

    async sendConsultationRefundedEmail(email: string, name: string, date: string): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@nature.com',
            to: email,
            subject: 'Consultation Refund Completed',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4CAF50;">Refund Completed</h2>
                    <p>Hello ${name},</p>
                    <p>Your payment refund for the consultation on ${date} has been successfully completed.</p>
                    <p>If you have any questions, please contact our support team.</p>
                    <p>Thank you,</p>
                    <p>Natural Edibles Team</p>
                </div>
            `,
        };

        try {
            if (process.env.EMAIL_USER) {
                await this.transporter.sendMail(mailOptions);
                console.log(`Consultation refund email sent to ${email}`);
            } else {
                console.log(`[DEV MODE] Consultation Refund Email for ${email}`);
            }
        } catch (error) {
            console.error('Error sending consultation refund email:', error);
            if (process.env.NODE_ENV !== 'production') return;
            throw new Error('Failed to send consultation refund email');
        }
    }

    async sendNewConsultationAdminEmail(adminEmail: string, details: any): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@nature.com',
            to: adminEmail,
            subject: 'New Consultation Booking Paid',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4CAF50;">New Consultation Paid</h2>
                    <p>A new consultation has successfully submitted payment details and is awaiting verification.</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Customer Name:</strong> ${details.fullName}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Phone:</strong> ${details.contactNumber || 'N/A'}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Consultation Date:</strong> ${details.appointmentDate}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Time:</strong> ${details.appointmentTime}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Health Issue:</strong> ${details.mainHealthIssue || 'N/A'}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Payment Status:</strong> ${details.paymentStatus}</p>
                        <p style="margin: 5px 0 0 0;"><strong>UTR Reference:</strong> ${details.upiReference}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Booking Ref:</strong> ${details._id}</p>
                    </div>
                    <p>Please log in to the admin panel to review and approve/reject this booking.</p>
                </div>
            `,
        };

        try {
            if (process.env.EMAIL_USER) {
                await this.transporter.sendMail(mailOptions);
                console.log(`Admin notification email sent to ${adminEmail}`);
            } else {
                console.log(`[DEV MODE] Admin Notification Email for ${adminEmail}`);
            }
        } catch (error) {
            console.error('Error sending admin notification email:', error);
            if (process.env.NODE_ENV !== 'production') return;
            throw new Error('Failed to send admin notification email');
        }
    }
}
