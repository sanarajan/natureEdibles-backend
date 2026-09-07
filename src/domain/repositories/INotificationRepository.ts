import { Notification } from '../entities/Notification';

export interface INotificationRepository {
    create(data: Partial<Notification>): Promise<Notification>;
    findByUserId(userId: string): Promise<Notification[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(notificationId: string): Promise<Notification | null>;
    markAllAsRead(userId: string): Promise<void>;
}
