import { inject, injectable } from 'tsyringe';
import { IUpdateDietPlanUseCase } from '../../interfaces/use-cases/diet-plan/IDietPlanUseCases';
import { IDietPlanRepository } from '../../../domain/repositories/IDietPlanRepository';
import { DietPlan } from '../../../domain/entities/DietPlan';
import { calculateSubscriptionEndDate, parseDateOnly } from '../../../domain/utils/subscriptionUtils';

@injectable()
export class UpdateDietPlanUseCase implements IUpdateDietPlanUseCase {
    constructor(
        @inject('IDietPlanRepository') private dietPlanRepo: IDietPlanRepository
    ) {}

    async execute(id: string, updates: Partial<DietPlan>): Promise<DietPlan | null> {
        const existing = await this.dietPlanRepo.findById(id);
        if (!existing) {
            throw new Error('Diet Plan not found');
        }

        const effectiveStartDate = updates.startDate 
            ? parseDateOnly(updates.startDate) 
            : parseDateOnly(existing.startDate);

        const originalStartDate = parseDateOnly(existing.originalStartDate);

        if (updates.startDate) {
            if (effectiveStartDate.getTime() < originalStartDate.getTime()) {
                throw new Error('Edited Start Date cannot be earlier than the Original Start Date');
            }
        }

        // Subscription duration handling
        if (updates.durationMonths) {
            const months = Number(updates.durationMonths);
            if (![1, 2, 3, 6].includes(months)) {
                throw new Error('Subscription duration must be 1, 2, 3, or 6 months');
            }
            updates.durationType = 'months';
            updates.durationValue = months;
            updates.endDate = calculateSubscriptionEndDate(effectiveStartDate, months);
        } else if (updates.startDate && existing.durationMonths) {
            updates.endDate = calculateSubscriptionEndDate(effectiveStartDate, existing.durationMonths);
        }

        // Visibility date validation
        if (updates.visibilityDate) {
            const visDate = parseDateOnly(updates.visibilityDate);
            if (visDate.getTime() > effectiveStartDate.getTime()) {
                throw new Error('Plan visibility date cannot be after the subscription start date');
            }
            updates.visibilityDate = visDate;
        }

        // Display mode validation
        if (updates.displayMode) {
            const validDisplayModes = ['TODAY', 'CURRENT_WEEK', 'NEXT_7_DAYS'];
            if (!validDisplayModes.includes(updates.displayMode)) {
                updates.displayMode = 'TODAY';
            }
        }

        if (updates.advanceDays !== undefined) {
            updates.advanceDays = Math.max(0, Number(updates.advanceDays) || 0);
        }

        const isSubscription = Boolean(
            updates.durationMonths || 
            existing.durationMonths || 
            (updates.schedule && updates.schedule.length > 0) || 
            (existing.schedule && existing.schedule.length > 0)
        );

        if (!isSubscription) {
            if (updates.sections && updates.durationValue) {
                if (updates.sections.length > updates.durationValue) {
                    throw new Error(`Number of sections cannot exceed duration value (${updates.durationValue})`);
                }
            } else if (updates.sections) {
                if (updates.sections.length > existing.durationValue) {
                    throw new Error(`Number of sections cannot exceed duration value (${existing.durationValue})`);
                }
            }
        }

        // Do not allow overwriting originalStartDate, consultationId, customerId
        if ('originalStartDate' in updates) delete updates.originalStartDate;
        if ('consultationId' in updates) delete updates.consultationId;
        if ('customerId' in updates) delete updates.customerId;

        return await this.dietPlanRepo.update(id, updates);
    }
}
