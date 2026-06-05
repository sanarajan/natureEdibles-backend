import { Router } from 'express';
import { getPaymentSettings } from '../../controllers/UserPaymentSettingsController';
import { userAuthProtect } from '../../../middleware/userAuthMiddleware';

const router = Router();

router.get('/', userAuthProtect, getPaymentSettings);

export default router;
