import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IGetAdminConsultationsUseCase, IUpdateConsultationStatusUseCase, IGetConsultationByIdUseCase } from '../../application/interfaces/use-cases/consultation/IConsultationBookingUseCases';
import { IGetConsultationSettingsUseCase, IUpdateConsultationSettingsUseCase } from '../../application/interfaces/use-cases/consultation/IConsultationSettingsUseCases';

@injectable()
export class AdminConsultationController {
    constructor(
        @inject('IGetAdminConsultationsUseCase') private getAdminConsultationsUseCase: IGetAdminConsultationsUseCase,
        @inject('IUpdateConsultationStatusUseCase') private updateConsultationStatusUseCase: IUpdateConsultationStatusUseCase,
        @inject('IGetConsultationSettingsUseCase') private getConsultationSettingsUseCase: IGetConsultationSettingsUseCase,
        @inject('IUpdateConsultationSettingsUseCase') private updateConsultationSettingsUseCase: IUpdateConsultationSettingsUseCase,
        @inject('IGetConsultationByIdUseCase') private getConsultationByIdUseCase: IGetConsultationByIdUseCase
    ) {}

    async getConsultations(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as string;
            const search = req.query.search as string;

            const filters = { status, search };
            const result = await this.getAdminConsultationsUseCase.execute(filters, page, limit);
            return res.status(200).json({ success: true, message: 'Consultations fetched successfully', data: result });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || 'Error fetching consultations' });
        }
    }

    async getConsultationById(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const consultation = await this.getConsultationByIdUseCase.execute(id);
            if (!consultation) {
                return res.status(404).json({ success: false, message: 'Consultation not found' });
            }
            return res.status(200).json({ success: true, message: 'Consultation fetched successfully', data: consultation });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || 'Error fetching consultation' });
        }
    }

    async updateConsultation(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const updates = req.body;
            const updated = await this.updateConsultationStatusUseCase.execute(id, updates);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Consultation not found' });
            }
            return res.status(200).json({ success: true, message: 'Consultation updated successfully', data: updated });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || 'Error updating consultation' });
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

    async updateSettings(req: Request, res: Response) {
        try {
            const settings = req.body;
            const updated = await this.updateConsultationSettingsUseCase.execute(settings);
            return res.status(200).json({ success: true, message: 'Settings updated successfully', data: updated });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || 'Error updating settings' });
        }
    }
}
