import mongoose from 'mongoose';
import { NotificationModel } from './infrastructure/database/models/NotificationModel';

async function run() {
    try {
        await mongoose.connect('mongodb://localhost:27017/natureEdibles');
        console.log('Connected to DB');

        const testId = new mongoose.Types.ObjectId();
        
        const doc = new NotificationModel({
            userId: testId.toString(),
            type: 'TEST_TYPE',
            title: 'Test Notification',
            message: 'This is a test notification.',
            relatedId: testId.toString()
        });

        await doc.save();
        console.log('Successfully saved notification:', doc.toObject());
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error saving notification:', error);
    }
}

run();
