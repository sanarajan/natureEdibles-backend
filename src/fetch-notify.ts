import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://naturEdible_user:NatuReeDIBLE%40098@cluster0.y4qquty.mongodb.net/naturEdibles?retryWrites=true&w=majority&appName=naturEedibles-backend";

async function run() {
    try {
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        // Check if collection exists
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        // Let's check Notifications specifically
        const NotificationSchema = new mongoose.Schema({}, { strict: false });
        const Notification = mongoose.model('Notification', NotificationSchema);
        
        const count = await Notification.countDocuments();
        console.log(`Total Notifications in DB: ${count}`);

        const docs = await Notification.find().sort({ createdAt: -1 }).limit(5);
        console.log('Recent notifications:', JSON.stringify(docs, null, 2));
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}

run();
