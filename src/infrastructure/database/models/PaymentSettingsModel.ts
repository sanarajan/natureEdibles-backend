import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentSettings extends Document {
    accountName: string;
    qrCodeImage: string;
    upiId: string;
    phoneNumber: string;
    status: 'Active' | 'Inactive';
    isDefault: boolean;
    usedCount: number;
}

const paymentSettingsSchema = new Schema<IPaymentSettings>({
    accountName: { type: String, required: true },
    qrCodeImage: { type: String, required: true },
    upiId: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    isDefault: { type: Boolean, default: false },
    usedCount: { type: Number, default: 0 }
}, { timestamps: true });

export const PaymentSettingsModel = mongoose.model<IPaymentSettings>('PaymentSettings', paymentSettingsSchema);
