import { Router } from 'express';
import { container } from 'tsyringe';
import { NotificationController } from '../../controllers/NotificationController';
import { adminAuthProtect } from '../../../middleware/adminAuthMiddleware';

const router = Router();
const notificationController = container.resolve(NotificationController);

// Apply admin authentication to all notification routes
router.use(adminAuthProtect);

router.get('/', notificationController.getUserNotifications.bind(notificationController));
router.put('/:id/read', notificationController.markAsRead.bind(notificationController));

export default router;
