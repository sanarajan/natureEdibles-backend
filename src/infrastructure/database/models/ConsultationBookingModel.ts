import mongoose, { Schema, Document } from 'mongoose';

export interface IConsultationBookingDocument extends Document {
    userId: mongoose.Types.ObjectId;
    fullName: string;
    age: number;
    gender: string;
    height: string;
    currentWeight: string;
    maritalStatus: string;
    occupation: string;
    contactNumber: string;
    city: string;
    country: string;
    mainHealthIssue: string;
    yearsFacingIssue: string;
    medicalTreatment: string;
    treatmentDetails: string;
    currentMedicines: string;
    medicalReports: string[];
    tryingToConceiveSince?: string;
    miscarriageHistory?: string;
    ivfIui?: string;
    menstrualCycle?: string;
    diagnosedCondition?: string;
    wakeUpTime: string;
    sleepTime: string;
    exercise: string;
    exerciseType: string;
    stressLevel: string;
    waterIntake: string;
    bowelMovement: string;
    vegetarian: boolean;
    nonVegetarian: boolean;
    teaCoffee: string;
    sugar: string;
    outsideFood: string;
    riceWheat: string;
    foodAllergies: string;
    symptoms: string[];
    readyForNaturalDiet: boolean;
    readyToAvoidSugar: boolean;
    familySupport: boolean;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
    doctorNotes: string;
    recommendedProducts: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    paymentAccountId?: mongoose.Types.ObjectId;
}

const ConsultationBookingSchema = new Schema<IConsultationBookingDocument>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    height: { type: String, required: true },
    currentWeight: { type: String, required: true },
    maritalStatus: { type: String, required: true },
    occupation: { type: String, required: true },
    contactNumber: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    mainHealthIssue: { type: String, required: true },
    yearsFacingIssue: { type: String, required: true },
    medicalTreatment: { type: String, required: true },
    treatmentDetails: { type: String, default: '' },
    currentMedicines: { type: String, default: '' },
    medicalReports: { type: [String], default: [] },
    tryingToConceiveSince: { type: String },
    miscarriageHistory: { type: String },
    ivfIui: { type: String },
    menstrualCycle: { type: String },
    diagnosedCondition: { type: String },
    wakeUpTime: { type: String, required: true },
    sleepTime: { type: String, required: true },
    exercise: { type: String, required: true },
    exerciseType: { type: String, default: '' },
    stressLevel: { type: String, required: true },
    waterIntake: { type: String, required: true },
    bowelMovement: { type: String, required: true },
    vegetarian: { type: Boolean, required: true },
    nonVegetarian: { type: Boolean, required: true },
    teaCoffee: { type: String, required: true },
    sugar: { type: String, required: true },
    outsideFood: { type: String, required: true },
    riceWheat: { type: String, required: true },
    foodAllergies: { type: String, default: '' },
    symptoms: { type: [String], default: [] },
    readyForNaturalDiet: { type: Boolean, required: true },
    readyToAvoidSugar: { type: Boolean, required: true },
    familySupport: { type: Boolean, required: true },
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
    doctorNotes: { type: String, default: '' },
    recommendedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    paymentAccountId: { type: Schema.Types.ObjectId, ref: 'PaymentSettings' }
}, { timestamps: true });

export const ConsultationBookingModel = mongoose.model<IConsultationBookingDocument>('ConsultationBooking', ConsultationBookingSchema);
