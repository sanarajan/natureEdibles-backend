import { Request, Response } from 'express';
import { PaymentSettingsModel } from '../../infrastructure/database/models/PaymentSettingsModel';

export const getPaymentSettings = async (req: Request, res: Response) => {
    try {
        const settings = await PaymentSettingsModel.findOne();
        return res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error('Error fetching payment settings:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updatePaymentSettings = async (req: Request, res: Response) => {
    try {
        const { qrCodeImage, upiId, phoneNumber } = req.body;

        if (!qrCodeImage || !upiId || !phoneNumber) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        let settings = await PaymentSettingsModel.findOne();
        if (settings) {
            settings.qrCodeImage = qrCodeImage;
            settings.upiId = upiId;
            settings.phoneNumber = phoneNumber;
            await settings.save();
        } else {
            settings = await PaymentSettingsModel.create({
                qrCodeImage,
                upiId,
                phoneNumber
            });
        }

        return res.status(200).json({ success: true, settings, message: 'Payment settings updated successfully' });
    } catch (error) {
        console.error('Error updating payment settings:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
