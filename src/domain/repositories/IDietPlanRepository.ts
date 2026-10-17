import { DietPlan } from '../entities/DietPlan';

export interface IDietPlanRepository {
    create(dietPlan: DietPlan): Promise<DietPlan>;
    findById(id: string): Promise<DietPlan | null>;
    findByConsultationId(consultationId: string): Promise<DietPlan | null>;
    findByCustomerId(customerId: string): Promise<DietPlan[]>;
    update(id: string, updates: Partial<DietPlan>): Promise<DietPlan | null>;
}
