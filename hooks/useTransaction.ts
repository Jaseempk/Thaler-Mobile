import { useState } from 'react';
import { ethers } from 'ethers';
import * as Haptics from 'expo-haptics';
import { useWallet } from '../context/WalletContext';
import { useStatusModal } from './useStatusModal';

/**
 * A custom hook for handling blockchain transactions with consistent error handling and status updates
 * Provides a unified interface for executing transactions with loading, success, and error states
 */
export const useTransaction = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { getSigner } = useWallet();
  const { 
    showLoadingModal, 
    showSuccessModal, 
    showErrorModal, 
    hideModal 
  } = useStatusModal();

  /**
   * Execute a transaction with proper loading, success, and error handling
   * @param transactionName A human-readable name for the transaction
   * @param transactionFn The async function that performs the actual transaction
   * @param onSuccess Optional callback to execute on successful transaction
   * @param onError Optional callback to execute on transaction error
   * @returns The transaction result if successful
   */
  const executeTransaction = async <T>(
    transactionName: string,
    transactionFn: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: any) => void
  ): Promise<T | null> => {
    try {
      setIsProcessing(true);
      
      // Provide haptic feedback to indicate transaction start
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Show loading modal
      showLoadingModal(
        `Processing ${transactionName}`,
        'Please wait while your transaction is being processed...'
      );
      
      // Execute the transaction
      const result = await transactionFn();
      
      // Get transaction hash if result is a TransactionResponse
      let txHash: string | undefined;
      if (result && typeof result === 'object' && 'hash' in result) {
        txHash = (result as unknown as ethers.providers.TransactionResponse).hash;
      }
      
      // Show success modal
      showSuccessModal(
        `${transactionName} Successful`,
        'Your transaction was processed successfully!',
        txHash
      );
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      console.error(`Error in ${transactionName}:`, error);
      
      // Provide haptic feedback to indicate error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Show error modal
      showErrorModal(
        `${transactionName} Failed`,
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
      
      // Call error callback if provided
      if (onError) {
        onError(error);
      }
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Send ETH to a recipient address
   * @param to Recipient address
   * @param amount Amount of ETH to send (in ETH units, not wei)
   * @param onSuccess Optional callback on success
   * @param onError Optional callback on error
   * @returns Transaction response if successful
   */
  const sendEth = async (
    to: string,
    amount: string,
    onSuccess?: (result: ethers.providers.TransactionResponse) => void,
    onError?: (error: any) => void
  ): Promise<ethers.providers.TransactionResponse | null> => {
    return executeTransaction(
      'ETH Transfer',
      async () => {
        const signer = await getSigner();
        if (!signer) throw new Error('No signer available');
        
        // Convert ETH to wei
        const amountInWei = ethers.utils.parseEther(amount);
        
        // Send the transaction
        return signer.sendTransaction({
          to,
          value: amountInWei
        });
      },
      onSuccess,
      onError
    );
  };

  /**
   * Send ERC20 tokens to a recipient address
   * @param tokenAddress The ERC20 token contract address
   * @param to Recipient address
   * @param amount Amount of tokens to send (in token units, not wei)
   * @param decimals Token decimals (default: 18)
   * @param onSuccess Optional callback on success
   * @param onError Optional callback on error
   * @returns Transaction response if successful
   */
  const sendErc20 = async (
    tokenAddress: string,
    to: string,
    amount: string,
    decimals: number = 18,
    onSuccess?: (result: ethers.providers.TransactionResponse) => void,
    onError?: (error: any) => void
  ): Promise<ethers.providers.TransactionResponse | null> => {
    return executeTransaction(
      'Token Transfer',
      async () => {
        const signer = await getSigner();
        if (!signer) throw new Error('No signer available');
        
        // Create ERC20 contract instance
        const erc20Interface = new ethers.utils.Interface([
          'function transfer(address to, uint256 amount) returns (bool)'
        ]);
        const tokenContract = new ethers.Contract(tokenAddress, erc20Interface, signer);
        
        // Convert token amount to proper decimals
        const amountInWei = ethers.utils.parseUnits(amount, decimals);
        
        // Send the transaction
        return tokenContract.transfer(to, amountInWei);
      },
      onSuccess,
      onError
    );
  };

  /**
   * Call a contract method
   * @param contractAddress The contract address
   * @param abi The contract ABI or interface
   * @param methodName The method name to call
   * @param args The arguments to pass to the method
   * @param transactionName A human-readable name for the transaction
   * @param onSuccess Optional callback on success
   * @param onError Optional callback on error
   * @returns Transaction response if successful
   */
  const callContractMethod = async (
    contractAddress: string,
    abi: ethers.ContractInterface,
    methodName: string,
    args: any[],
    transactionName: string,
    onSuccess?: (result: ethers.providers.TransactionResponse) => void,
    onError?: (error: any) => void
  ): Promise<ethers.providers.TransactionResponse | null> => {
    return executeTransaction(
      transactionName,
      async () => {
        const signer = await getSigner();
        if (!signer) throw new Error('No signer available');
        
        // Create contract instance
        const contract = new ethers.Contract(contractAddress, abi, signer);
        
        // Call the method
        return contract[methodName](...args);
      },
      onSuccess,
      onError
    );
  };

  return {
    isProcessing,
    executeTransaction,
    sendEth,
    sendErc20,
    callContractMethod,
    hideModal
  };
};
