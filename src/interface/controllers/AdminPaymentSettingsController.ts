import { Request, Response } from 'express';
import { PaymentSettingsModel } from '../../infrastructure/database/models/PaymentSettingsModel';
import { OrderModel } from '../../infrastructure/database/models/OrderModel';
import { ConsultationBookingModel } from '../../infrastructure/database/models/ConsultationBookingModel';

export const getPaymentSettings = async (req: Request, res: Response) => {
    try {
        const settingsList = await PaymentSettingsModel.find().sort({ createdAt: -1 }).lean();
        
        // Dynamically calculate usedCount for each account
        const settingsWithUsage = await Promise.all(settingsList.map(async (acc) => {
            const orderCount = await OrderModel.countDocuments({ paymentAccountId: acc._id });
            const bookingCount = await ConsultationBookingModel.countDocuments({ paymentAccountId: acc._id });
            return {
                ...acc,
                status: acc.status || 'Active', // Ensure old accounts have a status
                usedCount: orderCount + bookingCount
            };
        }));

        return res.status(200).json({ success: true, settings: settingsWithUsage });
    } catch (error) {
        console.error('Error fetching payment settings:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const createPaymentSettings = async (req: Request, res: Response) => {
    try {
        const { accountName, qrCodeImage, upiId, phoneNumber, status, isDefault } = req.body;

        if (!accountName || !qrCodeImage || !upiId || !phoneNumber) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (isDefault) {
            await PaymentSettingsModel.updateMany({}, { isDefault: false });
        }

        const newSettings = await PaymentSettingsModel.create({
            accountName,
            qrCodeImage,
            upiId,
            phoneNumber,
            status,
            isDefault
        });

        return res.status(201).json({ success: true, settings: newSettings, message: 'Payment account created successfully' });
    } catch (error) {
        console.error('Error creating payment settings:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updatePaymentSettings = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { accountName, qrCodeImage, upiId, phoneNumber, status, isDefault } = req.body;

        if (!accountName || !qrCodeImage || !upiId || !phoneNumber) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const settings = await PaymentSettingsModel.findById(id);
        if (!settings) {
            return res.status(404).json({ success: false, message: 'Payment account not found' });
        }

        const orderCount = await OrderModel.countDocuments({ paymentAccountId: id });
        const bookingCount = await ConsultationBookingModel.countDocuments({ paymentAccountId: id });
        const actualUsedCount = orderCount + bookingCount;

        if (actualUsedCount > 0) {
            return res.status(403).json({ success: false, message: 'Cannot edit a payment account that has been used' });
        }

        if (isDefault && !settings.isDefault) {
            await PaymentSettingsModel.updateMany({ _id: { $ne: id } }, { isDefault: false });
        }

        settings.accountName = accountName;
        settings.qrCodeImage = qrCodeImage;
        settings.upiId = upiId;
        settings.phoneNumber = phoneNumber;
        settings.status = status;
        settings.isDefault = isDefault;
        await settings.save();

        return res.status(200).json({ success: true, settings, message: 'Payment account updated successfully' });
    } catch (error) {
        console.error('Error updating payment settings:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const deletePaymentSettings = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const settings = await PaymentSettingsModel.findById(id);
        if (!settings) {
            return res.status(404).json({ success: false, message: 'Payment account not found' });
        }

        const orderCount = await OrderModel.countDocuments({ paymentAccountId: id });
        const bookingCount = await ConsultationBookingModel.countDocuments({ paymentAccountId: id });
        const actualUsedCount = orderCount + bookingCount;

        if (actualUsedCount > 0) {
            return res.status(403).json({ success: false, message: 'Cannot delete a payment account that has been used' });
        }

        await PaymentSettingsModel.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: 'Payment account deleted successfully' });
    } catch (error) {
        console.error('Error deleting payment settings:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const setDefaultPaymentSettings = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const settings = await PaymentSettingsModel.findById(id);
        if (!settings) {
            return res.status(404).json({ success: false, message: 'Payment account not found' });
        }

        await PaymentSettingsModel.updateMany({ _id: { $ne: id } }, { isDefault: false });
        settings.isDefault = true;
        await settings.save();

        return res.status(200).json({ success: true, settings, message: 'Default payment account updated successfully' });
    } catch (error) {
        console.error('Error setting default payment settings:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
