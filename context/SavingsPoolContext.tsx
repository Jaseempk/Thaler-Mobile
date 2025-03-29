import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { useWallet } from "./WalletContext";
import {
  THALER_SAVINGS_POOL_ABI,
  THALER_SAVINGS_POOL_ADDRESS,
  TIME_CONSTANTS,
} from "../constants/Contracts";
import { encodeFunctionData, erc20Abi } from "viem";
import { useEmbeddedEthereumWallet } from "@privy-io/expo";
import { gql, useQuery } from "@apollo/client";
import { apolloClient } from "../lib/apollo-client";

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

interface SavingsPoolProviderProps {
  children: ReactNode;
}

const SavingsPoolContext = createContext<SavingsPoolContextType | undefined>(
  undefined
);

const SAVINGS_POOL_EVENTS_QUERY = gql`
  query GetSavingsPoolEvents($user: Bytes!) {
    savingsPoolCreateds(
      where: { user: $user }
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      user
      duration
      numberOfDeposits
      totalSaved
      tokenToSave
      amountToSave
      totalIntervals
      initialDeposit
      endDate
      startDate
      nextDepositDate
      lastDepositedTimestamp
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export const useSavingsPool = () => {
  const context = useContext(SavingsPoolContext);
  if (context === undefined) {
    throw new Error("useSavingsPool must be used within a SavingsPoolProvider");
  }
  return context;
};

export const SavingsPoolProvider: React.FC<SavingsPoolProviderProps> = ({
  children,
}) => {
  const { wallets } = useEmbeddedEthereumWallet();
  const [pools, setPools] = useState<SavingsPool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const { address } = useWallet();

  // Initialize contract when address or wallets change
  useEffect(() => {
    const initializeContract = async () => {
      try {
        if (!address || !wallets) {
          setContract(null);
          return;
        }

        const embeddedWallet = wallets.find((w) => w.address === address);
        // await (embeddedWallet as any).switchChain(84532);

        if (!embeddedWallet) {
          throw new Error("No embedded wallet found");
        }

        const privyProvider = await embeddedWallet.getProvider();
        if (!privyProvider) {
          throw new Error("Failed to get provider");
        }

        // Create an ethers provider from the Privy provider
        const provider = new ethers.providers.Web3Provider(privyProvider);
        console.log("providerss:", provider);
        const newContract = new ethers.Contract(
          THALER_SAVINGS_POOL_ADDRESS,
          THALER_SAVINGS_POOL_ABI,
          provider
        );

        setContract(newContract);
      } catch (error) {
        console.error("Error initializing contract:", error);
        setError("Failed to initialize contract");
        setContract(null);
      }
    };

    initializeContract();
  }, [address, wallets]);

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
  useEffect(() => {
    if (!address) return;

    let intervalId: NodeJS.Timeout;

    const fetchEvents = async () => {
      // setIsLoading(true);
      try {
        const { data } = await apolloClient.query({
          query: SAVINGS_POOL_EVENTS_QUERY,
          variables: { user: address?.toLowerCase() },
        });

        // Transform data to match expected format
        const poolEvents: SavingsPool[] = (data.savingsPoolCreateds || []).map(
          (event: SavingsPool) => {
            const isEth = event.tokenToSave === ethers.constants.AddressZero;
            return {
              id: event.id,
              user: event.user,
              tokenToSave: event.tokenToSave,
              amountToSave: isEth
                ? ethers.utils.formatEther(event.amountToSave)
                : (Number(event.amountToSave) / 1e6).toString(),
              totalSaved: isEth
                ? ethers.utils.formatEther(event.totalSaved)
                : (Number(event.totalSaved) / 1e6).toString(),
              duration: Number(event.duration) / (24 * 60 * 60),
              startDate: Number(event.startDate),
              endDate: Number(event.endDate),
              nextDepositDate: Number(event.nextDepositDate),
              numberOfDeposits: Number(event.numberOfDeposits),
              totalIntervals: Number(event.totalIntervals),
              initialDeposit: ethers.utils.formatEther(event.initialDeposit),
              progress: calculateProgress(event.totalSaved, event.amountToSave),
              isEth,
              tokenSymbol: isEth ? "ETH" : "USDC",
            };
          }
        );

        setPools(poolEvents);
      } catch (err) {
        console.error("Error fetching savings pool events:", err);
        // setError(err instanceof Error ? err : new Error("Failed to fetch events"));
      } finally {
        // setIsLoading(false);
      }
    };

    // Initial fetch
    fetchEvents();

    // Set up polling every 30 seconds
    intervalId = setInterval(fetchEvents, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [address]);

  // Format pool data from contract
  const formatPoolData = (
    poolId: string,
    poolData: any,
    isEth: boolean
  ): SavingsPool => {
    return {
      id: poolId,
      user: poolData.user,
      tokenToSave: poolData.tokenToSave,
      amountToSave: ethers.utils.formatEther(poolData.amountToSave),
      totalSaved: ethers.utils.formatEther(poolData.totalSaved),
      duration: poolData.duration.toNumber(),
      startDate: poolData.startDate.toNumber(), // Convert to milliseconds
      endDate: poolData.endDate.toNumber(),
      nextDepositDate: poolData.nextDepositDate.toNumber(),
      numberOfDeposits: poolData.numberOfDeposits.toNumber(),
      totalIntervals: poolData.totalIntervals,
      initialDeposit: ethers.utils.formatEther(poolData.initialDeposit),
      progress: calculateProgress(poolData.totalSaved, poolData.amountToSave),
      isEth,
      tokenSymbol: isEth ? "ETH" : "USDC", // Default to USDC for ERC20, should be updated based on token address
    };
  };

  // Update createEthSavingsPool to use wallets directly
  const createEthSavingsPool = async (
    amountToSave: string,
    duration: number,
    initialDeposit: string,
    totalIntervals: number
  ) => {
    if (!address || !contract || !wallets)
      throw new Error("Wallet not connected");

    setIsLoading(true);
    setError(null);

    try {
      const embeddedWallet = wallets.find((w) => w.address === address);
      // await (embeddedWallet as any).switchChain(84532);

      if (!embeddedWallet) throw new Error("No embedded wallet found");

      const provider = await embeddedWallet.getProvider();
      if (!provider) throw new Error("Failed to get provider");

      // Convert amounts to wei
      const amountToSaveWei = ethers.utils.parseEther(amountToSave);
      const initialDepositWei = ethers.utils.parseEther(initialDeposit);

      // Encode function data using viem
      const data = encodeFunctionData({
        abi: THALER_SAVINGS_POOL_ABI,
        functionName: "createSavingsPoolEth",
        args: [amountToSaveWei, duration, initialDepositWei, totalIntervals],
      });

      // Prepare transaction request
      const transactionRequest = {
        to: THALER_SAVINGS_POOL_ADDRESS,
        data: data,
        value: initialDepositWei.toHexString(),
      };

      // Send transaction
      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionRequest, { chainId: "84532" }],
      });

      await new Promise((resolve) => setTimeout(resolve, 5000));
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
    if (!address || !contract) throw new Error("Wallet not connected");

    setIsLoading(true);
    setError(null);

    try {
      const embeddedWallet = wallets.find((w) => w.address === address);

      if (!embeddedWallet) throw new Error("No embedded wallet found");

      const provider = await embeddedWallet.getProvider();
      if (!provider) throw new Error("Failed to get provider");

      // Convert amounts to wei
      const amountToSaveWei = BigInt(Math.floor(Number(amountToSave) * 1e6));
      const initialDepositWei = BigInt(
        Math.floor(Number(initialDeposit) * 1e6)
      );

      // First, approve token spending
      const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [THALER_SAVINGS_POOL_ADDRESS, amountToSaveWei],
      });
      const approveReq = {
        to: tokenAddress,
        data: approveData,
        value: "0x0",
      };

      const approvetxHash = await provider.request({
        method: "eth_sendTransaction",
        params: [approveReq],
      });

      // Wait for approval transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Then create the savings pool
      const createData = encodeFunctionData({
        abi: THALER_SAVINGS_POOL_ABI,
        functionName: "createSavingsPoolERC20",
        args: [
          tokenAddress,
          amountToSaveWei,
          duration,
          initialDepositWei,
          totalIntervals,
        ],
      });
      // Prepare transaction request
      const transactionRequest = {
        to: THALER_SAVINGS_POOL_ADDRESS,
        data: createData,
        value: "0x0",
      };

      // Send transaction
      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionRequest, { chainId: "84532" }],
      });

      // Wait for creation transaction
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Refresh pools after creation
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
    if (!address || !contract) throw new Error("Wallet not connected");

    setIsLoading(true);
    setError(null);

    try {
      const provider = await wallets[0].getProvider();
      if (!provider) throw new Error("Failed to get provider");

      const depositAmountWei = ethers.utils.parseEther(amount);

      const data = encodeFunctionData({
        abi: THALER_SAVINGS_POOL_ABI,
        functionName: "depositToEthSavingPool",
        args: [poolId, depositAmountWei],
      });

      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            to: THALER_SAVINGS_POOL_ADDRESS,
            data: data,
            value: depositAmountWei.toHexString(),
          },
        ],
      });

      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      console.error("Error depositing to ETH pool:", error);
      setError("Failed to deposit to ETH pool");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Deposit to ERC20 pool
  const depositToERC20Pool = async (poolId: string, amount: string) => {
    if (!address || !contract) throw new Error("Wallet not connected");

    setIsLoading(true);
    setError(null);

    try {
      const provider = await wallets[0].getProvider();
      if (!provider) throw new Error("Failed to get provider");

      const depositAmountWei = ethers.utils.parseEther(amount);

      // Get pool data to get token address
      const pool = pools.find((p) => p.id === poolId);
      if (!pool) throw new Error("Pool not found");
      const tokenAddress = pool.tokenToSave;

      // First approve token spending
      const approveData = encodeFunctionData({
        abi: [
          "function approve(address spender, uint256 amount) returns (bool)",
        ],
        functionName: "approve",
        args: [THALER_SAVINGS_POOL_ADDRESS, depositAmountWei],
      });

      const approveTx = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            to: tokenAddress,
            data: approveData,
            value: "0x0",
          },
        ],
      });

      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Then deposit
      const depositData = encodeFunctionData({
        abi: THALER_SAVINGS_POOL_ABI,
        functionName: "depositToERC20SavingPool",
        args: [poolId, depositAmountWei],
      });

      const depositTx = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            to: THALER_SAVINGS_POOL_ADDRESS,
            data: depositData,
            value: "0x0",
          },
        ],
      });

      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      console.error("Error depositing to ERC20 pool:", error);
      setError("Failed to deposit to ERC20 pool");
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
    if (!address || !contract) throw new Error("Wallet not connected");

    setIsLoading(true);
    setError(null);

    try {
      // Call contract function
      const tx = await contract.withdrawFromEthSavingPool(
        poolId,
        proof,
        publicInputs
      );

      await tx.wait();

      // Refresh pools after withdrawal
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
    if (!address || !contract) throw new Error("Wallet not connected");

    setIsLoading(true);
    setError(null);

    try {
      // Call contract function
      const tx = await contract.withdrawFromERC20SavingPool(
        poolId,
        proof,
        publicInputs
      );

      await tx.wait();

      // Refresh pools after withdrawal
    } catch (error) {
      console.error("Error withdrawing from ERC20 pool:", error);
      setError("Failed to withdraw from ERC20 savings pool");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh pools
  const refreshPools = async () => {};

  // Fetch pools when address changes
  useEffect(() => {
    if (address) {
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
