import { useState } from 'react';

export type StatusModalType = 'loading' | 'success' | 'error' | 'info' | 'warning';

export interface StatusModalState {
  visible: boolean;
  type: StatusModalType;
  title: string;
  message: string;
  transactionHash?: string;
}

const defaultModalState: StatusModalState = {
  visible: false,
  type: 'loading',
  title: '',
  message: '',
  transactionHash: undefined,
};

/**
 * A custom hook for managing status modals throughout the app
 * Provides a consistent interface for showing and hiding modals with different states
 */
export const useStatusModal = () => {
  const [statusModal, setStatusModal] = useState<StatusModalState>(defaultModalState);

  // Show a loading modal
  const showLoadingModal = (title: string, message: string) => {
    setStatusModal({
      visible: true,
      type: 'loading',
      title,
      message,
    });
  };

  // Show a success modal
  const showSuccessModal = (title: string, message: string, transactionHash?: string) => {
    setStatusModal({
      visible: true,
      type: 'success',
      title,
      message,
      transactionHash,
    });
  };

  // Show an error modal
  const showErrorModal = (title: string, message: string, transactionHash?: string) => {
    setStatusModal({
      visible: true,
      type: 'error',
      title,
      message,
      transactionHash,
    });
  };

  // Show an info modal
  const showInfoModal = (title: string, message: string) => {
    setStatusModal({
      visible: true,
      type: 'info',
      title,
      message,
    });
  };

  // Show a warning modal
  const showWarningModal = (title: string, message: string) => {
    setStatusModal({
      visible: true,
      type: 'warning',
      title,
      message,
    });
  };

  // Hide the modal
  const hideModal = () => {
    setStatusModal({
      ...statusModal,
      visible: false,
    });
  };

  // Reset the modal to default state
  const resetModal = () => {
    setStatusModal(defaultModalState);
  };

  return {
    statusModal,
    setStatusModal,
    showLoadingModal,
    showSuccessModal,
    showErrorModal,
    showInfoModal,
    showWarningModal,
    hideModal,
    resetModal,
  };
};
