export interface IEmailService {
    sendVerificationEmail(email: string, otp: string): Promise<void>;
    sendWelcomeWithReferralEmail(email: string, referralId: string, offerPercentage: number, joiningDiscount: number): Promise<void>;
    sendShippingEmail(email: string, orderId: string, productName: string, agencyName: string, trackingNumber: string, trackingUrl: string): Promise<void>;
    sendConsultationApprovedEmail(email: string, name: string, date: string, time: string): Promise<void>;
    sendConsultationRejectedEmail(email: string, name: string, reason: string, date: string, time: string, paymentStatus: string): Promise<void>;
    sendConsultationRefundedEmail(email: string, name: string, date: string): Promise<void>;
    sendNewConsultationAdminEmail(adminEmail: string, details: any): Promise<void>;
}
