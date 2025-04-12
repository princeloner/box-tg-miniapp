export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export const handlePaymentError = async (error: any, userId: string) => {
  console.error('Payment error:', error);

  let errorMessage = 'An unknown error occurred';
  let errorCode = 'UNKNOWN_ERROR';

  if (error instanceof PaymentError) {
    errorMessage = error.message;
    errorCode = error.code;
  }

  // Создаем уведомление об ошибке
  await createPaymentNotification(userId, 0, 'error');

  // Логируем ошибку
  await logError({
    type: 'payment',
    code: errorCode,
    message: errorMessage,
    userId,
    timestamp: new Date(),
    details: error.details || error
  });

  return {
    success: false,
    error: errorMessage,
    code: errorCode
  };
}; 