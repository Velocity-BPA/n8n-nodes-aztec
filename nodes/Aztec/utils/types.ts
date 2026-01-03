/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject } from 'n8n-workflow';

// Account Types
export interface IAztecAccount {
  address: string;
  publicKey: string;
  partialAddress: string;
  deployedAt?: string;
  isRegistered: boolean;
  alias?: string;
}

export interface IAztecAccountKeys {
  spendingPublicKey: string;
  viewingPublicKey: string;
  nullifierPublicKey: string;
  masterIncomingViewingPublicKey: string;
}

export interface IAztecAccountAlias {
  alias: string;
  address: string;
  createdAt: string;
}

// Token Types
export interface IAztecBalance {
  tokenAddress: string;
  tokenSymbol: string;
  balance: string;
  decimals: number;
  type: 'public' | 'private';
}

export interface IAztecTokenTransfer {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  tokenAddress: string;
  type: 'public' | 'private' | 'shield' | 'unshield';
  timestamp: string;
  blockNumber: number;
}

// Note Types
export interface IAztecNote {
  commitment: string;
  owner: string;
  value: string;
  tokenAddress: string;
  randomness: string;
  status: 'pending' | 'committed' | 'nullified';
  createdAt: string;
  nullifiedAt?: string;
}

export interface IAztecNullifier {
  nullifier: string;
  commitment: string;
  spentAt: string;
  txHash: string;
}

// Transaction Types
export interface IAztecTransaction {
  txHash: string;
  type: string;
  status: 'pending' | 'confirmed' | 'failed';
  from: string;
  to?: string;
  blockNumber?: number;
  timestamp?: string;
  fee: string;
  proofData?: string;
}

export interface IAztecTransactionReceipt {
  txHash: string;
  status: 'success' | 'reverted';
  blockNumber: number;
  blockHash: string;
  gasUsed: string;
  logs: IAztecEventLog[];
}

export interface IAztecEventLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

// Proof Types
export interface IAztecProof {
  proofId: string;
  type: string;
  status: 'generating' | 'ready' | 'failed';
  proofData?: string;
  publicInputs: string[];
  createdAt: string;
  completedAt?: string;
  size?: number;
}

export interface IAztecProofVerification {
  proofId: string;
  isValid: boolean;
  verifiedAt: string;
  verifier: string;
}

// DeFi Types
export interface IAztecSwapQuote {
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  outputAmount: string;
  exchangeRate: string;
  slippage: string;
  fee: string;
  expiresAt: string;
}

export interface IAztecSwapResult {
  txHash: string;
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  outputAmount: string;
  timestamp: string;
}

export interface IAztecTradingPair {
  pairId: string;
  token0: string;
  token1: string;
  liquidity: string;
  volume24h: string;
  fee: string;
}

// Bridge Types
export interface IAztecBridge {
  bridgeId: string;
  name: string;
  protocol: string;
  inputAssets: string[];
  outputAssets: string[];
  auxData: number;
  isActive: boolean;
}

export interface IAztecBridgePosition {
  bridgeId: string;
  positionId: string;
  owner: string;
  inputValue: string;
  outputValue: string;
  status: 'active' | 'closed' | 'pending';
  createdAt: string;
}

export interface IAztecBridgeStats {
  bridgeId: string;
  totalVolume: string;
  totalTransactions: number;
  averageFee: string;
  lastUsed: string;
}

// Network Types
export interface IAztecRollupStatus {
  latestBlock: number;
  latestRollupId: number;
  pendingTxCount: number;
  timestamp: string;
  dataRoot: string;
  nullifierRoot: string;
}

export interface IAztecFeeSchedule {
  baseFee: string;
  priorityFee: string;
  proofGenerationFee: string;
  bridgeFee: string;
  currency: string;
}

export interface IAztecPendingTransaction {
  txHash: string;
  type: string;
  from: string;
  fee: string;
  addedAt: string;
}

// Contract Types
export interface IAztecContract {
  address: string;
  name: string;
  deployer: string;
  deployedAt: string;
  blockNumber: number;
  bytecodeHash: string;
}

export interface IAztecContractState {
  contractAddress: string;
  slot: string;
  value: string;
  timestamp: string;
}

export interface IAztecContractEvent {
  contractAddress: string;
  eventName: string;
  args: IDataObject;
  blockNumber: number;
  txHash: string;
  timestamp: string;
}

// Utility Types
export interface IAztecKeyPair {
  publicKey: string;
  privateKey: string;
  type: 'spending' | 'viewing' | 'nullifier';
}

export interface IAztecEncryptedNote {
  ciphertext: string;
  ephemeralPublicKey: string;
  nonce: string;
}

export interface IAztecHealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  version: string;
  chainId: number;
  latestBlock: number;
  syncStatus: 'synced' | 'syncing' | 'behind';
  uptime: number;
}

// API Response Types
export interface IAztecApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: IDataObject;
  };
}

// Trigger Event Types
export interface IAztecTriggerEvent {
  eventType: string;
  timestamp: string;
  data: IDataObject;
}

export interface IAztecPrivateTransactionEvent extends IAztecTriggerEvent {
  eventType: 'privateTransaction';
  data: {
    txHash: string;
    from: string;
    to: string;
    amount: string;
    tokenAddress: string;
    blockNumber: number;
  };
}

export interface IAztecShieldEvent extends IAztecTriggerEvent {
  eventType: 'shield' | 'unshield';
  data: {
    txHash: string;
    account: string;
    amount: string;
    tokenAddress: string;
    direction: 'toPrivate' | 'toPublic';
  };
}

export interface IAztecNoteEvent extends IAztecTriggerEvent {
  eventType: 'noteReceived';
  data: {
    commitment: string;
    owner: string;
    value: string;
    tokenAddress: string;
  };
}

export interface IAztecRollupEvent extends IAztecTriggerEvent {
  eventType: 'rollupPublished';
  data: {
    rollupId: number;
    blockNumber: number;
    txCount: number;
    dataRoot: string;
  };
}

export interface IAztecBridgeEvent extends IAztecTriggerEvent {
  eventType: 'bridgeCompletion';
  data: {
    bridgeId: string;
    txHash: string;
    inputValue: string;
    outputValue: string;
    status: 'completed' | 'failed';
  };
}

// Request Types
export interface ICreateAccountRequest {
  alias?: string;
  recoveryKey?: string;
}

export interface ITransferRequest {
  to: string;
  amount: string;
  tokenAddress: string;
  fee?: string;
}

export interface IShieldRequest {
  amount: string;
  tokenAddress: string;
  secretHash?: string;
}

export interface IUnshieldRequest {
  amount: string;
  tokenAddress: string;
  recipient: string;
}

export interface ISwapRequest {
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  minOutputAmount: string;
  deadline?: number;
}

export interface IDeployContractRequest {
  bytecode: string;
  args: IDataObject[];
  salt?: string;
}

export interface ICallContractRequest {
  contractAddress: string;
  functionName: string;
  args: IDataObject[];
  isPrivate?: boolean;
}

export interface IProofRequest {
  type: 'transfer' | 'shield' | 'unshield' | 'swap' | 'custom';
  inputs: IDataObject;
}

// Pagination
export interface IPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
