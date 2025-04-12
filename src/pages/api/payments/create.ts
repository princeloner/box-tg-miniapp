import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { Payment } from '../../../models/Payment';
import { connectDB } from '../../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('Payment creation request received:', req.body);

  try {
    await connectDB();
    
    const { amount, userId, description } = req.body;

    if (!amount || !userId) {
      console.error('Missing required fields:', { amount, userId });
      return res.status(400).json({ 
        success: false, 
        message: 'Amount and userId are required' 
      });
    }

    // Проверяем наличие адреса кошелька
    const projectWallet = process.env.TON_PROJECT_WALLET;
    if (!projectWallet) {
      console.error('Project wallet address not configured');
      return res.status(500).json({
        success: false,
        message: 'Payment system not properly configured'
      });
    }

    // Создаем уникальный ID для платежа
    const paymentId = uuidv4();
    console.log('Generated payment ID:', paymentId);
    
    // Создаем платеж в базе данных
    const payment = await Payment.create({
      paymentId,
      userId,
      amount,
      status: 'pending',
      description: description || 'Account deposit',
      createdAt: new Date()
    });

    console.log('Payment created in database:', payment);

    // Формируем URL для оплаты через TON
    const tonAmount = Math.floor(amount * 1000000000); // Конвертируем в наноTON
    const paymentUrl = `https://t.me/wallet?startattach=ton&address=${projectWallet}&amount=${tonAmount}&comment=${paymentId}`;

    console.log('Generated payment URL:', paymentUrl);

    return res.status(200).json({ 
      success: true,
      paymentUrl,
      paymentId 
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error creating payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 