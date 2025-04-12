import React, { useState, useEffect } from "react";
import { useTelegram } from '../../providers/TelegramProvider';

interface MysticCaseProps {
  isOpening: boolean;
  balance: number;
  cost: number;
  onOpen: () => void;
}

export const MysticCase: React.FC<MysticCaseProps> = ({ isOpening, balance, cost, onOpen }) => {
  const [isEnglish, setIsEnglish] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

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
    <div className="p-4">
      <div className="text-center mb-4">
        <div className="text-gray-400 h-6 relative overflow-hidden" style={{
          fontFamily: '"Press Start 2P", system-ui',
          fontSize: '1.25rem'
        }}>
          <div
            className={`absolute w-full transition-transform duration-1000 ${
              isAnimating ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
            }`}
          >
            {isEnglish ? 'Mystic Case' : 'Мистический кейс'}
          </div>
        </div>
        <div className="text-gray-400 h-6 relative overflow-hidden mt-4" style={{
          fontFamily: '"Press Start 2P", system-ui',
          fontSize: '0.55rem'
        }}>
          <div
            className={`absolute w-full transition-transform duration-1000 ${
              isAnimating ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
            }`}
          >
            {isEnglish ? 'Secret?mystical objects falling from infinity' : 'Тайные мистические предметы падающие из бесконечности'}
          </div>
        </div>
      </div>

      <button
        onClick={onOpen}
        disabled={isOpening}
        className={`w-full py-3 rounded-lg text-lg transition-colors ${
          balance < cost
            ? "bg-red-500 opacity-80"
            : "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600"
        }`}
        style={{
          fontFamily: '"Press Start 2P", system-ui',
          fontSize: '0.875rem'
        }}
      >
        {isOpening
          ? "Opening..."
          : balance < cost
            ? `Недостаточно TON (${cost} TON)`
            : `Open Box ${cost} TON`}
      </button>
    </div>
  );
}; 