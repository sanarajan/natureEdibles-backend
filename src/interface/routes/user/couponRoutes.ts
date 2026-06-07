import express from 'express';
import { CouponController } from '../../controllers/CouponController';
import { userAuthProtect } from '../../../middleware/userAuthMiddleware';

const router = express.Router();
const couponController = new CouponController();

router.get('/active', userAuthProtect, (req, res) => couponController.getActiveCoupons(req, res));
router.post('/validate', userAuthProtect, (req, res) => couponController.validateCoupon(req, res));
router.post('/validate-referral', userAuthProtect, (req, res) => couponController.validateReferral(req, res));

export default router;
