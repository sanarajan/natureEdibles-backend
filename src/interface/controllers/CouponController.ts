import { Request, Response } from 'express';
import { CouponModel } from '../../infrastructure/database/models/CouponModel';
import { UserModel } from '../../infrastructure/database/models/UserModel';
import { OrderModel } from '../../infrastructure/database/models/OrderModel';
import { ReferralSettingModel } from '../../infrastructure/database/models/ReferralSettingModel';

export class CouponController {
    public async getActiveCoupons(req: Request, res: Response): Promise<void> {
        try {
            const now = new Date();

            const coupons = await CouponModel.find({
                status: true,
                startDate: { $lte: now },
                endDate: { $gte: now }
            }).sort({ endDate: 1 });

            res.status(200).json({
                success: true,
                data: { coupons }
            });
        } catch (error: any) {
            console.error('Fetch Coupons Error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    public async validateCoupon(req: Request, res: Response): Promise<void> {
        try {
            const { code, amount } = req.body;
            const now = new Date();
            const purchaseAmount = Number(amount);

            const coupon = await CouponModel.findOne({
                couponName: { $regex: new RegExp(`^${code}$`, 'i') },
                status: true,
                startDate: { $lte: now },
                endDate: { $gte: now }
            });

            if (!coupon) {
                res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
                return;
            }

            if (purchaseAmount < coupon.minPurchase) {
                res.status(400).json({ success: false, message: `Minimum purchase of ₹${coupon.minPurchase} required.` });
                return;
            }

            let discount = 0;
            if (coupon.discountType === 'Percentage') {
                discount = (amount * (coupon.discountPercentage || 0)) / 100;
            } else {
                discount = coupon.discountValue || 0;
            }

            res.status(200).json({
                success: true,
                data: {
                    coupon: {
                        _id: coupon._id,
                        couponName: coupon.couponName,
                        discountType: coupon.discountType,
                        discountValue: discount,
                        minPurchase: coupon.minPurchase
                    }
                }
            });

        } catch (error: any) {
            console.error('Validate Coupon Error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    public async validateReferral(req: Request, res: Response): Promise<void> {
        try {
            const { code, amount } = req.body;
            const userId = (req as any).user?.id;

            if (!code) {
                res.status(400).json({ success: false, message: 'Referral code is required' });
                return;
            }

            const referrer = await UserModel.findOne({ referralId: code });
            if (!referrer) {
                res.status(404).json({ success: false, message: 'Invalid referral code' });
                return;
            }

            if (userId && referrer._id.toString() === userId.toString()) {
                res.status(400).json({ success: false, message: 'You cannot use your own referral code' });
                return;
            }

            const successfulUsages = await OrderModel.countDocuments({
                referralCode: code,
                globalOrderStatus: { $in: ['DELIVERED', 'COMPLETED', 'SHIPPED', 'PARTIALLY_DELIVERED'] }
            });

            if (successfulUsages >= 100) {
                res.status(400).json({ success: false, message: 'Referral code usage limit exceeded' });
                return;
            }

            const settings = await ReferralSettingModel.findOne({ isActive: true });
            if (!settings) {
                res.status(400).json({ success: false, message: 'Referral program is currently inactive' });
                return;
            }

            const discountPercentage = settings.offerPercentage || 20;
            const discount = (Number(amount) * discountPercentage) / 100;

            res.status(200).json({
                success: true,
                data: {
                    referral: {
                        code: code,
                        discountValue: discount,
                        discountPercentage: discountPercentage
                    }
                }
            });

        } catch (error: any) {
            console.error('Validate Referral Error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
}
