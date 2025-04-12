import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 10
  },
  referrals: [{
    type: String, // userId рефералов
    ref: 'User'
  }],
  referredBy: {
    type: String, // userId пригласившего пользователя
    ref: 'User',
    default: null
  },
  stats: {
    bestWin: {
      type: String,
      default: ''
    },
    totalWins: {
      type: Number,
      default: 0
    },
    totalSpentTON: {
      type: Number,
      default: 0
    },
    totalEarnedTON: {
      type: Number,
      default: 0
    },
    totalCasesOpened: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save', async function(next) {
  try {
    if (this.isNew) {
      const model = mongoose.models.User || mongoose.model('User', UserSchema);
      await model.collection.dropIndexes();
    }
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.index({ userId: 1 }, { unique: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema); 