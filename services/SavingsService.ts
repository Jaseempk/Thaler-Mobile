import { ethers } from 'ethers';
import { 
  THALER_SAVINGS_POOL_ADDRESS, 
  THALER_SAVINGS_POOL_ABI,
  TIME_CONSTANTS
} from '../constants/Contracts';
import { 
  SavingsPool, 
  SavingsPoolCreationParams, 
  DepositParams, 
  WithdrawalParams,
  DonationProof 
} from '../models/savings';
import Config from '../constants/Config';

// Type for Privy context functions we need
type PrivyContextFunctions = {
  sendTransaction: (to: string, value: string, data?: string) => Promise<ethers.providers.TransactionResponse>;
  sendERC20Approval: (tokenAddress: string, spender: string, amount: string) => Promise<ethers.providers.TransactionResponse>;
};

export class SavingsService {
  private provider: ethers.providers.Provider;
  private signer: ethers.Signer | null;
  private contract: ethers.Contract | null = null;
  private privyWallet: any | null = null;
  private privyContext: PrivyContextFunctions | null = null;

  constructor(provider: ethers.providers.Provider, signer: ethers.Signer | null = null, privyWallet: any | null = null) {
    this.provider = provider;
    this.signer = signer;
    this.privyWallet = privyWallet;
    
    // Initialize contract with provider for read-only operations
    this.contract = new ethers.Contract(
      THALER_SAVINGS_POOL_ADDRESS,
      THALER_SAVINGS_POOL_ABI,
      this.provider
    );
    
    // If signer is available, connect contract with signer
    if (this.signer) {
      this.contract = this.contract.connect(this.signer);
    }
  }

  /**
   * Set a new signer for the service
   */
  setSigner(signer: ethers.Signer | null) {
    this.signer = signer;
    
    // Reinitialize contract with signer if available
    if (this.signer && this.contract) {
      this.contract = this.contract.connect(this.signer);
    }
  }
  
  /**
   * Set a Privy embedded wallet
   */
  setPrivyWallet(privyWallet: any) {
    this.privyWallet = privyWallet;
    
    // When using Privy wallet, we'll use their transaction methods
    // The contract instance is still useful for read operations
  }
  
  /**
   * Set Privy context functions for transactions
   */
  setPrivyContext(privyContext: PrivyContextFunctions) {
    this.privyContext = privyContext;
  }

  /**
   * Create a new savings pool
   */
  async createSavingsPool(params: SavingsPoolCreationParams): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    if (!this.signer && !this.privyWallet) {
      throw new Error('No signer or Privy wallet available');
    }

