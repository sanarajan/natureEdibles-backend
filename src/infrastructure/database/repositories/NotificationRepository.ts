import mongoose from 'mongoose';
import { injectable } from 'tsyringe';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { Notification } from '../../../domain/entities/Notification';
import { NotificationModel } from '../models/NotificationModel';

@injectable()
export class NotificationRepository implements INotificationRepository {
    private mapToEntity(doc: any): Notification {
        return {
            _id: doc._id.toString(),
            userId: doc.userId.toString(),
            type: doc.type,
            title: doc.title,
            message: doc.message,
            relatedId: doc.relatedId?.toString(),
            isRead: doc.isRead,
            createdAt: doc.createdAt
        } as Notification;
    }

    async create(data: Partial<Notification>): Promise<Notification> {
        console.log('[NotificationRepo] Attempting to create notification with data:', data);
        const notification = new NotificationModel(data);
        const saved = await notification.save();
        console.log('[NotificationRepo] Successfully saved notification:', saved.toObject());
        return this.mapToEntity(saved.toObject());
    }

    async findByUserId(userId: string): Promise<Notification[]> {
        console.log(`[NotificationRepo] Finding notifications for userId: ${userId}`);
        const objectId = new mongoose.Types.ObjectId(userId);
        const notifications = await NotificationModel.find({ userId: objectId }).sort({ createdAt: -1 }).lean();
        console.log(`[NotificationRepo] Found ${notifications.length} notifications in DB for userId: ${userId}`);
        return notifications.map(doc => this.mapToEntity(doc));
    }

    async getUnreadCount(userId: string): Promise<number> {
        console.log(`[NotificationRepo] Counting unread notifications for userId: ${userId}`);
        const objectId = new mongoose.Types.ObjectId(userId);
        const count = await NotificationModel.countDocuments({ userId: objectId, isRead: false });
        console.log(`[NotificationRepo] Unread count is ${count} for userId: ${userId}`);
        return count;
    }

    async markAsRead(notificationId: string): Promise<Notification | null> {
        const doc = await NotificationModel.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        ).lean();
        return doc ? this.mapToEntity(doc) : null;
    }

    async markAllAsRead(userId: string): Promise<void> {
        await NotificationModel.updateMany({ userId, isRead: false }, { isRead: true });
    }
}
