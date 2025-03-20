export default {
  APP_NAME: 'Thaler Savings',
  API_URL: 'https://api.thaler.example.com', // Replace with actual API URL when available
  BLOCKCHAIN: {
    NETWORK: 'sepolia', // or 'mainnet', 'goerli', etc.
    RPC_URL: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY', // Replace with your Infura key
    CHAIN_ID: 11155111, // Sepolia chain ID
  },
  PRIVY: {
    APP_ID: 'YOUR_PRIVY_APP_ID', // Replace with your Privy App ID
    LOGIN_METHODS: ['email', 'google', 'apple', 'passkey'],
    EMBEDDED_WALLET_ENABLED: true,
  },
  STORAGE_KEYS: {
    USER_ADDRESS: 'thaler_user_address',
    AUTH_TOKEN: 'thaler_auth_token',
    THEME: 'thaler_theme',
    USER_ID: 'thaler_user_id',
  },
  DEFAULT_DONATION_RECIPIENT: '0xF941d25cEB9A56f36B2E246eC13C125305544283', // Example recipient
  RPC_URL: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY', // For direct access in other files
};
