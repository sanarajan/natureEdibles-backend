import mongoose from 'mongoose';
import { OrderModel } from './src/infrastructure/database/models/OrderModel';
import { UserModel } from './src/infrastructure/database/models/UserModel';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
    try {
        const search = 'delivered';
        const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedSearch, 'i');

        const matchingUsers = await UserModel.find({
            $or: [
                { displayName: regex },
                { username: regex },
                { email: regex },
                { phoneNumber: regex }
            ]
        }).select('_id');
        const matchingUserIds = matchingUsers.map(u => u._id);

        const searchOr: any[] = [
            { orderId: regex },
            { paymentReferenceId: regex },
            { razorpayPaymentId: regex }
        ];

        const globalOrderStatuses = ['PENDING', 'PLACED', 'PARTIALLY_SHIPPED', 'SHIPPED', 'PARTIALLY_DELIVERED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'PARTIALLY_RETURNED', 'RETURNED', 'PARTIALLY_CANCELLED', 'PROCESSING', 'PARTIALLY_PROCESSING', 'CANCELLATION_REQUEST', 'RETURN_REQUEST'];
        const matchedGlobalStatuses = globalOrderStatuses.filter(s => regex.test(s));
        if (matchedGlobalStatuses.length > 0) {
            searchOr.push({ globalOrderStatus: { $in: matchedGlobalStatuses } });
        }

        if (matchingUserIds.length > 0) {
            searchOr.push({ userId: { $in: matchingUserIds } });
        }

        let query: any = {};
        query.$or = searchOr;

        if (query.$or) {
            const orQuery = query.$or;
            delete query.$or;
            if (Object.keys(query).length > 0) {
                query = { $and: [query, { $or: orQuery }] };
            } else {
                query = { $or: orQuery };
            }
        }

        const orders = await OrderModel.find(query);
        console.log(`Orders found for search '${search}':`, orders.length);

        if (orders.length > 0) {
            console.log("Example matching order status:", orders[0].globalOrderStatus);
        }
        
    } catch (error) {
        console.error("ERROR EXECUTING QUERY:", error);
    }
    process.exit(0);
});
