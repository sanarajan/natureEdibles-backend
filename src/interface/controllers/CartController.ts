import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CartModel, ICartDocument } from '../../infrastructure/database/models/CartModel';
import { ComboOfferModel } from '../../infrastructure/database/models/ComboOfferModel';
import { OfferModel } from '../../infrastructure/database/models/OfferModel';
import { ProductModel } from '../../infrastructure/database/models/ProductModel';

const roundTo2 = (num: number) => Math.round(num * 100) / 100;

/**
 * Common function to calculate discounts and offers for a cart
 * Returns a plain object with calculated fields
 */
import { PricingService } from '../../domain/services/PricingService';

export const calculateCartSubtotals = async (cart: any, req?: Request) => {
    return await PricingService.calculate(cart, { req });
};

export const getCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        let cart = await CartModel.findOne({ user: userId, isActive: true })
            .populate({
                path: 'products.product',
                populate: [
                    { path: 'categoryId', select: 'categoryName _id' },
                    { path: 'subcategoryId', select: 'subcategoryName _id' }
                ]
            });
        if (!cart) {
            cart = await CartModel.create({ user: userId, products: [], isActive: true });
        }
        const calculatedCart = await calculateCartSubtotals(cart, req);
        res.status(200).json({ success: true, data: calculatedCart });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching cart' });
    }
};

export const toggleCartItem = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { productId, quantity = 1 } = req.body;
        if (!productId) return res.status(400).json({ success: false, message: 'Product ID is required' });

        let cart = await CartModel.findOne({ user: userId, isActive: true });
        if (!cart) cart = new CartModel({ user: userId, products: [], isActive: true });

        // Robust ID matching to prevent duplicates
        const productIndex = cart.products.findIndex(p => {
            const pId = (p.product?._id || p.product).toString();
            return pId === productId;
        });

        if (productIndex > -1) {
            cart.products[productIndex].quantity += Number(quantity);
        } else {
            cart.products.push({ product: new mongoose.Types.ObjectId(productId), quantity: Number(quantity) });
        }

        await cart.save();
        await cart.populate({
            path: 'products.product',
            populate: [
                { path: 'categoryId', select: 'categoryName _id' },
                { path: 'subcategoryId', select: 'subcategoryName _id' }
            ]
        });
        const calculatedCart = await calculateCartSubtotals(cart, req);
        res.status(200).json({ success: true, message: 'Cart updated', data: calculatedCart });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Error updating cart' });
    }
};

export const updateCartItemQuantity = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { productId, quantity } = req.body;
        if (!productId || quantity === undefined) return res.status(400).json({ success: false, message: 'Invalid product details' });

        const cart = await CartModel.findOne({ user: userId, isActive: true });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        const productIndex = cart.products.findIndex(p => {
            const pId = (p.product?._id || p.product).toString();
            return pId === productId;
        });

        if (productIndex > -1) {
            cart.products[productIndex].quantity = Number(quantity);
            await cart.save();
            await cart.populate({
                path: 'products.product',
                populate: [
                    { path: 'categoryId', select: 'categoryName _id' },
                    { path: 'subcategoryId', select: 'subcategoryName _id' }
                ]
            });
            const calculatedCart = await calculateCartSubtotals(cart, req);
            res.status(200).json({ success: true, message: 'Quantity updated', data: calculatedCart });
        } else {
            res.status(404).json({ success: false, message: 'Product not in cart' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Error updating item quantity' });
    }
};

export const removeCartItem = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { productId } = req.params;
        const cart = await CartModel.findOne({ user: userId, isActive: true });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
        cart.products = cart.products.filter(p => p.product.toString() !== productId);
        await cart.save();
        await cart.populate({
            path: 'products.product',
            populate: [
                { path: 'categoryId', select: 'categoryName _id' },
                { path: 'subcategoryId', select: 'subcategoryName _id' }
            ]
        });
        const calculatedCart = await calculateCartSubtotals(cart, req);
        res.status(200).json({ success: true, message: 'Product removed from cart', data: calculatedCart });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Error removing item from cart' });
    }
};

export const syncOfflineCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { cartItems } = req.body; 
        if (!cartItems || !Array.isArray(cartItems)) return res.status(400).json({ success: false, message: 'Invalid cart items format' });
        let cart = await CartModel.findOne({ user: userId, isActive: true });
        if (!cart) cart = new CartModel({ user: userId, products: [], isActive: true });
        const validObjectId = /^[0-9a-fA-F]{24}$/;
        for (const item of cartItems) {
            const pId = (item.product?._id || item.product)?.toString();
            if (!pId || !validObjectId.test(pId)) continue; 
            const qty = Math.max(1, Number(item.quantity) || 1);
            
            const index = cart.products.findIndex(p => {
                const existingId = (p.product?._id || p.product).toString();
                return existingId === pId;
            });

            if (index > -1) {
                cart.products[index].quantity += qty;
            } else {
                cart.products.push({ product: new mongoose.Types.ObjectId(pId), quantity: qty });
            }
        }
        await cart.save();
        await cart.populate({
            path: 'products.product',
            populate: [
                { path: 'categoryId', select: 'categoryName _id' },
                { path: 'subcategoryId', select: 'subcategoryName _id' }
            ]
        });
        const calculatedCart = await calculateCartSubtotals(cart, req);
        res.status(200).json({ success: true, message: 'Cart synced successfully', data: calculatedCart });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Error syncing cart' });
    }
};



export const calculateCartTotals = async (req: any, res: any) => {
    try {
        const { products } = req.body;
        if (!products || !Array.isArray(products)) {
            return res.status(400).json({ success: false, message: "Invalid cart data" });
        }

        const productIds = products.map(p => (p.product?._id || p.product)?.toString()).filter(id => id && mongoose.isValidObjectId(id));
        
        // Use lean() so we get plain objects immediately
        const productDocs = await ProductModel.find({ _id: { $in: productIds } })
            .populate("categoryId", "categoryName _id")
            .populate("subcategoryId", "subcategoryName _id")
            .lean();

        const cartItemsForCalc = products.map(p => {
            const pId = (p.product?._id || p.product)?.toString();
            return { 
                product: productDocs.find(d => d._id.toString() === pId), 
                quantity: Number(p.quantity) || 1 
            };
        });

        // The calculation engine needs an object with products and a toObject method
        const cartData = {
            products: cartItemsForCalc,
            toObject: function() { return this; }
        };

        const result = await calculateCartSubtotals(cartData as any, req);
        res.status(200).json({ success: true, data: result });
    } catch (err: any) { 
        console.error("[CalculateTotals] Error:", err);
        res.status(500).json({ success: false, message: err.message }); 
    }
};

