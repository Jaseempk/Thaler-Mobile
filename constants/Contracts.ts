// Contract addresses - these would be updated based on deployment environment
export const THALER_SAVINGS_POOL_ADDRESS = '0x0000000000000000000000000000000000000000'; // Placeholder

// ABIs
export const THALER_SAVINGS_POOL_ABI = [
  // Events
  "event SavingsPoolCreated(address user, uint256 endDate, uint256 duration, uint256 startDate, uint256 totalSaved, address tokenToSave, uint256 amountToSave, uint256 initialDeposit, uint256 totalWithdrawn, uint256 nextDepositDate, uint256 numberOfDeposits, uint256 lastDepositedTimestamp)",
  "event SavingsPoolERC20Deposited(address user, bytes32 savingsPoolId, uint256 depositedAmount, uint256 totalSaved, uint256 nextDepositDate, uint256 numberOfDeposits, uint256 lastDepositedTimestamp)",
  "event SavingsPoolETHDeposited(address user, bytes32 savingsPoolId, uint256 depositedAmount, uint256 totalSaved, uint256 nextDepositDate, uint256 numberOfDeposits, uint256 lastDepositedTimestamp)",
  "event WithdrawFromERC20Pool(address user, uint256 endDate, uint256 startDate, uint256 timeStamp, uint256 totalSaved, address tokenSaved, uint256 poolDuration, bytes32 savingsPoolId, uint256 totalWithdrawn)",
  "event WithdrawFromEthPool(address user, uint256 endDate, uint256 startDate, uint256 timeStamp, uint256 totalSaved, uint256 poolDuration, bytes32 savingsPoolId, uint256 totalWithdrawn)",
  
  // Functions
  "function createSavingsPoolERC20(address _tokenToSave, uint256 _amountToSave, uint256 _duration, uint256 _initialDeposit, uint8 _totalIntervals) public",
  "function createSavingsPoolEth(uint256 _amountToSave, uint256 _duration, uint256 initialDeposit, uint8 _totalIntervals) public payable",
  "function depositToEthSavingPool(bytes32 _savingsPoolId, uint256 _depositAmount) public payable",
  "function depositToERC20SavingPool(bytes32 _savingsPoolId, uint256 _amountToDeposit) public",
  "function withdrawFromEthSavingPool(bytes32 _savingsPoolId, bytes calldata _proof, bytes32[] calldata _publicInputs) public",
  "function withdrawFromERC20SavingPool(bytes32 _savingsPoolId, bytes calldata _proof, bytes32[] calldata _publicInputs) public",
  
  // Constants
  "function INTERVAL() public view returns (uint256)",
  "function DONATION_RATIO() public view returns (uint256)",
  
  // View functions
  "function savingsPools(bytes32) public view returns (address user, uint256 endDate, uint256 duration, uint256 startDate, uint256 totalSaved, address tokenToSave, uint256 amountToSave, uint256 totalIntervals, uint256 initialDeposit, uint256 nextDepositDate, uint256 numberOfDeposits, uint256 lastDepositedTimestamp)"
];

// Time constants from the contract (in seconds)
export const TIME_CONSTANTS = {
  THREE_MONTHS: 7884000,
  SIX_MONTHS: 15768000,
  TWELVE_MONTHS: 31536000,
  INTERVAL: 2628000 // 1 month
};
