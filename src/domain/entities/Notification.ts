import { ObjectId } from 'mongoose';

export interface Notification {
    _id?: string | ObjectId;
    userId: string | ObjectId;
    type: string;
    title: string;
    message: string;
    relatedId?: string | ObjectId;
    isRead: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
