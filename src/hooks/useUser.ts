import { useState, useEffect } from 'react';
import { useTelegram } from '../providers/TelegramProvider';

export function useUser() {
  const { webApp } = useTelegram();
  const userId = webApp?.initDataUnsafe?.user?.id;
  const username = webApp?.initDataUnsafe?.user?.username || 'Anonymous';
  
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    if (!userId) {
      // Если ID пользователя не доступен, завершаем загрузку с дефолтными данными
      setData({
        userId: 'unknown',
        username: username || 'Anonymous',
        balance: 10,
        stats: {
          bestWin: '',
          totalWins: 0,
          totalSpentTON: 0,
          totalEarnedTON: 0,
          totalCasesOpened: 0
        },
        referrals: [],
        referredBy: null,
        createdAt: new Date()
      });
      setIsLoading(false);
      return;
    }
    
    // Создаем контроллер для отмены запроса по таймауту
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    try {
      const response = await fetch(`/api/users/${userId}?username=${encodeURIComponent(username)}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Failed to fetch user');
      const userData = await response.json();
      setData(userData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      // Создаем локальные данные пользователя в случае ошибки
      setData({
        userId: userId?.toString(),
        username: username || 'Anonymous',
        balance: 10,
        stats: {
          bestWin: '',
          totalWins: 0,
          totalSpentTON: 0,
          totalEarnedTON: 0,
          totalCasesOpened: 0
        },
        referrals: [],
        referredBy: null,
        createdAt: new Date()
      });
      setError(err);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const updateBalance = async (newBalance: number) => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ balance: newBalance })
      });
      
      if (!response.ok) throw new Error('Failed to update balance');
      const updatedUser = await response.json();
      setData(updatedUser);
      setError(null);
    } catch (error) {
      console.error('Error updating balance:', error);
      // Если не удалось обновить через API, обновляем локально
      if (data) {
        setData({
          ...data,
          balance: newBalance
        });
      }
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const mutate = async () => {
    setIsLoading(true);
    await fetchUser();
  };

  useEffect(() => {
    // Запускаем запрос данных
    fetchUser();
    
    // Добавляем дополнительный таймаут безопасности
    const safetyTimer = setTimeout(() => {
      if (isLoading) {
        console.warn('Safety timeout triggered for user data loading');
        setIsLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(safetyTimer);
  }, [userId]);

  return {
    data,
    isLoading,
    isError: error,
    mutate,
    updateBalance
  };
} 