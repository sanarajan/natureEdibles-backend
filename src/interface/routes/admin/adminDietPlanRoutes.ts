import { Router } from 'express';
import { container } from 'tsyringe';
import { AdminDietPlanController } from '../../controllers/AdminDietPlanController';
import { adminAuthProtect } from '../../../middleware/adminAuthMiddleware';

const router = Router();
const adminDietPlanController = container.resolve(AdminDietPlanController);

router.use(adminAuthProtect);

router.post('/', adminDietPlanController.createDietPlan.bind(adminDietPlanController));
router.put('/:id', adminDietPlanController.updateDietPlan.bind(adminDietPlanController));
router.get('/consultation/:consultationId', adminDietPlanController.getDietPlanByConsultation.bind(adminDietPlanController));

export default router;
