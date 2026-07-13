import { Router } from 'express';
import { container } from 'tsyringe';
import { UserConsultationController } from '../../controllers/UserConsultationController';
import { userAuthProtect } from '../../../middleware/userAuthMiddleware';

const router = Router();
const userConsultationController = container.resolve(UserConsultationController);

router.post('/', userAuthProtect, userConsultationController.createBooking.bind(userConsultationController));
router.get('/available-slots', userConsultationController.getAvailableSlots.bind(userConsultationController));
router.get('/settings', userConsultationController.getSettings.bind(userConsultationController));
router.get('/history', userAuthProtect, userConsultationController.getUserConsultations.bind(userConsultationController));

export default router;
