import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  description: String,
  transactionId: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

export const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema); 