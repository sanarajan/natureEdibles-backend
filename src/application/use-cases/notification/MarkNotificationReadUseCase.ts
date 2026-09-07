import { inject, injectable } from 'tsyringe';
import { IMarkNotificationReadUseCase } from '../../interfaces/use-cases/notification/INotificationUseCases';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';

@injectable()
export class MarkNotificationReadUseCase implements IMarkNotificationReadUseCase {
    constructor(
        @inject('INotificationRepository') private notificationRepo: INotificationRepository
    ) {}

    async execute(userId: string, notificationId?: string): Promise<void> {
        if (notificationId) {
            await this.notificationRepo.markAsRead(notificationId);
        } else {
            await this.notificationRepo.markAllAsRead(userId);
        }
    }
}
