import { ConsultationSettings } from '../entities/ConsultationSettings';

export interface IConsultationSettingsRepository {
    getSettings(): Promise<ConsultationSettings>;
    updateSettings(settings: Partial<ConsultationSettings>): Promise<ConsultationSettings>;
}
