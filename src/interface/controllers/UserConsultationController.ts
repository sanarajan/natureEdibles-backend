import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { ICreateConsultationBookingUseCase, IGetAvailableSlotsUseCase, IGetUserConsultationsUseCase } from '../../application/interfaces/use-cases/consultation/IConsultationBookingUseCases';
import { IGetConsultationSettingsUseCase } from '../../application/interfaces/use-cases/consultation/IConsultationSettingsUseCases';

@injectable()
export class UserConsultationController {
    constructor(
        @inject('ICreateConsultationBookingUseCase') private createBookingUseCase: ICreateConsultationBookingUseCase,
        @inject('IGetAvailableSlotsUseCase') private getAvailableSlotsUseCase: IGetAvailableSlotsUseCase,
        @inject('IGetUserConsultationsUseCase') private getUserConsultationsUseCase: IGetUserConsultationsUseCase,
        @inject('IGetConsultationSettingsUseCase') private getConsultationSettingsUseCase: IGetConsultationSettingsUseCase
    ) {}

    async createBooking(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const bookingData = { ...req.body, userId };
            const booking = await this.createBookingUseCase.execute(bookingData);
            return res.status(201).json({ success: true, message: 'Consultation booked successfully', data: booking });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || 'Error booking consultation' });
        }
    }

    async getAvailableSlots(req: Request, res: Response) {
        try {
            const { date } = req.query;
            if (!date || typeof date !== 'string') {
                return res.status(400).json({ success: false, message: 'Date is required' });
            }
            const result = await this.getAvailableSlotsUseCase.execute(date);
            
            if (result.slots.length === 0) {
                return res.status(200).json({ success: true, message: result.message || 'No slots available', data: [] });
            }

            return res.status(200).json({ success: true, message: 'Available slots fetched successfully', data: result.slots });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || 'Error fetching slots' });
        }
    }

    async getUserConsultations(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const consultations = await this.getUserConsultationsUseCase.execute(userId);
            return res.status(200).json({ success: true, message: 'Consultations fetched successfully', data: consultations });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || 'Error fetching consultations' });
        }
    }

    async getSettings(req: Request, res: Response) {
        try {
            const settings = await this.getConsultationSettingsUseCase.execute();
            return res.status(200).json({ success: true, message: 'Settings fetched successfully', data: settings });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || 'Error fetching settings' });
        }
    }
}
