import mongoose from 'mongoose';
import { UserModel } from './src/infrastructure/database/models/UserModel';
import { UserRole } from './src/constants/enums/UserRole';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
    try {
        const searchTerms = ['act', 'sana', 'kerala', '09-26', '12', 'kozhikode'];
        
        for (const search of searchTerms) {
            const pipeline: any[] = [
                { $match: { role: UserRole.USER } },
                {
                    $lookup: {
                        from: 'orders',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'orders'
                    }
                },
                {
                    $lookup: {
                        from: 'addresses',
                        localField: 'address_ids',
                        foreignField: '_id',
                        as: 'addresses'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        displayName: 1,
                        email: 1,
                        phoneNumber: 1,
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
                }
            ];

            const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

            if ('inactive'.startsWith(searchLower) && searchLower.length >= 3) {
                searchOr.push({ isActive: false });
            } else if ('active'.startsWith(searchLower) && searchLower.length >= 3) {
                searchOr.push({ isActive: true });
            }
            
            pipeline.push({
                $match: { $or: searchOr }
            });

            const users = await UserModel.aggregate(pipeline);
            console.log(`Search: '${search}', Matches: ${users.length}`);
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
});
