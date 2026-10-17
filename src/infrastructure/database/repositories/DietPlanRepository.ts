import { injectable } from 'tsyringe';
import { IDietPlanRepository } from '../../../domain/repositories/IDietPlanRepository';
import { DietPlan, DietPlanSection, DietPlanDaySchedule } from '../../../domain/entities/DietPlan';
import { DietPlanModel, IDietPlanDocument } from '../models/DietPlanModel';

@injectable()
export class DietPlanRepository implements IDietPlanRepository {
    async create(dietPlan: DietPlan): Promise<DietPlan> {
        const newPlan = new DietPlanModel(dietPlan);
        const saved = await newPlan.save();
        return this.mapToEntity(saved);
    }

    async findById(id: string): Promise<DietPlan | null> {
        const doc = await DietPlanModel.findById(id);
        return doc ? this.mapToEntity(doc) : null;
    }

    async findByConsultationId(consultationId: string): Promise<DietPlan | null> {
        const doc = await DietPlanModel.findOne({ consultationId });
        return doc ? this.mapToEntity(doc) : null;
    }

    async findByCustomerId(customerId: string): Promise<DietPlan[]> {
        const docs = await DietPlanModel.find({ customerId }).sort({ createdAt: -1 });
        return docs.map(doc => this.mapToEntity(doc));
    }

    async update(id: string, updates: Partial<DietPlan>): Promise<DietPlan | null> {
        const doc = await DietPlanModel.findByIdAndUpdate(id, updates, { new: true });
        return doc ? this.mapToEntity(doc) : null;
    }

    private mapToEntity(doc: IDietPlanDocument): DietPlan {
        const sections = Array.isArray(doc.sections) 
            ? doc.sections.map(s => new DietPlanSection(s.sequence, s.label, s.description))
            : [];
            
        const schedule = Array.isArray(doc.schedule)
            ? doc.schedule.map(d => new DietPlanDaySchedule(
                d.dayIndex,
                d.date,
                d.month,
                d.week,
                d.dayOfWeek,
                d.label,
                d.meals || {
                    breakfast: '',
                    midMorning: '',
                    lunch: '',
                    evening: '',
                    dinner: '',
                    water: '',
                    exercise: '',
                    notes: ''
                },
                d.notes || '',
                !!d.isCompleted
            ))
            : [];

        return new DietPlan(
            doc._id.toString(),
            doc.consultationId.toString(),
            doc.customerId.toString(),
            doc.durationType || 'months',
            doc.durationValue,
            doc.originalStartDate,
            doc.startDate,
            sections,
            doc.createdBy.toString(),
            doc.createdAt,
            doc.updatedAt,
            doc.durationMonths,
            doc.endDate,
            doc.visibilityDate,
            doc.displayMode,
            doc.advanceDays,
            doc.repeatWeek,
            doc.repeatMonth,
            schedule,
            doc.completedDays || []
        );
    }
}
