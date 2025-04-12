const initFullscreen = () => {
  try {
    // Проверка наличия Telegram API
    if (!window.Telegram?.WebApp) {
      console.warn('Telegram WebApp not available');
      return;
    }
    
    // Безопасная установка стилей
    if (document && document.documentElement) {
      document.documentElement.style.setProperty('--tg-viewport-height', '100vh');
      document.documentElement.style.setProperty('--tg-viewport-stable-height', '100vh');
    }
    
    // Используйте функции, проверяя их доступность
    if (window.Telegram.WebApp.isExpanded !== undefined) {
      window.Telegram.WebApp.expand();
    }
  } catch (error) {
    console.warn('Fullscreen initialization failed:', error);
  }
};

const waitForTelegram = () => {
  if (!window.Telegram) {
    console.warn('Telegram environment not detected');
    return;
  }
  
  // Продолжайте только если API доступно
  initFullscreen();
  // Другие инициализации...
};

if (window.Telegram?.WebApp?.isVersionAtLeast('6.1')) {
  // Вызывать методы, поддерживаемые в новой версии
} else {
  // Альтернативная логика для старых версий
} 