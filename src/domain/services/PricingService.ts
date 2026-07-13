import { Request } from 'express';
import { ComboOfferModel } from '../../infrastructure/database/models/ComboOfferModel';
import { OfferModel } from '../../infrastructure/database/models/OfferModel';
import { CouponModel } from '../../infrastructure/database/models/CouponModel';
import { ReferralSettingModel } from '../../infrastructure/database/models/ReferralSettingModel';
import { UserModel } from '../../infrastructure/database/models/UserModel';

const roundTo2 = (num: number) => Math.round(num * 100) / 100;

export class PricingService {
    /**
     * Centralized Calculation Engine for Cart and Checkout.
     * Computes all discounts adhering to strict priority rules.
     */
    public static async calculate(
        cart: any,
        options: {
            couponCode?: string;
            referralCode?: string;
            req?: Request;
        } = {}
    ) {
        const { couponCode, referralCode, req } = options;
        const tempRaw: any = cart && cart.toObject ? cart.toObject() : (cart || { products: [] });
        const now = new Date();

        const getPId = (p: any) => {
            if (!p) return "";
            const id = p._id || p.id || p;
            return id.toString();
        };

        // 0. Proactively Merge Duplicates by ID immediately
        const mergedMap: any = {};
        const inputItems: any[] = Array.isArray(tempRaw.products) ? tempRaw.products : [];

        inputItems.forEach((it: any) => {
            const pId = getPId(it.product);
            if (!pId) return;

            if (!mergedMap[pId]) {
                // Initializing with original data
                mergedMap[pId] = { ...it, quantity: Number(it.quantity) || 0 };
            } else {
                // Merging additional quantity
                mergedMap[pId].quantity += (Number(it.quantity) || 0);
            }
        });
        const cartProductsRaw = Object.values(mergedMap);

        // Always reset all discounts to 0 at the start of every calculation
        let comboDiscount = 0;
        let productDiscount = 0;
        let couponDiscount = 0;
        let referralDiscount = 0;
        let influencerDiscount = 0;

        let hasComboOffer = false;
        let hasProductOffer = false;
        let hasCoupon = false;
        let hasReferral = false;

        let bestComboOffer: any = null;
        let comboCount = 0;
        const comboUsageMap: { [pId: string]: number } = {};

        // --- 1. COMBO OFFERS ---
        const activeComboOffers: any[] = await ComboOfferModel.find({
            status: true,
            isDeleted: { $ne: true },
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).populate('products.productId').lean();

        for (const combo of activeComboOffers) {
            let isMatched = true;
            let comboSetMRP = 0;
            const comboProducts: any[] = Array.isArray(combo.products) ? combo.products : [];
            if (comboProducts.length === 0) continue;

            const reqs: any = {};
            for (const cp of comboProducts) {
                const pId = getPId(cp.productId);
                if (!pId) continue;
                const rq = Number(cp.requiredQuantity) || 1;
                reqs[pId] = (reqs[pId] || 0) + rq;
                const price = Number((cp.productId as any)?.price) || 0;
                comboSetMRP += price * rq;
            }

            const rPIds = Object.keys(reqs);
            if (rPIds.length === 0) continue;

            for (const pId of rPIds) {
                const ci: any = cartProductsRaw.find((x: any) => getPId(x.product) === pId);
                if (!ci || Number(ci.quantity) < reqs[pId]) {
                    isMatched = false;
                    break;
                }
            }

            if (isMatched) {
                let possible = Infinity;
                for (const pId of rPIds) {
                    const ci: any = cartProductsRaw.find((x: any) => getPId(x.product) === pId);
                    if (!ci) continue;
                    const canDo = Math.floor(Number(ci.quantity) / reqs[pId]);
                    if (canDo < possible) possible = canDo;
                }

                if (possible > 0 && possible !== Infinity) {
                    let apply = possible;
                    const mU = Number(combo.maxUsagePerOrder) || 0;
                    if (mU > 0 && possible > mU) apply = mU;

                    const base = roundTo2(comboSetMRP * apply);
                    const disc = combo.discountType === 'percentage' 
                        ? roundTo2((base * (Number(combo.discountValue) || 0)) / 100) 
                        : roundTo2((Number(combo.discountValue) || 0) * apply);

                    if (disc > comboDiscount) {
                        comboDiscount = disc;
                        bestComboOffer = combo;
                        comboCount = apply;
                        hasComboOffer = true;
                    }
                }
            }
        }

        // Strict Combo Blocking Logic
        if (bestComboOffer && comboCount > 0) {
            const comboProducts: any[] = Array.isArray(bestComboOffer.products) ? bestComboOffer.products : [];
            for (const cp of comboProducts) {
                const pId = getPId(cp.productId);
                const rq = Number(cp.requiredQuantity) || 1;
                comboUsageMap[pId] = (comboUsageMap[pId] || 0) + (rq * comboCount);
            }
        }

        // --- 2. PRODUCT & CATEGORY OFFERS ---
        const activeOffers: any[] = await OfferModel.find({
            status: true,
            isDeleted: { $ne: true },
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).lean();

        // Pre-calculate Combo Distribution Record if a combo is active
        const comboDistributions: { [pId: string]: number } = {};
        if (bestComboOffer && comboCount > 0) {
            let actualUsedMRPTotal = 0;
            const itemsToDistribute: any[] = [];
            
            cartProductsRaw.forEach((item: any) => {
                const prod: any = item.product;
                if (!prod) return;
                const pId = getPId(prod);
                const reqPerSet = Array.isArray(bestComboOffer.products) ? bestComboOffer.products.reduce((acc: number, cp: any) => {
                    const cpId = getPId(cp.productId);
                    return cpId === pId ? acc + (Number(cp.requiredQuantity) || 1) : acc;
                }, 0) : 0;
                
                if (reqPerSet > 0) {
                    const usedQty = reqPerSet * comboCount;
                    const price = Number(prod.price) || 0;
                    const usedMRP = roundTo2(price * usedQty);
                    actualUsedMRPTotal += usedMRP;
                    itemsToDistribute.push({ pId, usedMRP });
                }
            });

            let remainingComboDiscount = comboDiscount;
            itemsToDistribute.forEach((item, idx) => {
                if (idx === itemsToDistribute.length - 1) {
                    comboDistributions[item.pId] = roundTo2(remainingComboDiscount);
                } else {
                    const share = roundTo2((item.usedMRP / actualUsedMRPTotal) * comboDiscount);
                    comboDistributions[item.pId] = share;
                    remainingComboDiscount = roundTo2(remainingComboDiscount - share);
                }
            });
        }

        const finalProducts: any[] = [];
        
        cartProductsRaw.forEach((item: any) => {
            const prod: any = item.product;
            if (!prod) return;

            const pId = getPId(prod);
            const totalQty = Number(item.quantity) || 1;
            const usedQty = comboUsageMap[pId] || 0;
            const remainingQty = Math.max(0, totalQty - usedQty);
            const origPrice = Number(prod.price) || 0;

            // Calculate Best Product/Category Offer
            const cId = getPId(prod.categoryId);
            let bestIndv = 0;
            let bestO: any = null;

            activeOffers.forEach((o: any) => {
                let d = 0;
                const dv = Number(o.discountValue) || 0;
                const oPId = getPId(o.productId);
                const oCId = getPId(o.categoryId);

                if (o.offerFor === 'product' && oPId === pId) {
                    d = o.discountType === 'percentage' ? (origPrice * dv) / 100 : dv;
                } else if (o.offerFor === 'category' && oCId === cId) {
                    d = o.discountType === 'percentage' ? (origPrice * dv) / 100 : dv;
                }
                if (d > bestIndv) {
                    bestIndv = d;
                    bestO = o;
                }
            });

            // 1. Create Combo Split Row
            if (usedQty > 0) {
                const share = comboDistributions[pId] || 0;
                finalProducts.push({
                    product: {
                        _id: prod._id,
                        productName: prod.productName,
                        price: origPrice,
                        categoryId: prod.categoryId,
                        subcategoryId: prod.subcategoryId,
                        images: prod.images
                    },
                    quantity: Math.min(usedQty, totalQty),
                    isComboItem: true,
                    finalUnitPrice: origPrice - (share / Math.min(usedQty, totalQty)),
                    appliedProductOffer: null,
                    appliedComboOffer: {
                        offerId: bestComboOffer._id,
                        offerName: bestComboOffer.offerName,
                        discountAmount: share
                    }
                });
            }

            // 2. Create Remaining Split Row
            if (remainingQty > 0) {
                let appliedProductOffer: any = null;
                let finalUnitPrice = origPrice;

                if (bestO && bestIndv > 0) {
                    finalUnitPrice = roundTo2(origPrice - bestIndv);
                    appliedProductOffer = {
                        offerId: bestO._id,
                        offerName: bestO.offerName,
                        discountType: bestO.discountType,
                        discountValue: Number(bestO.discountValue) || 0,
                        finalUnitPrice: finalUnitPrice,
                        discountAmountPerUnit: roundTo2(bestIndv)
                    };
                    hasProductOffer = true;
                    productDiscount += roundTo2(bestIndv * remainingQty);
                }

                finalProducts.push({
                    product: {
                        _id: prod._id,
                        productName: prod.productName,
                        price: origPrice,
                        categoryId: prod.categoryId,
                        subcategoryId: prod.subcategoryId,
                        images: prod.images
                    },
                    quantity: remainingQty,
                    isComboItem: false,
                    finalUnitPrice: finalUnitPrice,
                    appliedProductOffer
                });
            }
        });

        // 3. Centralized Pricing Calculation - Subtotal MRP
        const subtotalMRP = finalProducts.reduce((acc, it) => acc + ((Number(it.product.price) || 0) * it.quantity), 0);

        // --- 3. COUPON OR REFERRAL ---
        let appliedReferralCode = '';
        let appliedReferralOwnerId: any = null;
        let appliedCouponId: any = null;
        let appliedCouponName: any = null;

        if (!hasComboOffer && !hasProductOffer) {
            if (referralCode) {
                const referrer = await UserModel.findOne({ referralId: referralCode });
                if (referrer) {
                    const settings = await ReferralSettingModel.findOne({ isActive: true });
                    const discountPercent = settings?.offerPercentage || 20;
                    referralDiscount = roundTo2((subtotalMRP * discountPercent) / 100);
                    hasReferral = true;
                    appliedReferralCode = referralCode;
                    appliedReferralOwnerId = referrer._id;
                }
            } else if (couponCode) {
                const coupon = await CouponModel.findOne({
                    couponName: { $regex: new RegExp(`^${couponCode}$`, 'i') },
                    status: true,
                    startDate: { $lte: now },
                    endDate: { $gte: now }
                });

                if (coupon) {
                    if (subtotalMRP >= coupon.minPurchase) {
                        if (coupon.discountType === 'Percentage') {
                            couponDiscount = roundTo2((subtotalMRP * (coupon.discountPercentage || 0)) / 100);
                        } else {
                            couponDiscount = coupon.discountValue || 0;
                        }
                        hasCoupon = true;
                        appliedCouponId = coupon._id;
                        appliedCouponName = coupon.couponName;
                    }
                }
            }
        }

        // --- 4. INFLUENCER DISCOUNT ---
        let appliedInfluencerId: any = null;
        if (!hasComboOffer && !hasProductOffer && !hasCoupon && !hasReferral) {
            const influencerToken = req?.cookies?.influencer;
            if (influencerToken) {
                // Determine influencer based on your project's logic here.
                // Assuming they are users with an influencer code stored in referralId
                const influencer = await UserModel.findOne({ referralId: influencerToken, isActive: true });
                if (influencer) {
                    // Applying a default 10% influencer discount if not configured otherwise
                    influencerDiscount = roundTo2((subtotalMRP * 10) / 100);
                    appliedInfluencerId = influencer._id;
                }
            }
        }

        const totalDiscount = roundTo2(productDiscount + comboDiscount + couponDiscount + referralDiscount + influencerDiscount);
        const total = roundTo2(subtotalMRP - totalDiscount);

        const calculatedCart: any = {
            ...tempRaw,
            products: finalProducts,
            pricing: {
                subtotalMRP,
                productDiscount,
                comboDiscount,
                couponDiscount,
                referralDiscount,
                influencerDiscount,
                totalDiscount,
                total
            },
            flags: {
                hasComboOffer,
                hasProductOffer,
                hasCoupon,
                hasReferral
            },
            appliedOffers: {
                appliedComboOfferId: bestComboOffer ? bestComboOffer._id : null,
                appliedComboOfferName: bestComboOffer ? bestComboOffer.offerName : null,
                appliedComboOfferProducts: bestComboOffer ? bestComboOffer.products : null,
                appliedReferralCode,
                appliedReferralOwnerId,
                appliedCouponId,
                appliedCouponName,
                appliedInfluencerId
            }
        };

        return calculatedCart;
    }
}
