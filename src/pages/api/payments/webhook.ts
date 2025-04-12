import { NextApiRequest, NextApiResponse } from 'next';
import { verifyTonSignature } from '../../../utils/ton';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Проверяем подпись от TON
    const isValid = await verifyTonSignature(req);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const { transaction } = req.body;
    const paymentId = transaction.comment;
    
    // Находим платеж в базе данных
    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Проверяем сумму платежа
    if (transaction.amount !== payment.amount * 1000000000) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Обновляем статус платежа
    payment.status = 'completed';
    payment.transactionId = transaction.id;
    await payment.save();

    // Обновляем баланс пользователя
    const user = await User.findOne({ userId: payment.userId });
    user.balance += payment.amount;
    await user.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error processing webhook' 
    });
  }
} 