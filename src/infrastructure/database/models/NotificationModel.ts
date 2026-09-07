import mongoose, { Schema, Document } from 'mongoose';
import { Notification as NotificationEntity } from '../../../domain/entities/Notification';

export interface INotificationDocument extends Omit<NotificationEntity, '_id'>, Document {}

const NotificationSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false }
}, {
    timestamps: true
});

export const NotificationModel = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
