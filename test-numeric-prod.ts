import mongoose from 'mongoose';
import { OrderModel } from './src/infrastructure/database/models/OrderModel';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
    try {
        const search = '1775.00';
        const parsedNum = Number(search.trim());
        let amountRegexStr = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (!isNaN(parsedNum) && search.trim() !== '') {
            amountRegexStr = parsedNum.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        const query = {
            $or: [
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: { $ifNull: ["$totalAmount", ""] } },
                            regex: amountRegexStr,
                            options: "i"
                        }
                    }
                }
            ]
        };

        console.log("Testing numeric search query:", JSON.stringify(query, null, 2));
        const orders = await OrderModel.find(query);
        console.log(`Orders found for search '${search}':`, orders.length);
        if (orders.length > 0) {
            console.log("Sample totalAmount:", orders[0].totalAmount);
        }

        // Test with "17"
        const search2 = '17';
        let amountRegexStr2 = search2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const query2 = {
            $or: [
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: { $ifNull: ["$totalAmount", ""] } },
                            regex: amountRegexStr2,
                            options: "i"
                        }
                    }
                }
            ]
        };
        const orders2 = await OrderModel.find(query2);
        console.log(`Orders found for search '${search2}':`, orders2.length);

    } catch (error) {
        console.error("ERROR EXECUTING QUERY:", error);
    }
    process.exit(0);
});
