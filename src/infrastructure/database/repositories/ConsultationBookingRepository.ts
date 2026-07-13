import { injectable } from 'tsyringe';
import { IConsultationBookingRepository } from '../../../domain/repositories/IConsultationBookingRepository';
import { ConsultationBooking } from '../../../domain/entities/ConsultationBooking';
import { ConsultationBookingModel, IConsultationBookingDocument } from '../models/ConsultationBookingModel';

@injectable()
export class ConsultationBookingRepository implements IConsultationBookingRepository {
    async create(booking: ConsultationBooking): Promise<ConsultationBooking> {
        const newBooking = new ConsultationBookingModel(booking);
        const saved = await newBooking.save();
        return this.mapToEntity(saved);
    }

    async findById(id: string): Promise<ConsultationBooking | null> {
        const doc = await ConsultationBookingModel.findById(id);
        return doc ? this.mapToEntity(doc) : null;
    }

    async findByUserId(userId: string): Promise<ConsultationBooking[]> {
        const docs = await ConsultationBookingModel.find({ userId }).sort({ createdAt: -1 });
        return docs.map(doc => this.mapToEntity(doc));
    }

    async findAll(filters: any = {}, page: number = 1, limit: number = 10): Promise<{ bookings: ConsultationBooking[], total: number }> {
        const skip = (page - 1) * limit;
        const query: any = {};

        if (filters.status && filters.status !== 'All') {
            query.status = filters.status;
        }

        if (filters.search) {
            query.$or = [
                { fullName: { $regex: filters.search, $options: 'i' } },
                { contactNumber: { $regex: filters.search, $options: 'i' } }
            ];
        }

        const total = await ConsultationBookingModel.countDocuments(query);
        const docs = await ConsultationBookingModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

        return {
            bookings: docs.map(doc => this.mapToEntity(doc)),
            total
        };
    }

    async findByDate(date: string): Promise<ConsultationBooking[]> {
        const docs = await ConsultationBookingModel.find({ appointmentDate: date, status: { $ne: 'Cancelled' } });
        return docs.map(doc => this.mapToEntity(doc));
    }

    async update(id: string, updates: Partial<ConsultationBooking>): Promise<ConsultationBooking | null> {
        const doc = await ConsultationBookingModel.findByIdAndUpdate(id, updates, { new: true });
        return doc ? this.mapToEntity(doc) : null;
    }

    private mapToEntity(doc: IConsultationBookingDocument): ConsultationBooking {
        return new ConsultationBooking(
            doc._id.toString(),
            doc.userId.toString(),
            doc.fullName,
            doc.age,
            doc.gender,
            doc.height,
            doc.currentWeight,
            doc.maritalStatus,
            doc.occupation,
            doc.contactNumber,
            doc.city,
            doc.country,
            doc.mainHealthIssue,
            doc.yearsFacingIssue,
            doc.medicalTreatment,
            doc.treatmentDetails,
            doc.currentMedicines,
            doc.medicalReports,
            doc.tryingToConceiveSince,
            doc.miscarriageHistory,
            doc.ivfIui,
            doc.menstrualCycle,
            doc.diagnosedCondition,
            doc.wakeUpTime,
            doc.sleepTime,
            doc.exercise,
            doc.exerciseType,
            doc.stressLevel,
            doc.waterIntake,
            doc.bowelMovement,
            doc.vegetarian,
            doc.nonVegetarian,
            doc.teaCoffee,
            doc.sugar,
            doc.outsideFood,
            doc.riceWheat,
            doc.foodAllergies,
            doc.symptoms,
            doc.readyForNaturalDiet,
            doc.readyToAvoidSugar,
            doc.familySupport,
            doc.appointmentDate,
            doc.appointmentTime,
            doc.status,
            doc.doctorNotes,
            doc.recommendedProducts ? doc.recommendedProducts.map(p => p.toString()) : [],
            doc.createdAt,
            doc.updatedAt
        );
    }
}
