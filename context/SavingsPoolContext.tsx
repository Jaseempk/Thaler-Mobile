import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { useWallet } from "./WalletContext";
import { THALER_SAVINGS_POOL_ABI, THALER_SAVINGS_POOL_ADDRESS, TIME_CONSTANTS } from "../constants/Contracts";

// Define the structure for a savings pool
interface SavingsPool {
  id: string; // savingsPoolId from contract
  user: string;
  tokenToSave: string;
  amountToSave: string;
  totalSaved: string;
  duration: number;
  startDate: number;
  endDate: number;
  nextDepositDate: number;
  numberOfDeposits: number;
  totalIntervals: number;
  initialDeposit: string;
  progress: number; // Calculated field
  isEth: boolean;
  tokenSymbol: string;
}

interface SavingsPoolContextType {
  pools: SavingsPool[];
  isLoading: boolean;
  error: string | null;
  createEthSavingsPool: (
    amountToSave: string,
    duration: number,
    initialDeposit: string,
    totalIntervals: number
  ) => Promise<void>;
  createERC20SavingsPool: (
    tokenAddress: string,
    amountToSave: string,
    duration: number,
    initialDeposit: string,
    totalIntervals: number
  ) => Promise<void>;
  depositToEthPool: (poolId: string, amount: string) => Promise<void>;
  depositToERC20Pool: (poolId: string, amount: string) => Promise<void>;
  withdrawFromEthPool: (
    poolId: string,
    proof: string,
    publicInputs: string[]
  ) => Promise<void>;
  withdrawFromERC20Pool: (
    poolId: string,
    proof: string,
    publicInputs: string[]
  ) => Promise<void>;
  refreshPools: () => Promise<void>;
}

const SavingsPoolContext = createContext<SavingsPoolContextType>({
  pools: [],
  isLoading: false,
  error: null,
  createEthSavingsPool: async () => {
    throw new Error("Not implemented");
  },
  createERC20SavingsPool: async () => {
    throw new Error("Not implemented");
  },
  depositToEthPool: async () => {
    throw new Error("Not implemented");
  },
  depositToERC20Pool: async () => {
    throw new Error("Not implemented");
  },
  withdrawFromEthPool: async () => {
    throw new Error("Not implemented");
  },
  withdrawFromERC20Pool: async () => {
    throw new Error("Not implemented");
  },
  refreshPools: async () => {
    throw new Error("Not implemented");
  },
});

export const useSavingsPool = () => useContext(SavingsPoolContext);

interface SavingsPoolProviderProps {
  children: ReactNode;
}

