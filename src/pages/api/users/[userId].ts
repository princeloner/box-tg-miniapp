import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongodb';
import { User } from '../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API Route Called:', {
    method: req.method,
    query: req.query,
    body: req.body
  });

  const { userId } = req.query;
  const username = req.query.username as string;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    await connectDB();
    console.log('MongoDB connected');

    switch (req.method) {
      case 'GET':
        try {
          console.log('Looking for user:', { userId, username });
          let user = await User.findOne({ userId: userId.toString() });
          console.log('Found user:', user);

          if (!user) {
            console.log('Creating new user');
            const newUser = {
              userId: userId.toString(),
              username: username || 'Anonymous',
              balance: 0,
              stats: {
                bestWin: '',
                totalWins: 0,
                totalSpentTON: 0,
                totalEarnedTON: 0,
                totalCasesOpened: 0
              },
              referrals: [],
              referredBy: null,
              createdAt: new Date()
            };

            try {
              user = await User.create(newUser);
              console.log('Created user:', user);
            } catch (createError) {
              if (createError.code === 11000) {
                // Если произошла ошибка дубликата, попробуем найти пользователя еще раз
                user = await User.findOne({ userId: userId.toString() });
                if (!user) {
                  throw new Error('Failed to create or find user');
                }
              } else {
                throw createError;
              }
            }
          }

          return res.status(200).json(user);
        } catch (error) {
          console.error('GET Error:', error);
          return res.status(500).json({ 
            message: 'Error fetching user',
            error: error.message 
          });
        }

      case 'PUT':
        try {
          const { balance, operation, amount, reason } = req.body;
          
          const user = await User.findOne({ userId: userId.toString() });
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

          // Обновляем статистику
          if (reason === 'case_opening') {
            user.stats.totalSpentTON += amount;
            user.stats.totalCasesOpened += 1;
          }

          // Обновляем баланс и статистику
          const updatedUser = await User.findOneAndUpdate(
            { userId: userId.toString() },
            { 
              $set: { 
                balance: balance,
                stats: user.stats
              }
            },
            { new: true }
          );

          return res.status(200).json(updatedUser);
        } catch (error) {
          console.error('Error updating user:', error);
          return res.status(500).json({ message: 'Error updating user' });
        }

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Connection Error:', error);
    return res.status(500).json({ 
      message: 'Error connecting to database',
      error: error.message 
    });
  }
} 