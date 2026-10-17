import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { 
    ICreateDietPlanUseCase, 
    IUpdateDietPlanUseCase, 
    IGetDietPlanByConsultationIdUseCase 
} from '../../application/interfaces/use-cases/diet-plan/IDietPlanUseCases';

@injectable()
export class AdminDietPlanController {
    constructor(
        @inject('ICreateDietPlanUseCase') private createDietPlanUseCase: ICreateDietPlanUseCase,
        @inject('IUpdateDietPlanUseCase') private updateDietPlanUseCase: IUpdateDietPlanUseCase,
        @inject('IGetDietPlanByConsultationIdUseCase') private getDietPlanByConsultationIdUseCase: IGetDietPlanByConsultationIdUseCase
    ) {}

    async createDietPlan(req: Request, res: Response) {
        try {
            const data = req.body;
            const adminId = (req as any).user.id || (req as any).user.userId || (req as any).user._id;
            const newPlan = await this.createDietPlanUseCase.execute(data, adminId);
            return res.status(201).json({ success: true, message: 'Diet Plan created successfully', data: newPlan });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message || 'Error creating Diet Plan' });
        }
    }

    async updateDietPlan(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const updates = req.body;
            const updatedPlan = await this.updateDietPlanUseCase.execute(id, updates);
            if (!updatedPlan) {
                return res.status(404).json({ success: false, message: 'Diet Plan not found' });
            }
            return res.status(200).json({ success: true, message: 'Diet Plan updated successfully', data: updatedPlan });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message || 'Error updating Diet Plan' });
        }
    }

    async getDietPlanByConsultation(req: Request, res: Response) {
        try {
            const consultationId = req.params.consultationId as string;
            const plan = await this.getDietPlanByConsultationIdUseCase.execute(consultationId);
            if (!plan) {
                return res.status(200).json({ success: true, message: 'Diet Plan not found for this consultation', data: null });
            }
            return res.status(200).json({ success: true, message: 'Diet Plan fetched successfully', data: plan });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message || 'Error fetching Diet Plan' });
        }
    }
}
