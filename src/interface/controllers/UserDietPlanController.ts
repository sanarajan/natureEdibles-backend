import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { 
    IGetDietPlansByCustomerIdUseCase,
    IGetDietPlanByConsultationIdUseCase,
    IUpdateDietPlanUseCase 
} from '../../application/interfaces/use-cases/diet-plan/IDietPlanUseCases';

@injectable()
export class UserDietPlanController {
    constructor(
        @inject('IGetDietPlansByCustomerIdUseCase') private getDietPlansByCustomerIdUseCase: IGetDietPlansByCustomerIdUseCase,
        @inject('IGetDietPlanByConsultationIdUseCase') private getDietPlanByConsultationIdUseCase: IGetDietPlanByConsultationIdUseCase,
        @inject('IUpdateDietPlanUseCase') private updateDietPlanUseCase: IUpdateDietPlanUseCase
    ) {}

    async getMyDietPlans(req: Request, res: Response) {
        try {
            const customerId = (req as any).user.id || (req as any).user._id;
            const plans = await this.getDietPlansByCustomerIdUseCase.execute(customerId);
            return res.status(200).json({ success: true, message: 'Diet Plans fetched successfully', data: plans });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message || 'Error fetching Diet Plans' });
        }
    }

    async getDietPlanByConsultation(req: Request, res: Response) {
        try {
            const customerId = (req as any).user.id || (req as any).user._id;
            const consultationId = req.params.consultationId as string;
            const plan = await this.getDietPlanByConsultationIdUseCase.execute(consultationId);
            
            if (!plan) {
                return res.status(404).json({ success: false, message: 'Diet Plan not found' });
            }

            if (plan.customerId !== customerId.toString()) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            return res.status(200).json({ success: true, message: 'Diet Plan fetched successfully', data: plan });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message || 'Error fetching Diet Plan' });
        }
    }

    async toggleDayCompletion(req: Request, res: Response) {
        try {
            const customerId = (req as any).user.id || (req as any).user._id;
            const consultationId = req.params.consultationId as string;
            const dayKey = req.params.dayKey as string; // could be dayIndex or date or sectionId

            const plan = await this.getDietPlanByConsultationIdUseCase.execute(consultationId);
            if (!plan) {
                return res.status(404).json({ success: false, message: 'Diet Plan not found' });
            }

            if (plan.customerId !== customerId.toString()) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            const currentCompleted = Array.isArray(plan.completedDays) ? [...plan.completedDays] : [];
            const idx = currentCompleted.indexOf(dayKey);
            if (idx > -1) {
                currentCompleted.splice(idx, 1);
            } else {
                currentCompleted.push(dayKey);
            }

            // Also update schedule item isCompleted if exists
            let updatedSchedule = plan.schedule;
            if (Array.isArray(plan.schedule)) {
                updatedSchedule = plan.schedule.map(d => {
                    const match = String(d.dayIndex) === dayKey || d.date === dayKey;
                    if (match) {
                        return { ...d, isCompleted: !d.isCompleted };
                    }
                    return d;
                });
            }

            const updatedPlan = await this.updateDietPlanUseCase.execute(plan.id, {
                completedDays: currentCompleted,
                schedule: updatedSchedule
            });

            return res.status(200).json({ 
                success: true, 
                message: 'Day completion toggled successfully', 
                data: updatedPlan 
            });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message || 'Error updating status' });
        }
    }
}
