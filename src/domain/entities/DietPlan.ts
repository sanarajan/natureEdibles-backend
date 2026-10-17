export class DietPlanSection {
    constructor(
        public sequence: number,
        public label: string,
        public description: string
    ) {}
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

export class DietPlanDaySchedule {
    constructor(
        public dayIndex: number,
        public date: string,
        public month: number,
        public week: number,
        public dayOfWeek: number,
        public label: string,
        public meals: IDietMeals,
        public notes: string = '',
        public isCompleted: boolean = false
    ) {}
}

export class DietPlan {
    constructor(
        public readonly id: string,
        public consultationId: string,
        public customerId: string,
        public durationType: "days" | "weeks" | "months",
        public durationValue: number,
        public originalStartDate: Date,
        public startDate: Date,
        public sections: DietPlanSection[],
        public createdBy: string,
        public readonly createdAt: Date = new Date(),
        public updatedAt: Date = new Date(),
        public durationMonths?: number,
        public endDate?: Date,
        public visibilityDate?: Date,
        public displayMode?: "TODAY" | "CURRENT_WEEK" | "NEXT_7_DAYS",
        public advanceDays?: number,
        public repeatWeek?: boolean,
        public repeatMonth?: boolean,
        public schedule?: DietPlanDaySchedule[],
        public completedDays?: string[]
    ) {}
}
