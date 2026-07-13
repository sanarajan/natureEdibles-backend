import { ConsultationSettings } from '../../../../domain/entities/ConsultationSettings';

export interface IGetConsultationSettingsUseCase {
    execute(): Promise<ConsultationSettings>;
}

export interface IUpdateConsultationSettingsUseCase {
    execute(settings: Partial<ConsultationSettings>): Promise<ConsultationSettings>;
}
