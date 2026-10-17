import { inject, injectable } from 'tsyringe';
import { IGetDietPlanByConsultationIdUseCase } from '../../interfaces/use-cases/diet-plan/IDietPlanUseCases';
import { IDietPlanRepository } from '../../../domain/repositories/IDietPlanRepository';
import { DietPlan } from '../../../domain/entities/DietPlan';

@injectable()
export class GetDietPlanByConsultationIdUseCase implements IGetDietPlanByConsultationIdUseCase {
    constructor(
        @inject('IDietPlanRepository') private dietPlanRepo: IDietPlanRepository
    ) {}

    async execute(consultationId: string): Promise<DietPlan | null> {
        return await this.dietPlanRepo.findByConsultationId(consultationId);
    }
}
