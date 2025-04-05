/**
 * Utility functions for theme-related operations
 */

/**
 * Returns the appropriate Ethereum logo based on the current theme
 * @param theme The current theme ('light' or 'dark')
 * @returns The Ethereum logo image source
 */
export const getEthereumLogo = (theme: 'light' | 'dark') => {
  return theme === 'light'
    ? require('../assets/images/ethereum.png')
    : require('../assets/images/ethereums.png');
};
