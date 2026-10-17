import { Router } from 'express';
import { container } from 'tsyringe';
import { UserDietPlanController } from '../../controllers/UserDietPlanController';
import { userAuthProtect } from '../../../middleware/userAuthMiddleware';

const router = Router();
const userDietPlanController = container.resolve(UserDietPlanController);

router.use(userAuthProtect);

router.get('/', userDietPlanController.getMyDietPlans.bind(userDietPlanController));
router.get('/consultation/:consultationId', userDietPlanController.getDietPlanByConsultation.bind(userDietPlanController));
router.put('/consultation/:consultationId/day/:dayKey/toggle', userDietPlanController.toggleDayCompletion.bind(userDietPlanController));
router.put('/consultation/:consultationId/section/:dayKey/toggle', userDietPlanController.toggleDayCompletion.bind(userDietPlanController));

export default router;
