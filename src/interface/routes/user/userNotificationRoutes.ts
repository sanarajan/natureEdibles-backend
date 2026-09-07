import { Router } from 'express';
import { container } from 'tsyringe';
import { NotificationController } from '../../controllers/NotificationController';
import { userAuthProtect } from '../../../middleware/userAuthMiddleware';

const router = Router();
const notificationController = container.resolve(NotificationController);

router.get('/', userAuthProtect, notificationController.getUserNotifications.bind(notificationController));
router.put('/:id/read', userAuthProtect, notificationController.markAsRead.bind(notificationController));

export default router;
