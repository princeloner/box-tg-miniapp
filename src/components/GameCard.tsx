"use client";
import React, { useState } from "react";
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GiftBox3D } from './GiftBox3D';
import { useTelegram } from '../providers/TelegramProvider';
import { RegularCase } from './cases/RegularCase';
import { GoldenCase } from './cases/GoldenCase';
import { RainbowCase } from './cases/RainbowCase';
import { MysticCase } from './cases/MysticCase';
import { useUser } from '../hooks/useUser';

interface GameCardProps {
  onCaseOpen: (caseType: "mystic" | "rainbow" | "golden" | "regular", prize: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ onCaseOpen }) => {
  const { webApp } = useTelegram();
  const { data: user, updateBalance } = useUser();
  const [currentCase, setCurrentCase] = useState<"mystic" | "rainbow" | "golden" | "regular">("regular");
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [targetCase, setTargetCase] = useState("regular");
  const [prize, setPrize] = useState<any>(null);
  const [showEffects, setShowEffects] = useState(false);
  const [showRainbowEffect, setShowRainbowEffect] = useState(false);
  const [showMysticEffect, setShowMysticEffect] = useState(false);

  const costs = {
    regular: 1,
    golden: 2,
    rainbow: 5,
    mystic: 7
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setSwipeX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - swipeX;
    
    const progress = Math.max(-100, Math.min(100, diff / 2));
    setSwipeProgress(progress);

    const cases = ["regular", "golden", "rainbow", "mystic"];
    const currentIndex = cases.indexOf(currentCase);
    
    if (progress <= -50) {
      const nextIndex = Math.min(cases.length - 1, currentIndex + 1);
      setTargetCase(cases[nextIndex]);
    } else if (progress >= 50) {
      const prevIndex = Math.max(0, currentIndex - 1);
      setTargetCase(cases[prevIndex]);
    } else {
      setTargetCase(currentCase);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (swipeProgress <= -50 || swipeProgress >= 50) {
      setCurrentCase(targetCase);
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.impactOccurred('medium');
      } else if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
    requestAnimationFrame(() => {
      setSwipeProgress(0);
    });
  };

  const playSound = () => {
    const audio = new Audio("/case-open.mp3");
    audio.play().catch((err) => console.error("Error playing sound:", err));
  };

  const createConfetti = () => {
    const colors = ["#357AFF", "#FFD700", "#FF6B6B", "#4ECB71"];
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`,
    }));
  };

  const openCase = async () => {
    if (!user) return;
    
    const cost = costs[currentCase];
    if (user.balance < cost || isOpening) {
      return;
    }

    try {
      setIsOpening(true);
      
      // Обновляем баланс через API
      const response = await fetch(`/api/users/${user.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          balance: user.balance - cost,
          operation: 'subtract',
          amount: cost,
          reason: 'case_opening'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update balance');
      }

      const updatedUser = await response.json();
      
      // Обновляем локальное состояние пользователя
      await updateBalance(updatedUser.balance);

      // Эффекты и хаптик фидбек
      if (currentCase === "rainbow") {
        setShowRainbowEffect(true);
        setTimeout(() => setShowRainbowEffect(false), 4500);
      } else if (currentCase === "mystic") {
        setShowMysticEffect(true);
        setTimeout(() => setShowMysticEffect(false), 4500);
      }

      if (window.Telegram?.WebApp?.HapticFeedback) {
        if (currentCase === "rainbow") {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
          setTimeout(() => window.Telegram.WebApp.HapticFeedback.impactOccurred('medium'), 100);
          setTimeout(() => window.Telegram.WebApp.HapticFeedback.impactOccurred('light'), 200);
          setTimeout(() => window.Telegram.WebApp.HapticFeedback.impactOccurred('medium'), 300);
          setTimeout(() => window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy'), 400);
        } else if (currentCase === "golden") {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
          setTimeout(() => window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy'), 150);
        } else {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }
      }
      
      // Вызываем колбэк с информацией об открытии
      onCaseOpen(currentCase, `${cost} TON`);
      
      setShowEffects(false);
      playSound();

      setTimeout(() => {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
        
        let random = Math.random();
        let prizeResult;

        if (currentCase === "rainbow") {
          if (random < 0.3) {
            prizeResult = {
              type: "NFT",
              value: "Легендарный NFT",
              image: "/rainbow-nft-prize.png",
              confetti: createConfetti(),
            };
          } else if (random < 0.6) {
            prizeResult = {
              type: "TON",
              value: "10 TON",
              amount: 10,
              coins: Array.from({ length: 20 }).map((_, i) => ({
                id: i,
                left: `${Math.random() * 100}%`,
                delay: `${Math.random() * 0.5}s`,
              })),
            };
          } else {
            prizeResult = {
              type: "COINS",
              value: "500 монет",
              amount: 500,
            };
          }
        } else if (currentCase === "golden") {
          if (random < 0.2) {
            prizeResult = {
              type: "NFT",
              value: "Уникальный NFT",
              image: "/nft-prize.png",
              confetti: createConfetti(),
            };
          } else if (random < 0.5) {
            prizeResult = {
              type: "TON",
              value: "4 TON",
              amount: 4,
              coins: Array.from({ length: 15 }).map((_, i) => ({
                id: i,
                left: `${Math.random() * 100}%`,
                delay: `${Math.random() * 0.5}s`,
              })),
            };
          } else {
            prizeResult = {
              type: "COINS",
              value: "200 монет",
              amount: 200,
            };
          }
        } else {
          if (random < 0.1) {
            prizeResult = {
              type: "NFT",
              value: "Уникальный NFT",
              image: "/nft-prize.png",
              confetti: createConfetti(),
            };
          } else if (random < 0.3) {
            prizeResult = {
              type: "TON",
              value: "2 TON",
              amount: 2,
              coins: Array.from({ length: 10 }).map((_, i) => ({
                id: i,
                left: `${Math.random() * 100}%`,
                delay: `${Math.random() * 0.5}s`,
              })),
            };
          } else {
            prizeResult = {
              type: "COINS",
              value: "100 монет",
              amount: 100,
            };
          }
        }

        setPrize(prizeResult);
        if (prizeResult.type === "TON") {
          updateBalance((prev) => prev + prizeResult.amount);
        }
        setShowEffects(true);
        setIsOpening(false);
      }, 2000);
    } catch (error) {
      console.error("Error opening case:", error);
      setError("Произошла ошибка при открытии кейса. Пожалуйста, попробуйте позже.");
    } finally {
      // Убедимся, что состояние открытия сбрасывается в любом случае
      setTimeout(() => {
        setIsOpening(false);
      }, 1000); // Небольшая задержка для анимации
    }
  };

  const renderCase = () => {
    const props = {
      isOpening,
      balance: user?.balance || 0,
      cost: costs[currentCase],
      onOpen: openCase
    };

    switch (currentCase) {
      case "mystic":
        return <MysticCase {...props} />;
      case "rainbow":
        return <RainbowCase {...props} />;
      case "golden":
        return <GoldenCase {...props} />;
      default:
        return <RegularCase {...props} />;
    }
  };

  return (
    <>
      {showRainbowEffect && <div className="rainbow-fullscreen" />}
      {showMysticEffect && (
        <>
          <div className="mystic-fullscreen" />
          <div className="meteor" />
          <div className="explosion" />
        </>
      )}
      <div
        className={`rounded-xl w-full max-w-md mb-[1.5px] overflow-hidden ${
          currentCase === "rainbow" 
            ? "rainbow-case" 
            : currentCase === "mystic"
              ? "mystic-case"
              : "bg-[#1c1c1c]"
        } ${showRainbowEffect || showMysticEffect ? 'content-fade' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={
          currentCase === "rainbow" 
            ? "rainbow-inner p-6" 
            : currentCase === "mystic"
              ? "mystic-inner p-6"
              : "p-6"
        }>
          <div className="flex justify-center gap-2 mb-6 mt-0.3">
            <div 
              className={`w-2 h-2 rounded-full transition-colors ${
                currentCase === "regular" ? "bg-[#8B5CF6]" : "bg-gray-600"
              }`}
            />
            <div 
              className={`w-2 h-2 rounded-full transition-colors ${
                currentCase === "golden" ? "bg-[#FFD700]" : "bg-gray-600"
              }`}
            />
            <div 
              className={`w-2 h-2 rounded-full transition-colors ${
                currentCase === "rainbow" ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" : "bg-gray-600"
              }`}
            />
            <div 
              className={`w-2 h-2 rounded-full transition-colors ${
                currentCase === "mystic" ? "bg-gradient-to-r from-purple-900 via-indigo-900 to-violet-900" : "bg-gray-600"
              }`}
            />
          </div>

          <div className="relative w-full aspect-square max-w-[280px] min-h-[280px] mx-auto">
            <div className="case-container h-full w-full"
              style={{ '--swipe-progress': `${swipeProgress}%` } as React.CSSProperties}
            >
              <div 
                className={`case-slide h-full w-full ${isDragging ? 'transition-none' : ''}`}
                data-progress={swipeProgress > 0 ? 1 : -1}
              >
                <Canvas 
                  camera={{ 
                    position: [
                      0, 
                      -0.5, 
                      currentCase === "mystic" 
                        ? 3.5 
                        : currentCase === "rainbow" 
                          ? 1 
                          : currentCase === "golden" 
                            ? 1.5 
                            : 2.5
                    ] 
                  }}
                  className="h-full w-full pointer-events-none"
                >
                  <GiftBox3D 
                    isOpening={isOpening} 
                    isGolden={currentCase === "golden"}
                    isRainbow={currentCase === "rainbow"}
                    isMystic={currentCase === "mystic"}
                  />
                  <OrbitControls 
                    enableZoom={false}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 2}
                    enabled={false}
                  />
                </Canvas>
              </div>
            </div>
          </div>

          {renderCase()}

          {prize && !isOpening && (
            <div className="mt-1 w-full">
              <div className={`bg-[#2c2c2c] py-2.5 rounded-lg w-full text-center ${showEffects ? "glow" : ""}`}>
                <p className="text-lg font-medium" style={{
                  fontFamily: '"Press Start 2P", system-ui',
                  fontSize: '0.875rem'
                }}>
                  {prize.value}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}; 