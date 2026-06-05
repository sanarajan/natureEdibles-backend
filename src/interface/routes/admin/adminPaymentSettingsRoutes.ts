import { Router } from 'express';
import { adminAuthProtect } from '../../../middleware/adminAuthMiddleware';
import { getPaymentSettings, updatePaymentSettings } from '../../controllers/AdminPaymentSettingsController';

const router = Router();

router.get('/', adminAuthProtect, getPaymentSettings);
router.put('/', adminAuthProtect, updatePaymentSettings);

export default router;
