/**
 * Utility functions for formatting various data types in the Thaler app
 */

/**
 * Formats a wallet address for display by showing only the first 6 and last 4 characters
 * @param address The wallet address to format
 * @returns Formatted address string or "Loading..." if address is null
 */
export const formatAddress = (address: string | null): string => {
  if (!address) return "Loading...";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Formats a timestamp into a human-readable date string
 * @param timestamp Unix timestamp in milliseconds
 * @returns Formatted date string (e.g., "Apr 5, 2025")
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Formats a balance string with appropriate decimal places
 * @param balance The balance as a string
 * @returns Formatted balance with commas and appropriate decimal places
 */
export const formatBalance = (balance: string): string => {
  const balanceNum = parseFloat(balance);
  return balanceNum.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  });
};

/**
 * Formats a number or string as a USD currency value
 * @param amount The amount to format as currency
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return numAmount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Formats a number as a percentage
 * @param value The value to format as percentage
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted percentage string (e.g., "12.34%")
 */
export const formatPercentage = (value: number | string, decimals: number = 2): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return `${numValue.toFixed(decimals)}%`;
};

/**
 * Formats a large number in a human-readable way (K, M, B)
 * @param value The value to format
 * @returns Formatted value with suffix (e.g., "1.2K", "3.4M")
 */
export const formatCompactNumber = (value: number): string => {
  if (value < 1000) {
    return value.toString();
  } else if (value < 1000000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else if (value < 1000000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
};
