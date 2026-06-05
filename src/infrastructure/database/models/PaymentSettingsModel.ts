import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentSettings extends Document {
    qrCodeImage: string;
    upiId: string;
    phoneNumber: string;
}

const paymentSettingsSchema = new Schema<IPaymentSettings>({
    qrCodeImage: { type: String, required: true },
    upiId: { type: String, required: true },
    phoneNumber: { type: String, required: true }
}, { timestamps: true });

export const PaymentSettingsModel = mongoose.model<IPaymentSettings>('PaymentSettings', paymentSettingsSchema);
