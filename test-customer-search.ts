import mongoose from 'mongoose';
import { UserModel } from './src/infrastructure/database/models/UserModel';
import { UserRole } from './src/constants/enums/UserRole';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
    try {
        const searchTerms = ['act', 'inact', 'sana', 'gmail', '987'];
        
        for (const search of searchTerms) {
            let matchQuery: any = { role: UserRole.USER };
            const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchRegex = new RegExp(escapedSearch, 'i');
            const searchLower = escapedSearch.toLowerCase();
            
            const searchOr: any[] = [
                { displayName: searchRegex },
                { email: searchRegex },
                { phoneNumber: searchRegex }
            ];

            if ('inactive'.startsWith(searchLower) && searchLower.length >= 3) {
                searchOr.push({ isActive: false });
            } else if ('active'.startsWith(searchLower) && searchLower.length >= 3) {
                searchOr.push({ isActive: true });
            }
            matchQuery.$or = searchOr;

            const count = await UserModel.countDocuments(matchQuery);
            console.log(`Search: '${search}', Matches: ${count}`);
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
});
