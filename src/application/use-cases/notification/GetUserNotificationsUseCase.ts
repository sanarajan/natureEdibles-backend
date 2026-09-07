import { inject, injectable } from 'tsyringe';
import { IGetUserNotificationsUseCase } from '../../interfaces/use-cases/notification/INotificationUseCases';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { Notification } from '../../../domain/entities/Notification';

@injectable()
export class GetUserNotificationsUseCase implements IGetUserNotificationsUseCase {
    constructor(
        @inject('INotificationRepository') private notificationRepo: INotificationRepository
    ) {}

    async execute(userId: string): Promise<{ notifications: Notification[], unreadCount: number }> {
        const notifications = await this.notificationRepo.findByUserId(userId);
        const unreadCount = await this.notificationRepo.getUnreadCount(userId);
        return { notifications, unreadCount };
    }
}
