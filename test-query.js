const mongoose = require('mongoose');
const { OrderModel } = require('./build/infrastructure/database/models/OrderModel');

mongoose.connect('mongodb://localhost:27017/natureEdibles').then(async () => {
    try {
        const search = 'delivered';
        const regex = new RegExp(search, 'i');
        
        const searchOr = [
            { orderId: regex },
            { globalOrderStatus: regex },
            { paymentStatus: regex },
            { paymentMethod: regex },
            { 'orderedProducts.orderStatus': regex },
            { paymentReferenceId: regex },
            { razorpayPaymentId: regex }
        ];
        
        const query = { $or: searchOr };
        console.log("Executing query:", JSON.stringify(query, null, 2));
        const orders = await OrderModel.find(query);
        console.log('Orders found with "delivered":', orders.length);

        const search2 = 'pending';
        const regex2 = new RegExp(search2, 'i');
        const query2 = { $or: searchOr.map(o => {
            const key = Object.keys(o)[0];
            return { [key]: regex2 };
        }) };
        const orders2 = await OrderModel.find(query2);
        console.log('Orders found with "pending":', orders2.length);

        const queryAll = {};
        const all = await OrderModel.find(queryAll);
        console.log('Total orders:', all.length);
    } catch(err) {
        console.error("Error:", err);
    }
    process.exit(0);
}).catch(console.error);
