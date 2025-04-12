'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import TonConnect from '@tonconnect/sdk';

let tonConnector: TonConnect | null = null;

// Инициализируем коннектор только на клиенте
if (typeof window !== 'undefined') {
  tonConnector = new TonConnect({
    manifestUrl: 'https://ton-connect.github.io/demo-dapp-with-react/tonconnect-manifest.json'
  });
}

interface TonContextType {
  connector: TonConnect | null;
  connected: boolean;
  wallet: any;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const TonContext = createContext<TonContextType | null>(null);

export const TonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      if (tonConnector) {
        await tonConnector.restoreConnection();
        setConnected(tonConnector.connected);
        setWallet(tonConnector.wallet);

        tonConnector.onStatusChange((wallet) => {
          setConnected(!!wallet);
          setWallet(wallet);
        });
      }
    };

    init();
  }, []);

  const connect = async () => {
    if (!tonConnector) return;

    try {
      const walletsList = await tonConnector.getWallets();
      
      // Используем первый доступный кошелек (обычно это TonKeeper)
      if (walletsList.length > 0) {
        const universalLink = tonConnector.connect({
          universalUrl: walletsList[0].universalUrl,
          bridgeUrl: walletsList[0].bridgeUrl
        });

        // Открываем ссылку через Telegram WebApp
        if (window.Telegram?.WebApp?.openTelegramLink) {
          window.Telegram.WebApp.openTelegramLink(universalLink);
        } else {
          // Запасной вариант - открываем в новом окне
          window.open(universalLink, '_blank');
        }
      } else {
        console.error('No available wallets found');
        window.Telegram?.WebApp?.showAlert('No TON wallets found. Please install TonKeeper or another TON wallet.');
      }
    } catch (error) {
      console.error('Connection error:', error);
      window.Telegram?.WebApp?.showAlert('Error connecting to wallet. Please try again.');
    }
  };

  const disconnect = async () => {
    if (tonConnector) {
      await tonConnector.disconnect();
    }
  };

  return (
    <TonContext.Provider value={{ 
      connector: tonConnector, 
      connected, 
      wallet, 
      connect, 
      disconnect 
    }}>
      {children}
    </TonContext.Provider>
  );
};

export const useTon = () => {
  const context = useContext(TonContext);
  if (!context) {
    throw new Error('useTon must be used within a TonProvider');
  }
  return context;
}; 