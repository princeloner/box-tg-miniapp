import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['payment', 'system', 'error']
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'unread'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema); 