export const TON_CONFIG = {
  PROJECT_WALLET: process.env.TON_PROJECT_WALLET,
  API_KEY: process.env.TON_API_KEY,
  WEBHOOK_SECRET: process.env.TON_WEBHOOK_SECRET,
  NETWORK: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet',
  API_ENDPOINT: process.env.NODE_ENV === 'production' 
    ? 'https://toncenter.com/api/v2' 
    : 'https://testnet.toncenter.com/api/v2'
}; 