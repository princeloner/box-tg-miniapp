"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useTelegram } from '../providers/TelegramProvider';
import { useUser } from '../hooks/useUser';
import { useTon } from '../providers/TonProvider';
import type { CaseOpening } from '../types';
//import { useTonConnect } from '@tonconnect/ui-react';
//import { CHAIN } from '@tonconnect/protocol';

interface BalanceProps {
  lastOpening: CaseOpening | null;
}

export const Balance: React.FC<BalanceProps> = ({ lastOpening }) => {
  const { connected, wallet, connect } = useTon();
  const [currentOpening, setCurrentOpening] = useState<CaseOpening | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const { webApp } = useTelegram();
  const { data: user, isLoading, isError, mutate: refreshUser } = useUser();
  const currentUsername = webApp?.initDataUnsafe?.user?.username || "Аноним";
  
  // Добавляем console.log для отладки
  //console.log('Balance component:', { user, isLoading, isError });

  // Обработка открытия кейса
  useEffect(() => {
    if (lastOpening) {
      setCurrentOpening(lastOpening);
      // Обновляем данные только один раз после открытия кейса
      refreshUser();
    }
  }, [lastOpening]);

  // Случайные открытия для других пользователей
  useEffect(() => {
    if (!lastOpening) {
      const interval = setInterval(() => {
        setCurrentOpening({
          username: randomNames[Math.floor(Math.random() * randomNames.length)],
          caseType: Math.random() > 0.5 ? "golden" : "regular",
          prize: randomPrizes[Math.floor(Math.random() * randomPrizes.length)]
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [lastOpening]);

  const handleDeposit = async () => {
    try {
      if (!connected || !wallet) {
        // Если кошелек не подключен, показываем окно подключения
        await connect();
        return;
      }

      // Создаем транзакцию
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 минут
        messages: [
          {
            address: process.env.NEXT_PUBLIC_TON_PROJECT_WALLET!,
            amount: '5000000000', // 5 TON в наноTON
          }
        ]
      };

      // Отправляем транзакцию
      const result = await wallet.sendTransaction(transaction);
      console.log('Transaction sent:', result);

      // Обновляем баланс пользователя после успешной транзакции
      if (result.success) {
        await refreshUser();
      }
    } catch (error) {
      console.error('Deposit error:', error);
      window.Telegram?.WebApp?.showAlert('Error processing deposit. Please try again.');
    }
  };

  const handleWithdraw = () => {
    window.Telegram?.WebApp?.openTelegramLink('https://t.me/wallet?startattach=ton');
  };

  const renderUsername = (username: string) => {
    if (username === currentUsername) {
      return <span className="text-[#FFD700] font-bold animate-pulse">{username}</span>;
    }
    return username;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center w-full max-w-md">
        <div className="flex items-center justify-between p-4 bg-[#000000] w-full">
          <div className="text-center flex-1">
            <div className="text-2xl font-bold mb-2">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center w-full max-w-md">
        <div className="flex items-center justify-between p-4 bg-[#000000] w-full">
          <div className="text-center flex-1">
            <div className="text-2xl font-bold mb-2 text-red-500">Error loading balance</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col items-center w-full max-w-md mt-10">
      <div className="flex items-center justify-between p-4 bg-[#000000] w-full">
        <div className="text-center flex-1">
          <div className="text-2xl font-bold mb-2 flex items-center justify-center gap-2" style={{
            fontFamily: '"Doto", sans-serif',
            fontOpticalSizing: 'auto',
            fontWeight: 700,
            fontStyle: 'normal',
            fontVariationSettings: '"ROND" 0'
          }}>
            {user.balance.toFixed(2)}
            <Image
              src="/icons/ton.svg"
              alt="TON"
              width={24}
              height={24}
              className="inline-block"
            />
          </div>
          {currentOpening && (
            <div key={currentOpening.username + currentOpening.prize} className="animate-fade-in text-sm text-gray-400 mb-2">
              {renderUsername(currentOpening.username)} открыл {
                currentOpening.caseType === "golden" 
                  ? "золотой" 
                  : currentOpening.caseType === "rainbow" 
                    ? "радужный" 
                    : currentOpening.caseType === "mystic"
                      ? "мистический"
                      : "обычный"
              } кейс - {currentOpening.prize}
            </div>
          )}
          <div className="flex gap-4">
            <button 
              onClick={handleDeposit}
              className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg py-0.1 px-4 text-white transition-colors font-doto"
              style={{
                fontFamily: '"Doto", sans-serif',
                fontOpticalSizing: 'auto',
                fontWeight: 1000,
                fontStyle: 'normal',
                fontVariationSettings: '"ROND" 0'
              }}
            >
              {connected ? 'Deposit' : 'Connect Wallet'}
            </button>
            <button 
              onClick={handleWithdraw}
              className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg py-0.1 px-4 text-white transition-colors font-doto"
              style={{
                fontFamily: '"Doto", sans-serif',
                fontOpticalSizing: 'auto',
                fontWeight: 1000,
                fontStyle: 'normal',
                fontVariationSettings: '"ROND" 0'
              }}
            >
              Withdraw
            </button>
          </div>
          {connected && (
            <div className="text-sm mt-2 text-gray-400">
              Connected: {wallet?.account.address.slice(0, 6)}...{wallet?.account.address.slice(-4)}
            </div>
          )}
        </div>
      </div>
      {showDepositModal && (
        <DepositModal onClose={() => setShowDepositModal(false)} />
      )}
    </div>
  );
};

const randomNames = ["Alex", "Maria", "Ivan", "Elena", "Dmitry", "Anna"];
const randomPrizes = ["2 TON", "4 TON", "100 монет", "200 монет", "Уникальный NFT"];
