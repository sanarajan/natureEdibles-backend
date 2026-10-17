import { inject, injectable } from 'tsyringe';
import { IGetDietPlansByCustomerIdUseCase } from '../../interfaces/use-cases/diet-plan/IDietPlanUseCases';
import { IDietPlanRepository } from '../../../domain/repositories/IDietPlanRepository';
import { DietPlan } from '../../../domain/entities/DietPlan';

@injectable()
export class GetDietPlansByCustomerIdUseCase implements IGetDietPlansByCustomerIdUseCase {
    constructor(
        @inject('IDietPlanRepository') private dietPlanRepo: IDietPlanRepository
    ) {}

    async execute(customerId: string): Promise<DietPlan[]> {
        return await this.dietPlanRepo.findByCustomerId(customerId);
    }
}
