import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongodb';
import { User } from '../../../models/User';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'default_admin_token_123';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Проверка авторизации
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectDB();

    // GET запрос для получения списка пользователей
    if (req.method === 'GET') {
      const users = await User.find({})
        .select('userId username balance stats referrals createdAt')
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json(users);
    }

    // POST запрос для обновления баланса
    if (req.method === 'POST') {
      const { userId, amount, operation, reason } = req.body;

      if (!userId || amount === undefined || !operation) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let newBalance;
      if (operation === 'add') {
        newBalance = user.balance + amount;
      } else if (operation === 'subtract') {
        newBalance = user.balance - amount;
        // Обновляем статистику
        if (reason === 'case_opening') {
          user.stats.totalSpentTON += amount;
          user.stats.totalCasesOpened += 1;
        }
      } else {
        return res.status(400).json({ message: 'Invalid operation' });
      }

      // Обновляем баланс и статистику
      const updatedUser = await User.findOneAndUpdate(
        { userId },
        { 
          $set: { 
            balance: newBalance,
            stats: user.stats
          }
        },
        { new: true }
      ).select('userId username balance stats');

      return res.status(200).json(updatedUser);
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Admin API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 