export interface SavingsPool {
  id: string; // The savings pool ID (bytes32 in the contract)
  user: string; // Owner of the savings pool
  endDate: number; // Timestamp when the savings period ends
  duration: number; // Total duration of the savings pool in seconds
  startDate: number; // Timestamp when the savings pool was created
  totalSaved: string; // Total amount saved so far (as string to handle large numbers)
  tokenToSave: string; // Token address (address(0) for ETH)
  amountToSave: string; // Total target amount to save
  totalIntervals: number; // Total number of intervals
  initialDeposit: string; // Initial deposit amount
  nextDepositDate: number; // Timestamp for the next scheduled deposit
  numberOfDeposits: number; // Number of deposits remaining
  lastDepositedTimestamp?: number; // Timestamp of the last deposit (optional for compatibility)
  isEth: boolean; // Whether this is an ETH or ERC20 pool
  progress: number; // Calculated progress (0-100%)
  tokenSymbol: string; // Symbol of the token (ETH for ETH pools, token symbol for ERC20 pools)
  tokenDecimals?: number; // Decimals of the token (optional)
}

export interface SavingsPoolCreationParams {
  tokenType: 'eth' | 'erc20';
  tokenAddress?: string; // Required for ERC20 pools
  amountToSave: string;
  duration: number; // In seconds
  initialDeposit: string;
  totalIntervals: number;
}

export interface DepositParams {
  savingsPoolId: string;
  depositAmount: string;
}

export interface WithdrawalParams {
  savingsPoolId: string;
  proof?: string; // ZK proof for early withdrawal
  publicInputs?: string[]; // Public inputs for the ZK proof
}

export interface DonationProof {
  proof: string;
  publicInputs: string[];
}

export enum SavingsPoolStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  WITHDRAWN = 'withdrawn'
}
