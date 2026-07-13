import { inject, injectable } from 'tsyringe';
import { IUpdateConsultationSettingsUseCase } from '../../interfaces/use-cases/consultation/IConsultationSettingsUseCases';
import { IConsultationSettingsRepository } from '../../../domain/repositories/IConsultationSettingsRepository';
import { ConsultationSettings } from '../../../domain/entities/ConsultationSettings';

@injectable()
export class UpdateConsultationSettingsUseCase implements IUpdateConsultationSettingsUseCase {
    constructor(@inject('IConsultationSettingsRepository') private settingsRepo: IConsultationSettingsRepository) {}

    async execute(settings: Partial<ConsultationSettings>): Promise<ConsultationSettings> {
        return this.settingsRepo.updateSettings(settings);
    }
}
