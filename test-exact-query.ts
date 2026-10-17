import mongoose from 'mongoose';
import { OrderModel } from './src/infrastructure/database/models/OrderModel';
import { UserModel } from './src/infrastructure/database/models/UserModel';

mongoose.connect('mongodb://localhost:27017/natureEdibles').then(async () => {
    try {
        const search = 'delivered';
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
            { globalOrderStatus: regex },
            { paymentStatus: regex },
            { paymentMethod: regex },
            { 'orderedProducts.orderStatus': regex },
            { paymentReferenceId: regex },
            { razorpayPaymentId: regex }
        ];

        if (matchingUserIds.length > 0) {
            searchOr.push({ userId: { $in: matchingUserIds } });
        }

        const numericSearch = parseFloat(search);
        if (!isNaN(numericSearch)) {
            searchOr.push({ totalAmount: numericSearch });
        }

        let query: any = {};
        query.$or = searchOr;
        console.log("Query is:", JSON.stringify(query, null, 2));

        const orders = await OrderModel.find(query)
            .populate({ path: 'userId', model: 'User', select: 'displayName email imageUrl' })
            .sort({ createdAt: -1 });
        
        console.log(`Orders found for search '${search}':`, orders.length);
        
        // Let's also check "John"
        const search2 = 'John';
        const regex2 = new RegExp(search2, 'i');
        const query2 = { $or: searchOr.map(o => {
            const k = Object.keys(o)[0];
            return { [k]: regex2 };
        })};
        const orders2 = await OrderModel.find(query2);
        console.log(`Orders found for search '${search2}':`, orders2.length);

    } catch (error) {
        console.error("ERROR EXECUTING QUERY:", error);
    }
    process.exit(0);
});
