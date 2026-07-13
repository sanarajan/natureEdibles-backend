import { Request, Response } from 'express';
import { PaymentSettingsModel } from '../../infrastructure/database/models/PaymentSettingsModel';

export const getPaymentSettings = async (req: Request, res: Response) => {
    try {
        const settings = await PaymentSettingsModel.findOne({ status: 'Active', isDefault: true });
        if (!settings) {
            return res.status(200).json({ success: true, settings: null, message: 'No active default payment account found.' });
        }
        return res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error('Error fetching payment settings:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
