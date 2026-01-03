/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const AZTEC_RESOURCES = {
  ACCOUNTS: 'accounts',
  PRIVATE_TOKENS: 'privateTokens',
  PUBLIC_TOKENS: 'publicTokens',
  NOTES: 'notes',
  TRANSACTIONS: 'transactions',
  PRIVATE_DEFI: 'privateDeFi',
  PROOFS: 'proofs',
  NETWORK: 'network',
  BRIDGES: 'bridges',
  NOIR_CONTRACTS: 'noirContracts',
  UTILITY: 'utility',
} as const;

export const ACCOUNTS_OPERATIONS = {
  CREATE_ACCOUNT: 'createAccount',
  GET_ACCOUNT_INFO: 'getAccountInfo',
  GET_ACCOUNT_KEYS: 'getAccountKeys',
  REGISTER_ACCOUNT: 'registerAccount',
  GET_ACCOUNT_ALIASES: 'getAccountAliases',
  RECOVER_ACCOUNT: 'recoverAccount',
} as const;

export const PRIVATE_TOKENS_OPERATIONS = {
  GET_PRIVATE_BALANCE: 'getPrivateBalance',
  SHIELD_TOKENS: 'shieldTokens',
  UNSHIELD_TOKENS: 'unshieldTokens',
  PRIVATE_TRANSFER: 'privateTransfer',
  GET_PRIVATE_HISTORY: 'getPrivateHistory',
} as const;

export const PUBLIC_TOKENS_OPERATIONS = {
  GET_PUBLIC_BALANCE: 'getPublicBalance',
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  PUBLIC_TRANSFER: 'publicTransfer',
} as const;

export const NOTES_OPERATIONS = {
  GET_NOTES: 'getNotes',
  GET_NOTE_BY_COMMITMENT: 'getNoteByCommitment',
  SPEND_NOTE: 'spendNote',
  GET_PENDING_NOTES: 'getPendingNotes',
  GET_NULLIFIED_NOTES: 'getNullifiedNotes',
} as const;

export const TRANSACTIONS_OPERATIONS = {
  GET_TRANSACTION: 'getTransaction',
  GET_TRANSACTION_STATUS: 'getTransactionStatus',
  GET_TRANSACTION_PROOF: 'getTransactionProof',
  SUBMIT_TRANSACTION: 'submitTransaction',
  ESTIMATE_FEES: 'estimateFees',
} as const;

export const PRIVATE_DEFI_OPERATIONS = {
  PRIVATE_SWAP: 'privateSwap',
  PRIVATE_BRIDGE: 'privateBridge',
  GET_SWAP_QUOTE: 'getSwapQuote',
  GET_SUPPORTED_PAIRS: 'getSupportedPairs',
} as const;

export const PROOFS_OPERATIONS = {
  GENERATE_PROOF: 'generateProof',
  VERIFY_PROOF: 'verifyProof',
  GET_PROOF_STATUS: 'getProofStatus',
  GET_PROOF_SIZE: 'getProofSize',
} as const;

export const NETWORK_OPERATIONS = {
  GET_ROLLUP_STATUS: 'getRollupStatus',
  GET_FEE_SCHEDULE: 'getFeeSchedule',
  GET_PENDING_TXS: 'getPendingTxs',
  GET_BRIDGE_STATS: 'getBridgeStats',
} as const;

export const BRIDGES_OPERATIONS = {
  GET_BRIDGES: 'getBridges',
  GET_BRIDGE_INFO: 'getBridgeInfo',
  CALL_BRIDGE: 'callBridge',
  GET_BRIDGE_POSITIONS: 'getBridgePositions',
} as const;

export const NOIR_CONTRACTS_OPERATIONS = {
  DEPLOY_CONTRACT: 'deployContract',
  CALL_CONTRACT: 'callContract',
  GET_CONTRACT_STATE: 'getContractState',
  GET_CONTRACT_EVENTS: 'getContractEvents',
} as const;

export const UTILITY_OPERATIONS = {
  DERIVE_KEYS: 'deriveKeys',
  ENCRYPT_NOTE: 'encryptNote',
  DECRYPT_NOTE: 'decryptNote',
  GET_API_HEALTH: 'getApiHealth',
} as const;

export const TRIGGER_EVENTS = {
  NEW_PRIVATE_TRANSACTION: 'newPrivateTransaction',
  SHIELD_UNSHIELD_EVENT: 'shieldUnshieldEvent',
  NOTE_RECEIVED: 'noteReceived',
  ROLLUP_PUBLISHED: 'rollupPublished',
  BRIDGE_COMPLETION: 'bridgeCompletion',
} as const;

export const DEFAULT_TOKENS = {
  ETH: '0x0000000000000000000000000000000000000000000000000000000000000000',
  DAI: '0x0000000000000000000000000000000000000000000000000000000000000001',
  WBTC: '0x0000000000000000000000000000000000000000000000000000000000000002',
  USDC: '0x0000000000000000000000000000000000000000000000000000000000000003',
  USDT: '0x0000000000000000000000000000000000000000000000000000000000000004',
} as const;

export const PROOF_TYPES = {
  TRANSFER: 'transfer',
  SHIELD: 'shield',
  UNSHIELD: 'unshield',
  SWAP: 'swap',
  BRIDGE: 'bridge',
  CONTRACT_CALL: 'contractCall',
  CUSTOM: 'custom',
} as const;

export const NOTE_STATUSES = {
  PENDING: 'pending',
  COMMITTED: 'committed',
  NULLIFIED: 'nullified',
} as const;

export const TRANSACTION_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
} as const;

export const POLLING_INTERVALS = {
  FAST: 10000, // 10 seconds
  NORMAL: 30000, // 30 seconds
  SLOW: 60000, // 1 minute
} as const;

export const API_VERSION = 'v1';

export const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;
