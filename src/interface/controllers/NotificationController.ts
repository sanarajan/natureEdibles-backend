import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IGetUserNotificationsUseCase, IMarkNotificationReadUseCase } from '../../application/interfaces/use-cases/notification/INotificationUseCases';

@injectable()
export class NotificationController {
    constructor(
        @inject('IGetUserNotificationsUseCase') private getUserNotificationsUseCase: IGetUserNotificationsUseCase,
        @inject('IMarkNotificationReadUseCase') private markNotificationReadUseCase: IMarkNotificationReadUseCase
    ) {}

    async getUserNotifications(req: Request, res: Response) {
        try {
            const anyReq = req as any;
            const userId = anyReq.user?.id || anyReq.user?.userId || anyReq.user?._id;
            console.log('[NotificationController] Fetching notifications for userId:', userId);
            console.log('[NotificationController] req.user object:', anyReq.user);
            
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized: No user ID found in token payload' });
            }

            const data = await this.getUserNotificationsUseCase.execute(userId);
            console.log(`[NotificationController] Found ${data.notifications.length} notifications`);
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({ success: false, message: error.message || 'Server error fetching notifications' });
        }
    }

    async markAsRead(req: Request, res: Response) {
        try {
            const anyReq = req as any;
            const userId = anyReq.user?.id || anyReq.user?.userId || anyReq.user?._id;
            const rawId = req.params.id;
            const notificationId = Array.isArray(rawId) ? rawId[0] : rawId;

            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            if (notificationId === 'all') {
                await this.markNotificationReadUseCase.execute(userId);
            } else {
                await this.markNotificationReadUseCase.execute(userId, notificationId);
            }

            res.status(200).json({ success: true, message: 'Notifications marked as read' });
        } catch (error: any) {
            console.error('Error marking notifications read:', error);
            res.status(500).json({ success: false, message: error.message || 'Server error marking notifications read' });
        }
    }
}
