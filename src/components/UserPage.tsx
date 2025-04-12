"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useTelegram } from '../providers/TelegramProvider';

interface UserStats {
  totalCases: number;
  totalWins: number;
  bestWin: string;
  totalSpent: number;
  totalEarned: number;
}

export const UserPage: React.FC = () => {
  const [isEnglish, setIsEnglish] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const { webApp } = useTelegram();
  const username = webApp?.initDataUnsafe?.user?.username || "Аноним";

  const [stats] = useState<UserStats>({
    totalCases: 125,
    totalWins: 80,
    bestWin: "Уникальный NFT",
    totalSpent: 150,
    totalEarned: 180,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setIsEnglish(prev => !prev);
        setIsAnimating(false);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="text-center mb-8">
        <div className="text-gray-400 h-8 relative overflow-hidden" style={{
          fontFamily: '"Press Start 2P", system-ui',
          fontSize: '1.25rem'
        }}>
          <div className={`absolute w-full transition-transform duration-1000 ${
            isAnimating ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'
          }`}>
            {isEnglish ? 'Profile Stats' : 'Статистика'}
          </div>
        </div>
      </div>

      <div className="bg-[#2c2c2c] p-6 rounded-lg w-full max-w-md">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[#8B5CF6] rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold" style={{
              fontFamily: '"Press Start 2P", system-ui',
              fontSize: '1rem'
            }}>
              {username[0]?.toUpperCase() || 'A'}
            </span>
          </div>
          <div style={{
            fontFamily: '"Press Start 2P", system-ui',
            fontSize: '0.875rem'
          }}>
            {username}
          </div>
        </div>

        <div className="space-y-4" style={{
          fontFamily: '"Press Start 2P", system-ui',
          fontSize: '0.75rem'
        }}>
          <div className="flex justify-between">
            <span className="text-gray-400">
              {isEnglish ? 'Cases Opened' : 'Открыто кейсов'}:
            </span>
            <span>{stats.totalCases}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">
              {isEnglish ? 'Total Wins' : 'Всего побед'}:
            </span>
            <span>{stats.totalWins}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">
              {isEnglish ? 'Best Win' : 'Лучший выигрыш'}:
            </span>
            <span className="text-[#FFD700]">{stats.bestWin}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">
              {isEnglish ? 'Total Spent' : 'Потрачено TON'}:
            </span>
            <span className="flex items-center gap-1">
              {stats.totalSpent}
              <Image src="/icons/ton.svg" alt="TON" width={16} height={16} />
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">
              {isEnglish ? 'Total Earned' : 'Заработано TON'}:
            </span>
            <span className="flex items-center gap-1">
              {stats.totalEarned}
              <Image src="/icons/ton.svg" alt="TON" width={16} height={16} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 