import React, { useState, useEffect } from "react";
import { useTelegram } from '../../providers/TelegramProvider';

interface GoldenCaseProps {
  isOpening: boolean;
  balance: number;
  cost: number;
  onOpen: () => void;
}

export const GoldenCase: React.FC<GoldenCaseProps> = ({ isOpening, balance, cost, onOpen }) => {
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
            {isEnglish ? 'Golden Case' : 'Золотой кейс'}
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
            {isEnglish ? 'Try your luck with the golden box' : 'В нем могут быть уникальные предметы'}
          </div>
        </div>
      </div>

      <button
        onClick={onOpen}
        disabled={isOpening}
        className={`w-full py-3 rounded-lg text-lg transition-colors ${
          balance < cost
            ? "bg-red-500 opacity-80"
            : "bg-[#FFD700] hover:bg-[#FFED4A] text-black"
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