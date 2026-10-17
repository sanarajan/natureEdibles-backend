import { Request, Response } from 'express';
import { UserModel } from '../../infrastructure/database/models/UserModel';
import { OrderModel } from '../../infrastructure/database/models/OrderModel';
import mongoose from 'mongoose';
import { UserRole } from '../../constants/enums/UserRole';

export const getAllCustomers = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;

        // Initial match for role
        const pipeline: any[] = [
            { $match: { role: UserRole.USER } }
        ];

        // Perform lookups for orders and addresses to access their fields
        pipeline.push({
            $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'userId',
                as: 'orders'
            }
        });

        pipeline.push({
            $lookup: {
                from: 'addresses',
                localField: 'address_ids',
                foreignField: '_id',
                as: 'addresses'
            }
        });

        // Project everything plus stringified fields for searching
        pipeline.push({
            $project: {
                _id: 1,
                displayName: 1,
                email: 1,
                phoneNumber: 1,
                imageUrl: 1,
                isActive: 1,
                createdAt: 1,
                orderCount: { $size: '$orders' },
                lastLocation: { $arrayElemAt: ['$addresses', 0] },
                createdAtStr: { 
                    $concat: [
                        { $dateToString: { format: "%d-%m-", date: "$createdAt" } },
                        { $substrBytes: [ { $dateToString: { format: "%Y", date: "$createdAt" } }, 2, 2 ] }
                    ]
                },
                orderCountStr: { $toString: { $size: '$orders' } }
            }
        });

        // Apply global search if present
        if (search && typeof search === 'string') {
            const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (escapedSearch) {
                const searchRegex = new RegExp(escapedSearch, 'i');
                const searchLower = escapedSearch.toLowerCase();
                
                const searchOr: any[] = [
                    { displayName: searchRegex },
                    { email: searchRegex },
                    { phoneNumber: searchRegex },
                    { createdAtStr: searchRegex },
                    { orderCountStr: searchRegex },
                    { "lastLocation.city": searchRegex },
                    { "lastLocation.district": searchRegex },
                    { "lastLocation.state": searchRegex }
                ];

                // Status search mapped to isActive field
                if ('inactive'.startsWith(searchLower) && searchLower.length >= 3) {
                    searchOr.push({ isActive: false });
                } else if ('active'.startsWith(searchLower) && searchLower.length >= 3) {
                    searchOr.push({ isActive: true });
                }

                pipeline.push({
                    $match: { $or: searchOr }
                });
            }
        }

        pipeline.push({ $sort: { createdAt: -1 } });

        const users = await UserModel.aggregate(pipeline);

        res.status(200).json({ success: true, data: users });
    } catch (error: any) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ success: false, message: error.message || 'Error fetching customers' });
    }
};

export const updateCustomerStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { isActive } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }
        const user = await UserModel.findOne({ _id: id, role: UserRole.USER });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Customer not found or invalid role' });
        }
        await UserModel.findByIdAndUpdate(id, { isActive });
        res.status(200).json({ success: true, message: 'Status updated successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Error updating status' });
    }
};

export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        const ordersCount = await OrderModel.countDocuments({ userId: id });
        if (ordersCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete customer as they have existing orders.' 
            });
        }

        await UserModel.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Customer deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Error deleting customer' });
    }
};