export const SavingsPoolProvider: React.FC<SavingsPoolProviderProps> = ({
  children,
}) => {
  const { address, getProvider, getSigner } = useWallet();
  const [pools, setPools] = useState<SavingsPool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get contract instance
  const getContract = async (withSigner = false) => {
    try {
      if (withSigner) {
        const signer = await getSigner();
        if (!signer) throw new Error("No signer available");
        return new ethers.Contract(
          THALER_SAVINGS_POOL_ADDRESS,
          THALER_SAVINGS_POOL_ABI,
          signer
        );
      } else {
        const provider = await getProvider();
        if (!provider) throw new Error("No provider available");
        return new ethers.Contract(
          THALER_SAVINGS_POOL_ADDRESS,
          THALER_SAVINGS_POOL_ABI,
          provider
        );
      }
    } catch (error) {
      console.error("Error getting contract:", error);
      throw error;
    }
  };

  // Calculate progress percentage
  const calculateProgress = (
    totalSaved: string,
    amountToSave: string
  ): number => {
    const saved = parseFloat(ethers.utils.formatEther(totalSaved));
    const target = parseFloat(ethers.utils.formatEther(amountToSave));
    if (target === 0) return 0;
    return Math.min(Math.round((saved / target) * 100), 100);
  };

  // Format pool data from contract
  const formatPoolData = (poolId: string, poolData: any, isEth: boolean): SavingsPool => {
    return {
      id: poolId,
      user: poolData.user,
      tokenToSave: poolData.tokenToSave,
      amountToSave: ethers.utils.formatEther(poolData.amountToSave),
      totalSaved: ethers.utils.formatEther(poolData.totalSaved),
      duration: poolData.duration.toNumber(),
      startDate: poolData.startDate.toNumber() * 1000, // Convert to milliseconds
      endDate: poolData.endDate.toNumber() * 1000,
      nextDepositDate: poolData.nextDepositDate.toNumber() * 1000,
      numberOfDeposits: poolData.numberOfDeposits.toNumber(),
      totalIntervals: poolData.totalIntervals,
      initialDeposit: ethers.utils.formatEther(poolData.initialDeposit),
      progress: calculateProgress(poolData.totalSaved, poolData.amountToSave),
      isEth,
      tokenSymbol: isEth ? "ETH" : "USDC", // Default to USDC for ERC20, should be updated based on token address
    };
  };

  // Fetch user's savings pools
  const fetchUserPools = async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const contract = await getContract();
      
      // Listen for past events to get pool IDs
      const ethPoolCreatedFilter = contract.filters.SavingsPoolEthCreated(address);
      const erc20PoolCreatedFilter = contract.filters.SavingsPoolERC20Created(address);
      
      const ethPoolEvents = await contract.queryFilter(ethPoolCreatedFilter);
      const erc20PoolEvents = await contract.queryFilter(erc20PoolCreatedFilter);
      
      const userPools: SavingsPool[] = [];
      
      // Process ETH pools
      for (const event of ethPoolEvents) {
        const poolId = event.args?.savingsPoolId;
        if (poolId) {
          const poolData = await contract.savingsPools(poolId);
          if (poolData.user === address) {
            userPools.push(formatPoolData(poolId, poolData, true));
          }
        }
      }
      
      // Process ERC20 pools
      for (const event of erc20PoolEvents) {
        const poolId = event.args?.savingsPoolId;
        if (poolId) {
          const poolData = await contract.savingsPools(poolId);
          if (poolData.user === address) {
            userPools.push(formatPoolData(poolId, poolData, false));
          }
        }
      }
      
      setPools(userPools);
    } catch (error) {
      console.error("Error fetching user pools:", error);
      setError("Failed to fetch savings pools");
    } finally {
      setIsLoading(false);
    }
  };

  // Create ETH savings pool
  const createEthSavingsPool = async (
    amountToSave: string,
    duration: number,
    initialDeposit: string,
    totalIntervals: number
  ) => {
    if (!address) throw new Error("Wallet not connected");
    
    setIsLoading(true);
    setError(null);
    
    try {
      const contract = await getContract(true);
      
      // Convert amounts to wei
      const amountToSaveWei = ethers.utils.parseEther(amountToSave);
      const initialDepositWei = ethers.utils.parseEther(initialDeposit);
      
      // Call contract function
      const tx = await contract.createSavingsPoolEth(
        amountToSaveWei,
        duration,
        initialDepositWei,
        totalIntervals,
        { value: initialDepositWei }
      );
      
      await tx.wait();
      
      // Refresh pools after creation
      await fetchUserPools();
    } catch (error) {
      console.error("Error creating ETH savings pool:", error);
      setError("Failed to create ETH savings pool");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create ERC20 savings pool
  const createERC20SavingsPool = async (
    tokenAddress: string,
    amountToSave: string,
    duration: number,
    initialDeposit: string,
    totalIntervals: number
  ) => {
    if (!address) throw new Error("Wallet not connected");
    
    setIsLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      if (!signer) throw new Error("No signer available");
      
      // Get ERC20 token contract
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ["function approve(address spender, uint256 amount) returns (bool)"],
        signer
      );
      
      // Convert amounts to wei
      const amountToSaveWei = ethers.utils.parseEther(amountToSave);
      const initialDepositWei = ethers.utils.parseEther(initialDeposit);
      
      // Approve token spending
      const approveTx = await tokenContract.approve(
        THALER_SAVINGS_POOL_ADDRESS,
        initialDepositWei
      );
      await approveTx.wait();
      
      // Get savings pool contract
      const contract = await getContract(true);
      
      // Create savings pool
      const tx = await contract.createSavingsPoolERC20(
        tokenAddress,
        amountToSaveWei,
        duration,
        initialDepositWei,
        totalIntervals
      );
      
      await tx.wait();
      
      // Refresh pools after creation
      await fetchUserPools();
    } catch (error) {
      console.error("Error creating ERC20 savings pool:", error);
      setError("Failed to create ERC20 savings pool");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Deposit to ETH pool
  const depositToEthPool = async (poolId: string, amount: string) => {
    if (!address) throw new Error("Wallet not connected");
    
    setIsLoading(true);
    setError(null);
    
    try {
      const contract = await getContract(true);
      
      // Convert amount to wei
      const amountWei = ethers.utils.parseEther(amount);
      
      // Call contract function
      const tx = await contract.depositToEthSavingPool(
        poolId,
        amountWei,
        { value: amountWei }
      );
      
      await tx.wait();
      
      // Refresh pools after deposit
      await fetchUserPools();
    } catch (error) {
      console.error("Error depositing to ETH pool:", error);
      setError("Failed to deposit to ETH savings pool");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Deposit to ERC20 pool
  const depositToERC20Pool = async (poolId: string, amount: string) => {
    if (!address) throw new Error("Wallet not connected");
    
    setIsLoading(true);
    setError(null);
    
    try {
      const contract = await getContract(true);
      
      // Get pool data to get token address
      const poolData = await contract.savingsPools(poolId);
      const tokenAddress = poolData.tokenToSave;
      
      const signer = await getSigner();
      if (!signer) throw new Error("No signer available");
      
      // Get ERC20 token contract
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ["function approve(address spender, uint256 amount) returns (bool)"],
        signer
      );
      
      // Convert amount to wei
      const amountWei = ethers.utils.parseEther(amount);
      
      // Approve token spending
      const approveTx = await tokenContract.approve(
        THALER_SAVINGS_POOL_ADDRESS,
        amountWei
      );
      await approveTx.wait();
      
      // Deposit to pool
      const tx = await contract.depositToERC20SavingPool(poolId, amountWei);
      await tx.wait();
      
      // Refresh pools after deposit
      await fetchUserPools();
    } catch (error) {
      console.error("Error depositing to ERC20 pool:", error);
      setError("Failed to deposit to ERC20 savings pool");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw from ETH pool
  const withdrawFromEthPool = async (
    poolId: string,
    proof: string,
    publicInputs: string[]
  ) => {
    if (!address) throw new Error("Wallet not connected");
    
    setIsLoading(true);
    setError(null);
    
    try {
      const contract = await getContract(true);
      
      // Call contract function
      const tx = await contract.withdrawFromEthSavingPool(
        poolId,
        proof,
        publicInputs
      );
      
      await tx.wait();
      
      // Refresh pools after withdrawal
      await fetchUserPools();
    } catch (error) {
      console.error("Error withdrawing from ETH pool:", error);
      setError("Failed to withdraw from ETH savings pool");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw from ERC20 pool
  const withdrawFromERC20Pool = async (
    poolId: string,
    proof: string,
    publicInputs: string[]
  ) => {
    if (!address) throw new Error("Wallet not connected");
    
    setIsLoading(true);
    setError(null);
    
    try {
      const contract = await getContract(true);
      
      // Call contract function
      const tx = await contract.withdrawFromERC20SavingPool(
        poolId,
        proof,
        publicInputs
      );
      
      await tx.wait();
      
      // Refresh pools after withdrawal
      await fetchUserPools();
    } catch (error) {
      console.error("Error withdrawing from ERC20 pool:", error);
      setError("Failed to withdraw from ERC20 savings pool");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh pools
  const refreshPools = async () => {
    await fetchUserPools();
  };

  // Fetch pools when address changes
  useEffect(() => {
    if (address) {
      fetchUserPools();
    } else {
      setPools([]);
    }
  }, [address]);

  return (
    <SavingsPoolContext.Provider
      value={{
        pools,
        isLoading,
        error,
        createEthSavingsPool,
        createERC20SavingsPool,
        depositToEthPool,
        depositToERC20Pool,
        withdrawFromEthPool,
        withdrawFromERC20Pool,
        refreshPools,
      }}
    >
      {children}
    </SavingsPoolContext.Provider>
  );
};
