import { inject, injectable } from 'tsyringe';
import { IGetConsultationSettingsUseCase } from '../../interfaces/use-cases/consultation/IConsultationSettingsUseCases';
import { IConsultationSettingsRepository } from '../../../domain/repositories/IConsultationSettingsRepository';
import { ConsultationSettings } from '../../../domain/entities/ConsultationSettings';

@injectable()
export class GetConsultationSettingsUseCase implements IGetConsultationSettingsUseCase {
    constructor(@inject('IConsultationSettingsRepository') private settingsRepo: IConsultationSettingsRepository) {}

    async execute(): Promise<ConsultationSettings> {
        return this.settingsRepo.getSettings();
    }
}
