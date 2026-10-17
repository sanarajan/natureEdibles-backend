import { DietPlan } from '../../../../domain/entities/DietPlan';

export interface ICreateDietPlanUseCase {
    execute(data: any, createdBy: string): Promise<DietPlan>;
}

export interface IUpdateDietPlanUseCase {
    execute(id: string, updates: Partial<DietPlan>): Promise<DietPlan | null>;
}

export interface IGetDietPlanByConsultationIdUseCase {
    execute(consultationId: string): Promise<DietPlan | null>;
}

export interface IGetDietPlansByCustomerIdUseCase {
    execute(customerId: string): Promise<DietPlan[]>;
}
