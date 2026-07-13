import { Router } from 'express';
import { container } from 'tsyringe';
import { AdminConsultationController } from '../../controllers/AdminConsultationController';
import { adminAuthProtect } from '../../../middleware/adminAuthMiddleware';

const router = Router();
const adminConsultationController = container.resolve(AdminConsultationController);

router.use(adminAuthProtect);

router.get('/bookings', adminConsultationController.getConsultations.bind(adminConsultationController));
router.get('/bookings/:id', adminConsultationController.getConsultationById.bind(adminConsultationController));
router.put('/bookings/:id', adminConsultationController.updateConsultation.bind(adminConsultationController));

router.get('/settings', adminConsultationController.getSettings.bind(adminConsultationController));
router.put('/settings', adminConsultationController.updateSettings.bind(adminConsultationController));

export default router;
