"use client";
import React, { useState, useEffect } from "react";
import { LoadingScreen } from "./LoadingScreen";
import { Balance } from "./Balance";
import { GameCard } from "./GameCard";
import { Navigation } from "./Navigation";
import { useUser } from "../hooks/useUser";
import { useTelegram } from '../providers/TelegramProvider';
import { UserPage } from "./UserPage";
import { StakePage } from "./StakePage";
import { EarnPage } from "./EarnPage";
import { TaskPage } from "./TaskPage";
import { NotificationCenter } from "./NotificationCenter";

interface CaseOpening {
  username: string;
  caseType: "mystic" | "rainbow" | "golden" | "regular";
  prize: string;
}

export const MainComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("TASK");
  // Инициализируем хук useUser - нужен для получения данных пользователя
  useUser();
  const { ready: isTelegramReady } = useTelegram();
  const [lastOpening, setLastOpening] = useState<CaseOpening | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [forcedReady, setForcedReady] = useState(false);

  useEffect(() => {
    // Сокращаем время загрузки до 300 мс
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Безопасный таймаут для предотвращения бесконечной загрузки
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (!forcedReady) {
        console.warn('Safety timeout: forcing app to ready state');
        setForcedReady(true);
      }
    }, 1500); // 1.5 секунды максимальное ожидание
    
    return () => clearTimeout(safetyTimer);
  }, [forcedReady]);

  const handleCaseOpen = (caseType: "mystic" | "rainbow" | "golden" | "regular", prize: string) => {
    const username = "Аноним";
    
    setLastOpening({
      username: username,
      caseType,
      prize
    });
  };

  // Показываем загрузочный экран только если:
  // 1. Идет начальная загрузка И
  // 2. Telegram API не готов И 
  // 3. Не сработал принудительный таймаут (forcedReady)
  const isLoading = isInitialLoading && !isTelegramReady && !forcedReady;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#000000] text-white">
      <Balance lastOpening={lastOpening} />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {activeTab === "TASK" && (
          <GameCard onCaseOpen={handleCaseOpen} />
        )}
        {activeTab === "STAKE" && (
          <StakePage />
        )}
        {activeTab === "EARN" && (
          <EarnPage />
        )}
        {activeTab === "TASKS" && (
          <TaskPage />
        )}
        {activeTab === "USER" && (
          <UserPage />
        )}
      </div>
      <NotificationCenter />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}; 