    try {
      let tx;
      const initialDepositValue = ethers.utils.parseEther(params.initialDeposit);
      const amountToSaveValue = ethers.utils.parseEther(params.amountToSave);

      if (params.tokenType === 'eth') {
        // Create ETH savings pool
        if (this.privyWallet && this.privyContext) {
          // Using Privy embedded wallet
          // Prepare transaction data for Privy
          const data = this.contract.interface.encodeFunctionData('createSavingsPoolEth', [
            amountToSaveValue,
            params.duration,
            initialDepositValue,
            params.totalIntervals
          ]);
          
          // Send transaction via Privy
          tx = await this.privyContext.sendTransaction(
            THALER_SAVINGS_POOL_ADDRESS,
            initialDepositValue.toString(),
            data
          );
        } else if (this.signer) {
          // Using regular ethers.js signer
          tx = await this.contract.createSavingsPoolEth(
            amountToSaveValue,
            params.duration,
            initialDepositValue,
            params.totalIntervals,
            { value: initialDepositValue }
          );
        } else {
          throw new Error('No valid signer available');
        }
      } else if (params.tokenType === 'erc20' && params.tokenAddress) {
        // For ERC20 tokens, we need to approve the contract first
        if (this.privyWallet && this.privyContext) {
          // Using Privy embedded wallet for ERC20
          // First approve the token spending
          await this.privyContext.sendERC20Approval(
            params.tokenAddress,
            THALER_SAVINGS_POOL_ADDRESS,
            params.initialDeposit
          );
          
          // Then create the savings pool
          const data = this.contract.interface.encodeFunctionData('createSavingsPoolERC20', [
            params.tokenAddress,
            amountToSaveValue,
            params.duration,
            initialDepositValue,
            params.totalIntervals
          ]);
          
          tx = await this.privyContext.sendTransaction(
            THALER_SAVINGS_POOL_ADDRESS,
            '0', // No ETH value for ERC20 pools
            data
          );
        } else if (this.signer) {
          // Using regular ethers.js signer
          // First approve token spending
          const erc20Contract = new ethers.Contract(
            params.tokenAddress,
            [
              'function approve(address spender, uint256 amount) returns (bool)'
            ],
            this.signer
          );
          
          await (await erc20Contract.approve(
            THALER_SAVINGS_POOL_ADDRESS,
            initialDepositValue
          )).wait();
          
          // Then create the savings pool
          tx = await this.contract.createSavingsPoolERC20(
            params.tokenAddress,
            amountToSaveValue,
            params.duration,
            initialDepositValue,
            params.totalIntervals
          );
        } else {
          throw new Error('No valid signer available');
        }
      } else {
        throw new Error('Invalid token type or missing token address');
      }

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Extract pool ID from event logs
      const event = receipt.events?.find((e: ethers.Event) => e.event === 'SavingsPoolCreated');
      if (!event) {
        throw new Error('Failed to extract pool ID from transaction');
      }
      
      // Return the pool ID
      return event.args.savingsPoolId;
    } catch (error) {
      console.error('Error creating savings pool:', error);
      throw error;
    }
  }

  /**
   * Deposit to an existing savings pool
   */
  async deposit(params: DepositParams): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    if (!this.signer && !this.privyWallet) {
      throw new Error('No signer or Privy wallet available');
    }

    try {
      // Get the savings pool to determine if it's ETH or ERC20
      const pool = await this.getSavingsPool(params.savingsPoolId);
      const depositAmount = ethers.utils.parseEther(params.depositAmount);
      
      let tx;
      if (pool.isEth) {
        // Deposit to ETH pool
        if (this.privyWallet && this.privyContext) {
          // Using Privy embedded wallet
          const data = this.contract.interface.encodeFunctionData('depositToEthSavingPool', [
            params.savingsPoolId,
            depositAmount
          ]);
          
          tx = await this.privyContext.sendTransaction(
            THALER_SAVINGS_POOL_ADDRESS,
            depositAmount.toString(),
            data
          );
        } else if (this.signer) {
          // Using regular ethers.js signer
          tx = await this.contract.depositToEthSavingPool(
            params.savingsPoolId,
            depositAmount,
            { value: depositAmount }
          );
        } else {
          throw new Error('No valid signer available');
        }
      } else {
        // Deposit to ERC20 pool
        if (this.privyWallet && this.privyContext) {
          // Using Privy embedded wallet
          // For ERC20, we need to approve the token spending first
          await this.privyContext.sendERC20Approval(
            pool.tokenToSave, // Token address from the pool
            THALER_SAVINGS_POOL_ADDRESS,
            params.depositAmount
          );
          
          const data = this.contract.interface.encodeFunctionData('depositToERC20SavingPool', [
            params.savingsPoolId,
            depositAmount
          ]);
          
          tx = await this.privyContext.sendTransaction(
            THALER_SAVINGS_POOL_ADDRESS,
            '0', // No ETH value for ERC20 deposits
            data
          );
        } else if (this.signer) {
          // Using regular ethers.js signer
          // First approve token spending
          const erc20Contract = new ethers.Contract(
            pool.tokenToSave, // Use tokenToSave instead of tokenAddress
            [
              'function approve(address spender, uint256 amount) returns (bool)'
            ],
            this.signer
          );
          
          await (await erc20Contract.approve(
            THALER_SAVINGS_POOL_ADDRESS,
            depositAmount
          )).wait();
          
          // Then deposit
          tx = await this.contract.depositToERC20SavingPool(
            params.savingsPoolId,
            depositAmount
          );
        } else {
          throw new Error('No valid signer available');
        }
      }

      // Wait for transaction to be mined
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error depositing to savings pool:', error);
      throw error;
    }
  }

  /**
   * Withdraw from a savings pool
   * For early withdrawals, a ZK proof of donation is required
   */
  async withdraw(params: WithdrawalParams): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    if (!this.signer && !this.privyWallet) {
      throw new Error('No signer or Privy wallet available');
    }

    try {
      // Get the savings pool to determine if it's ETH or ERC20
      const pool = await this.getSavingsPool(params.savingsPoolId);
      
      let tx;
      if (pool.endDate <= Date.now()) {
        // Normal withdrawal (pool has ended)
        if (pool.isEth) {
          if (this.privyWallet && this.privyContext) {
            // Using Privy embedded wallet
            const data = this.contract.interface.encodeFunctionData('withdrawFromEthSavingPool', [
              params.savingsPoolId,
              "0x", // Empty proof for normal withdrawals
              [] // Empty public inputs for normal withdrawals
            ]);
            
            tx = await this.privyContext.sendTransaction(
              THALER_SAVINGS_POOL_ADDRESS,
              '0',
              data
            );
          } else if (this.signer) {
            // Using regular ethers.js signer
            tx = await this.contract.withdrawFromEthSavingPool(
              params.savingsPoolId,
              "0x", // Empty proof for normal withdrawals
              [] // Empty public inputs for normal withdrawals
            );
          } else {
            throw new Error('No valid signer available');
          }
        } else {
          // Similar pattern for ERC20 withdrawals
          if (this.privyWallet && this.privyContext) {
            // Using Privy embedded wallet
            const data = this.contract.interface.encodeFunctionData('withdrawFromERC20SavingPool', [
              params.savingsPoolId,
              "0x", // Empty proof for normal withdrawals
              [] // Empty public inputs for normal withdrawals
            ]);
            
            tx = await this.privyContext.sendTransaction(
              THALER_SAVINGS_POOL_ADDRESS,
              '0',
              data
            );
          } else if (this.signer) {
            // Using regular ethers.js signer
            tx = await this.contract.withdrawFromERC20SavingPool(
              params.savingsPoolId,
              "0x", // Empty proof for normal withdrawals
              [] // Empty public inputs for normal withdrawals
            );
          } else {
            throw new Error('No valid signer available');
          }
        }
      } else {
        // Early withdrawal (requires ZK proof of donation)
        if (!params.proof || !params.publicInputs) {
          throw new Error('Proof and public inputs are required for early withdrawal');
        }
        
        if (pool.isEth) {
          if (this.privyWallet && this.privyContext) {
            // Using Privy embedded wallet
            const data = this.contract.interface.encodeFunctionData('withdrawFromEthSavingPool', [
              params.savingsPoolId,
              params.proof,
              params.publicInputs
            ]);
            
            tx = await this.privyContext.sendTransaction(
              THALER_SAVINGS_POOL_ADDRESS,
              '0',
              data
            );
          } else if (this.signer) {
            // Using regular ethers.js signer
            tx = await this.contract.withdrawFromEthSavingPool(
              params.savingsPoolId,
              params.proof,
              params.publicInputs
            );
          } else {
            throw new Error('No valid signer available');
          }
        } else {
          // Similar pattern for ERC20 early withdrawals
          if (this.privyWallet && this.privyContext) {
            // Using Privy embedded wallet
            const data = this.contract.interface.encodeFunctionData('withdrawFromERC20SavingPool', [
              params.savingsPoolId,
              params.proof,
              params.publicInputs
            ]);
            
            tx = await this.privyContext.sendTransaction(
              THALER_SAVINGS_POOL_ADDRESS,
              '0',
              data
            );
          } else if (this.signer) {
            // Using regular ethers.js signer
            tx = await this.contract.withdrawFromERC20SavingPool(
              params.savingsPoolId,
              params.proof,
              params.publicInputs
            );
          } else {
            throw new Error('No valid signer available');
          }
        }
      }

      // Wait for transaction to be mined
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error withdrawing from savings pool:', error);
      throw error;
    }
  }

  /**
   * Get a specific savings pool by ID
   */
  async getSavingsPool(poolId: string): Promise<SavingsPool> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const poolData = await this.contract.savingsPools(poolId);
      
      // Determine if this is an ETH pool
      const isEth = poolData.tokenToSave === '0x0000000000000000000000000000000000000000';
      
      // Calculate progress
      const totalSaved = ethers.utils.formatEther(poolData.totalSaved);
      const amountToSave = ethers.utils.formatEther(poolData.amountToSave);
      const progress = Math.min(
        100,
        Math.round((parseFloat(totalSaved) / parseFloat(amountToSave)) * 100)
      );

      return {
        id: poolId,
        user: poolData.user,
        endDate: poolData.endDate.toNumber() * 1000, // Convert to milliseconds
        duration: poolData.duration.toNumber(),
        startDate: poolData.startDate.toNumber() * 1000, // Convert to milliseconds
        totalSaved: totalSaved,
        tokenToSave: poolData.tokenToSave,
        amountToSave: amountToSave,
        totalIntervals: poolData.totalIntervals.toNumber(),
        initialDeposit: ethers.utils.formatEther(poolData.initialDeposit),
        nextDepositDate: poolData.nextDepositDate.toNumber() * 1000, // Convert to milliseconds
        numberOfDeposits: poolData.numberOfDeposits.toNumber(),
        lastDepositedTimestamp: poolData.lastDepositedTimestamp.toNumber() * 1000, // Convert to milliseconds
        isEth,
        progress,
        // For ERC20 tokens, we would need to fetch token details
        // This would be implemented in a real app
        tokenSymbol: isEth ? 'ETH' : 'Unknown',
        tokenDecimals: isEth ? 18 : 18,
      };
    } catch (error) {
      console.error('Error getting savings pool:', error);
      throw error;
    }
  }

  /**
   * Get all savings pools for a user
   */
  async getUserSavingsPools(userAddress: string): Promise<SavingsPool[]> {
    // Note: This is a simplified implementation
    // In a real app, we would need to query events to get all pool IDs for a user
    // For this demo, we'll return mock data
    
    // Mock implementation - in a real app, this would query the blockchain
    return [];
  }

  /**
   * Generate a donation proof for early withdrawal
   * This would integrate with the ZK proof generation system
   */
  async generateDonationProof(
    poolId: string, 
    donationAmount: string, 
    donationRecipient: string
  ): Promise<DonationProof> {
    // This is a placeholder for the ZK proof generation
    // In a real app, this would call a service to generate the proof
    
    // Mock implementation
    return {
      proof: "0x1234567890abcdef",
      publicInputs: ["0x1234567890abcdef", "0x1234567890abcdef"]
    };
  }
}
