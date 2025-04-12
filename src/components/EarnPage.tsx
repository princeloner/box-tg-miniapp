import React, { useState, useEffect } from "react";
import { useTelegram } from '../providers/TelegramProvider';
import Image from "next/image";

export const EarnPage: React.FC = () => {
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
    <div className="p-6 flex flex-col items-center">
      <div className="text-center mb-8">
        <div className="text-gray-400 h-8 relative overflow-hidden" style={{
          fontFamily: '"Press Start 2P", system-ui',
          fontSize: '1.25rem'
        }}>
          <div className={`absolute w-full transition-transform duration-1000 ${
            isAnimating ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'
          }`}>
            {isEnglish ? 'Earn TON' : 'Заработать TON'}
          </div>
        </div>
      </div>

      <div className="bg-[#2c2c2c] p-6 rounded-lg w-full max-w-md space-y-4">
        <div className="flex items-center justify-between p-4 border border-[#8B5CF6] rounded-lg">
          <div style={{
            fontFamily: '"Press Start 2P", system-ui',
            fontSize: '0.75rem'
          }}>
            {isEnglish ? 'Invite Friends' : 'Пригласить друзей'}
          </div>
          <div className="text-[#8B5CF6]" style={{
            fontFamily: '"Press Start 2P", system-ui',
            fontSize: '0.75rem'
          }}>
            +1 TON
          </div>
        </div>
      </div>
    </div>
  );
}; 