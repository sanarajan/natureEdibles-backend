import { Notification } from '../../../../domain/entities/Notification';

export interface IGetUserNotificationsUseCase {
    execute(userId: string): Promise<{ notifications: Notification[], unreadCount: number }>;
}

export interface IMarkNotificationReadUseCase {
    execute(userId: string, notificationId?: string): Promise<void>;
}
