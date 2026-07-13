import { Router } from 'express';
import { adminAuthProtect } from '../../../middleware/adminAuthMiddleware';
import { getPaymentSettings, updatePaymentSettings, createPaymentSettings, deletePaymentSettings, setDefaultPaymentSettings } from '../../controllers/AdminPaymentSettingsController';

const router = Router();

router.get('/', adminAuthProtect, getPaymentSettings);
router.post('/', adminAuthProtect, createPaymentSettings);
router.put('/:id', adminAuthProtect, updatePaymentSettings);
router.delete('/:id', adminAuthProtect, deletePaymentSettings);
router.put('/:id/default', adminAuthProtect, setDefaultPaymentSettings);

export default router;
