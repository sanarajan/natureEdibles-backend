import mongoose, { Schema, Document } from 'mongoose';

export interface IDietPlanSection {
    sequence: number;
    label: string;
    description: string;
}

export interface IDietMeals {
    breakfast: string;
    midMorning: string;
    lunch: string;
    evening: string;
    dinner: string;
    water: string;
    exercise: string;
    notes: string;
}

export interface IDietDaySchedule {
    dayIndex: number;
    date: string;
    month: number;
    week: number;
    dayOfWeek: number;
    label: string;
    meals: IDietMeals;
    notes?: string;
    isCompleted?: boolean;
}

export interface IDietPlanDocument extends Document {
    consultationId: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;
    durationType: "days" | "weeks" | "months";
    durationValue: number;
    originalStartDate: Date;
    startDate: Date;
    sections: IDietPlanSection[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    durationMonths?: number;
    endDate?: Date;
    visibilityDate?: Date;
    displayMode?: "TODAY" | "CURRENT_WEEK" | "NEXT_7_DAYS";
    advanceDays?: number;
    repeatWeek?: boolean;
    repeatMonth?: boolean;
    schedule?: IDietDaySchedule[];
    completedDays?: string[];
}

const DietPlanSectionSchema: Schema = new Schema({
    sequence: { type: Number, required: true },
    label: { type: String, required: true },
    description: { type: String, required: false, default: '' }
}, { _id: false });

const DietMealSchema: Schema = new Schema({
    breakfast: { type: String, default: '' },
    midMorning: { type: String, default: '' },
    lunch: { type: String, default: '' },
    evening: { type: String, default: '' },
    dinner: { type: String, default: '' },
    water: { type: String, default: '' },
    exercise: { type: String, default: '' },
    notes: { type: String, default: '' }
}, { _id: false });

const DietDayScheduleSchema: Schema = new Schema({
    dayIndex: { type: Number, required: true },
    date: { type: String, required: true },
    month: { type: Number, required: true },
    week: { type: Number, required: true },
    dayOfWeek: { type: Number, required: true },
    label: { type: String, required: true },
    meals: { type: DietMealSchema, default: () => ({}) },
    notes: { type: String, default: '' },
    isCompleted: { type: Boolean, default: false }
}, { _id: false });

const DietPlanSchema: Schema = new Schema({
    consultationId: { type: Schema.Types.ObjectId, ref: 'ConsultationBooking', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    durationType: { type: String, enum: ['days', 'weeks', 'months'], required: true, default: 'months' },
    durationValue: { type: Number, required: true },
    originalStartDate: { type: Date, required: true },
    startDate: { type: Date, required: true },
    sections: { type: [DietPlanSectionSchema], required: false, default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    durationMonths: { type: Number, enum: [1, 2, 3, 6], required: false },
    endDate: { type: Date, required: false },
    visibilityDate: { type: Date, required: false },
    displayMode: { type: String, enum: ['TODAY', 'CURRENT_WEEK', 'NEXT_7_DAYS'], default: 'TODAY' },
    advanceDays: { type: Number, default: 0 },
    repeatWeek: { type: Boolean, default: false },
    repeatMonth: { type: Boolean, default: false },
    schedule: { type: [DietDayScheduleSchema], default: [] },
    completedDays: { type: [String], default: [] }
}, { timestamps: true });

export const DietPlanModel = mongoose.models.DietPlan || mongoose.model<IDietPlanDocument>('DietPlan', DietPlanSchema);
