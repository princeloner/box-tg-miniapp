import { TonClient } from '@ton/ton';
import { TON_CONFIG } from '../config/ton';

export const tonClient = new TonClient({
  endpoint: TON_CONFIG.API_ENDPOINT,
  apiKey: TON_CONFIG.API_KEY
});

export const verifyTonSignature = async (req: any) => {
  const signature = req.headers['x-ton-signature'];
  if (!signature) return false;

  try {
    // Проверка подписи от TON API
    const message = JSON.stringify(req.body);
    const isValid = await tonClient.utils.verifySignature(
      message,
      signature,
      TON_CONFIG.WEBHOOK_SECRET
    );
    return isValid;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

export const createPaymentNotification = async (userId: string, amount: number, status: string) => {
  try {
    await fetch('/api/notifications/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        type: 'payment',
        message: `Payment ${status}: ${amount} TON`,
        amount,
        status
      })
    });
  } catch (error) {
    console.error('Notification creation error:', error);
  }
}; 