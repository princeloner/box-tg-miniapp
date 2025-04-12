import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';

export const DepositModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { data: user } = useUser();

  const handleDeposit = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(amount),
          userId: user.userId,
          description: 'Account deposit'
        })
      });

      const { paymentUrl, paymentId } = await response.json();
      
      // Открываем TON Wallet для оплаты
      window.Telegram?.WebApp?.openTelegramLink(paymentUrl);
      
      // Начинаем проверку статуса платежа
      startPaymentCheck(paymentId);
    } catch (error) {
      console.error('Deposit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startPaymentCheck = async (paymentId: string) => {
    const checkInterval = setInterval(async () => {
      const status = await checkPaymentStatus(paymentId);
      if (status === 'completed') {
        clearInterval(checkInterval);
        onClose();
      }
    }, 5000); // Проверяем каждые 5 секунд
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#1E1E1E] p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Пополнить баланс</h2>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 mb-4 bg-[#2C2C2C] rounded"
          placeholder="Сумма в TON"
        />
        <button
          onClick={handleDeposit}
          disabled={isLoading || !amount}
          className="w-full bg-[#8B5CF6] p-2 rounded disabled:opacity-50"
        >
          {isLoading ? 'Загрузка...' : 'Пополнить'}
        </button>
      </div>
    </div>
  );
}; 