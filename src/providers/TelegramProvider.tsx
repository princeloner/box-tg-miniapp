"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { postEvent } from '@telegram-apps/sdk';

interface TelegramContext {
  webApp: Record<string, unknown> | null;
  ready: boolean;
  theme: Record<string, string>;
  isFullscreen: boolean;
  toggleFullscreen: () => Promise<void>;
}

// Определение типа для event handler параметров
interface ViewportChangeEvent {
  isStateStable: boolean;
  [key: string]: unknown;
}

// Определение типа для Telegram WebApp
interface TelegramWebApp {
  WebApp?: {
    themeParams?: {
      bg_color?: string;
      text_color?: string;
      [key: string]: string | undefined;
    };
    viewportHeight?: number;
    viewportStableHeight?: number;
    headerHeight?: number;
    setHeaderColor?: (color: string) => void;
    setBackgroundColor?: (color: string) => void;
    isVerticalSwipesEnabled?: boolean;
    MainButton?: { hide: () => void };
    BackButton?: { hide: () => void };
    enableClosingConfirmation?: () => void;
    expand?: () => void;
    ready?: () => void;
    onEvent?: (event: string, handler: (params: ViewportChangeEvent) => void) => void;
  };
}

// Расширяем интерфейс Window для поддержки Telegram
declare global {
  interface Window {
    Telegram?: TelegramWebApp;
  }
}

const defaultTheme = {
  backgroundColor: '#0a0a0a',
  color: '#000000',
} as const;

type ThemeType = {
  backgroundColor: string;
  color: string;
};

const TelegramContext = createContext<TelegramContext>({
  webApp: null,
  ready: false,
  theme: defaultTheme,
  isFullscreen: false,
  toggleFullscreen: async () => {}
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [webApp, setWebApp] = useState<Record<string, unknown> | null>(null);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<ThemeType>(defaultTheme);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [initAttempts, setInitAttempts] = useState(0);

  const toggleFullscreen = async () => {
    try {
      if (isFullscreenMode) {
        await postEvent('web_app_exit_fullscreen');
      } else {
        await postEvent('web_app_request_fullscreen');
      }
      setIsFullscreenMode(!isFullscreenMode);
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const waitForTelegram = () => {
      // Ограничиваем количество попыток инициализации 
      if (initAttempts > 10) {
        console.warn('Failed to initialize Telegram WebApp after multiple attempts');
        setReady(true); // Помечаем как готово для предотвращения бесконечной загрузки
        return;
      }

      if (window.Telegram?.WebApp) {
        const app = window.Telegram.WebApp;
        
        // Инициализируем тему
        if (app.themeParams) {
          const newTheme: ThemeType = {
            backgroundColor: app.themeParams.bg_color || defaultTheme.backgroundColor,
            color: app.themeParams.text_color || defaultTheme.color,
          };
          setTheme(newTheme);
        }

        try {
          // Безопасно устанавливаем цвета и параметры с проверкой совместимости
          if (typeof app.setHeaderColor === 'function') {
            app.setHeaderColor('#000000');
          }
          
          if (typeof app.setBackgroundColor === 'function') {
            app.setBackgroundColor('#000000');
          }
          
          // Отключаем вертикальные свайпы если функция доступна
          if ('isVerticalSwipesEnabled' in app) {
            app.isVerticalSwipesEnabled = false;
          }

          // Настраиваем параметры хедера и отступы
          if (app.MainButton && typeof app.MainButton.hide === 'function') {
            app.MainButton.hide();
          }
          
          if (app.BackButton && typeof app.BackButton.hide === 'function') {
            app.BackButton.hide();
          }
          
          if (typeof app.enableClosingConfirmation === 'function') {
            app.enableClosingConfirmation();
          }
        } catch (e) {
          console.warn('Some Telegram WebApp functions are not available:', e);
        }
        
        // Добавляем CSS переменные для безопасных зон
        try {
          if (document && document.documentElement) {
            document.documentElement.style.setProperty(
              '--tg-viewport-height', 
              `${app.viewportHeight || 100}vh`
            );
            document.documentElement.style.setProperty(
              '--tg-viewport-stable-height', 
              `${app.viewportStableHeight || 100}vh`
            );
            document.documentElement.style.setProperty(
              '--tg-viewport-padding-top', 
              `${app.headerHeight || 0}px`
            );
          }
        } catch (e) {
          console.warn('Failed to set viewport CSS variables:', e);
        }

        // Обновляем переменные при изменении viewport
        try {
          if (typeof app.onEvent === 'function') {
            app.onEvent('viewportChanged', (params: ViewportChangeEvent) => {
              if (document && document.documentElement) {
                document.documentElement.style.setProperty(
                  '--tg-viewport-height',
                  `${app.viewportHeight || 100}vh`
                );
                if (params.isStateStable) {
                  document.documentElement.style.setProperty(
                    '--tg-viewport-stable-height',
                    `${app.viewportStableHeight || 100}vh`
                  );
                }
              }
            });
          }
        } catch (e) {
          console.warn('Failed to set viewport event handler:', e);
        }

        // Запрашиваем полноэкранный режим - удаляем этот код, так как он вызывает ошибку
        const initFullscreen = async () => {
          try {
            // Отключаем попытку запроса fullscreen, который может вызывать ошибку
            // await postEvent('web_app_request_fullscreen');
            setIsFullscreenMode(false); // Устанавливаем false, так как fullscreen не будет запрошен
          } catch (err) {
            console.warn('Fullscreen request failed:', err);
          }
        };

        // Не ждем разрешения промиса, который может зависнуть
        initFullscreen().catch(console.warn);
        
        // Безопасно вызываем expand и ready
        try {
          if (typeof app.expand === 'function') {
            app.expand();
          }
          
          if (typeof app.ready === 'function') {
            app.ready();
          }
        } catch (e) {
          console.warn('Failed to call expand/ready:', e);
        }
        
        setWebApp(app as Record<string, unknown>);
        setReady(true);
      } else {
        setInitAttempts(prev => prev + 1);
        setTimeout(waitForTelegram, 500); // Увеличиваем интервал до 500мс
      }
    };

    waitForTelegram();
    
    // Добавляем таймаут для безусловной установки ready=true
    const safetyTimer = setTimeout(() => {
      if (!ready) {
        console.warn('Safety timeout: forcing app to ready state');
        setReady(true);
      }
    }, 5000); // 5 секунд максимальное ожидание
    
    return () => clearTimeout(safetyTimer);
  }, [initAttempts, ready]);

  return (
    <TelegramContext.Provider value={{
      webApp,
      ready,
      theme,
      isFullscreen: isFullscreenMode,
      toggleFullscreen
    }}>
      {children}
    </TelegramContext.Provider>
  );
}

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }
  return context;
};