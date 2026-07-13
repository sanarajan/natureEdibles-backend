import { injectable } from 'tsyringe';
import { IConsultationSettingsRepository } from '../../../domain/repositories/IConsultationSettingsRepository';
import { ConsultationSettings } from '../../../domain/entities/ConsultationSettings';
import { ConsultationSettingsModel, IConsultationSettingsDocument } from '../models/ConsultationSettingsModel';

@injectable()
export class ConsultationSettingsRepository implements IConsultationSettingsRepository {
    async getSettings(): Promise<ConsultationSettings> {
        let settingsDoc = await ConsultationSettingsModel.findOne();
        if (!settingsDoc) {
            settingsDoc = await ConsultationSettingsModel.create({});
        }
        return this.mapToEntity(settingsDoc);
    }

    async updateSettings(settings: Partial<ConsultationSettings>): Promise<ConsultationSettings> {
        let settingsDoc = await ConsultationSettingsModel.findOne();
        if (!settingsDoc) {
            settingsDoc = new ConsultationSettingsModel(settings);
            await settingsDoc.save();
        } else {
            Object.assign(settingsDoc, settings);
            await settingsDoc.save();
        }
        return this.mapToEntity(settingsDoc);
    }

    private mapToEntity(doc: IConsultationSettingsDocument): ConsultationSettings {
        return new ConsultationSettings(
            doc._id.toString(),
            doc.doctorName,
            doc.doctorDesignation,
            doc.consultationFee,
            doc.bookingEnabled,
            doc.slotGapMinutes,
            doc.minAdvanceBookingHours,
            doc.maxAdvanceBookingDays,
            doc.workingDays,
            doc.breaks,
            doc.leaveDates,
            doc.specialSchedules,
            doc.createdAt,
            doc.updatedAt
        );
    }
}
