import { Router } from 'express';
import { adminAuthProtect } from '../../../middleware/adminAuthMiddleware';
import { getAllOrders, getOrderById, updateOrderStatus, updatePaymentStatus, verifyManualPayment, rejectManualPayment } from '../../controllers/AdminOrderController';

const router = Router();

router.get('/', adminAuthProtect, getAllOrders);
router.get('/:id', adminAuthProtect, getOrderById);
router.patch('/:id/status', adminAuthProtect, updateOrderStatus);
router.patch('/:id/payment-status', adminAuthProtect, updatePaymentStatus);
router.patch('/:id/verify-payment', adminAuthProtect, verifyManualPayment);
router.patch('/:id/reject-payment', adminAuthProtect, rejectManualPayment);

export default router;
