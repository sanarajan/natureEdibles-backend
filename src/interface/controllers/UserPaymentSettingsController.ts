import { Request, Response } from 'express';
import { PaymentSettingsModel } from '../../infrastructure/database/models/PaymentSettingsModel';

export const getPaymentSettings = async (req: Request, res: Response) => {
    try {
        let settings = await PaymentSettingsModel.findOne();
        if (!settings) {
            settings = new PaymentSettingsModel({
                qrCodeImage: '/images/qrcode.jpeg',
                upiId: 'sanamol87@okaxis',
                phoneNumber: 'Not provided'
            });
            await settings.save();
        } else if (settings.upiId === 'pending@upi' || settings.qrCodeImage.includes('qrserver') || settings.qrCodeImage.includes('placeholder')) {
            settings.qrCodeImage = '/images/qrcode.jpeg';
            settings.upiId = 'sanamol87@okaxis';
            await settings.save();
        }
        return res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error('Error fetching payment settings:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
