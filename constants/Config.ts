export default {
  APP_NAME: "Thaler Savings",
  API_URL: "https://api.thaler.example.com", // Replace with actual API URL when available
  BLOCKCHAIN: {
    NETWORK: "base-sepolia", // or 'mainnet', 'goerli', etc.
    RPC_URL: process.env.EXPO_PUBLIC_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    CHAIN_ID: 84532, // Sepolia chain ID
  },
  PRIVY: {
    APP_ID: process.env.EXPO_PUBLIC_PRIVY_APP_ID || '',
    CLIENT_ID: process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || '',
    LOGIN_METHODS: ["email", "google", "apple", "passkey"],
    EMBEDDED_WALLET_ENABLED: true,
  },
  STORAGE_KEYS: {
    USER_ADDRESS: 'user_address',
    AUTH_TOKEN: "thaler_auth_token",
    THEME: "thaler_theme",
    USER_ID: 'user_id',
  },
  DEFAULT_DONATION_RECIPIENT: "0xF941d25cEB9A56f36B2E246eC13C125305544283", // Example recipient
  RPC_URL:
    "https://base-sepolia.g.alchemy.com/v2/txntl9XYKWyIkkmj1p0JcecUKxqt9327", // For direct access in other files
};
