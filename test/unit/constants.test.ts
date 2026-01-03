/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  AZTEC_RESOURCES,
  ACCOUNTS_OPERATIONS,
  PRIVATE_TOKENS_OPERATIONS,
  PUBLIC_TOKENS_OPERATIONS,
  NOTES_OPERATIONS,
  TRANSACTIONS_OPERATIONS,
  PRIVATE_DEFI_OPERATIONS,
  PROOFS_OPERATIONS,
  NETWORK_OPERATIONS,
  BRIDGES_OPERATIONS,
  NOIR_CONTRACTS_OPERATIONS,
  UTILITY_OPERATIONS,
  TRIGGER_EVENTS,
  DEFAULT_TOKENS,
  PROOF_TYPES,
  NOTE_STATUSES,
  TRANSACTION_STATUSES,
  POLLING_INTERVALS,
  API_VERSION,
  LICENSING_NOTICE,
} from '../../nodes/Aztec/constants/constants';

describe('Aztec Constants', () => {
  describe('AZTEC_RESOURCES', () => {
    it('should have all 11 resources defined', () => {
      expect(Object.keys(AZTEC_RESOURCES)).toHaveLength(11);
      expect(AZTEC_RESOURCES.ACCOUNTS).toBe('accounts');
      expect(AZTEC_RESOURCES.PRIVATE_TOKENS).toBe('privateTokens');
      expect(AZTEC_RESOURCES.PUBLIC_TOKENS).toBe('publicTokens');
      expect(AZTEC_RESOURCES.NOTES).toBe('notes');
      expect(AZTEC_RESOURCES.TRANSACTIONS).toBe('transactions');
      expect(AZTEC_RESOURCES.PRIVATE_DEFI).toBe('privateDeFi');
      expect(AZTEC_RESOURCES.PROOFS).toBe('proofs');
      expect(AZTEC_RESOURCES.NETWORK).toBe('network');
      expect(AZTEC_RESOURCES.BRIDGES).toBe('bridges');
      expect(AZTEC_RESOURCES.NOIR_CONTRACTS).toBe('noirContracts');
      expect(AZTEC_RESOURCES.UTILITY).toBe('utility');
    });
  });

  describe('Operations', () => {
    it('should have all account operations', () => {
      expect(Object.keys(ACCOUNTS_OPERATIONS)).toHaveLength(6);
      expect(ACCOUNTS_OPERATIONS.CREATE_ACCOUNT).toBe('createAccount');
      expect(ACCOUNTS_OPERATIONS.GET_ACCOUNT_INFO).toBe('getAccountInfo');
      expect(ACCOUNTS_OPERATIONS.GET_ACCOUNT_KEYS).toBe('getAccountKeys');
      expect(ACCOUNTS_OPERATIONS.REGISTER_ACCOUNT).toBe('registerAccount');
      expect(ACCOUNTS_OPERATIONS.GET_ACCOUNT_ALIASES).toBe('getAccountAliases');
      expect(ACCOUNTS_OPERATIONS.RECOVER_ACCOUNT).toBe('recoverAccount');
    });

    it('should have all private tokens operations', () => {
      expect(Object.keys(PRIVATE_TOKENS_OPERATIONS)).toHaveLength(5);
    });

    it('should have all public tokens operations', () => {
      expect(Object.keys(PUBLIC_TOKENS_OPERATIONS)).toHaveLength(4);
    });

    it('should have all notes operations', () => {
      expect(Object.keys(NOTES_OPERATIONS)).toHaveLength(5);
    });

    it('should have all transactions operations', () => {
      expect(Object.keys(TRANSACTIONS_OPERATIONS)).toHaveLength(5);
    });

    it('should have all private DeFi operations', () => {
      expect(Object.keys(PRIVATE_DEFI_OPERATIONS)).toHaveLength(4);
    });

    it('should have all proofs operations', () => {
      expect(Object.keys(PROOFS_OPERATIONS)).toHaveLength(4);
    });

    it('should have all network operations', () => {
      expect(Object.keys(NETWORK_OPERATIONS)).toHaveLength(4);
    });

    it('should have all bridges operations', () => {
      expect(Object.keys(BRIDGES_OPERATIONS)).toHaveLength(4);
    });

    it('should have all noir contracts operations', () => {
      expect(Object.keys(NOIR_CONTRACTS_OPERATIONS)).toHaveLength(4);
    });

    it('should have all utility operations', () => {
      expect(Object.keys(UTILITY_OPERATIONS)).toHaveLength(4);
    });
  });

  describe('TRIGGER_EVENTS', () => {
    it('should have all 5 trigger events', () => {
      expect(Object.keys(TRIGGER_EVENTS)).toHaveLength(5);
      expect(TRIGGER_EVENTS.NEW_PRIVATE_TRANSACTION).toBe('newPrivateTransaction');
      expect(TRIGGER_EVENTS.SHIELD_UNSHIELD_EVENT).toBe('shieldUnshieldEvent');
      expect(TRIGGER_EVENTS.NOTE_RECEIVED).toBe('noteReceived');
      expect(TRIGGER_EVENTS.ROLLUP_PUBLISHED).toBe('rollupPublished');
      expect(TRIGGER_EVENTS.BRIDGE_COMPLETION).toBe('bridgeCompletion');
    });
  });

  describe('DEFAULT_TOKENS', () => {
    it('should have default token addresses', () => {
      expect(DEFAULT_TOKENS.ETH).toMatch(/^0x[0]{64}$/);
      expect(DEFAULT_TOKENS.DAI).toBeDefined();
      expect(DEFAULT_TOKENS.WBTC).toBeDefined();
      expect(DEFAULT_TOKENS.USDC).toBeDefined();
      expect(DEFAULT_TOKENS.USDT).toBeDefined();
    });
  });

  describe('PROOF_TYPES', () => {
    it('should have all proof types', () => {
      expect(PROOF_TYPES.TRANSFER).toBe('transfer');
      expect(PROOF_TYPES.SHIELD).toBe('shield');
      expect(PROOF_TYPES.UNSHIELD).toBe('unshield');
      expect(PROOF_TYPES.SWAP).toBe('swap');
      expect(PROOF_TYPES.BRIDGE).toBe('bridge');
      expect(PROOF_TYPES.CONTRACT_CALL).toBe('contractCall');
      expect(PROOF_TYPES.CUSTOM).toBe('custom');
    });
  });

  describe('NOTE_STATUSES', () => {
    it('should have all note statuses', () => {
      expect(NOTE_STATUSES.PENDING).toBe('pending');
      expect(NOTE_STATUSES.COMMITTED).toBe('committed');
      expect(NOTE_STATUSES.NULLIFIED).toBe('nullified');
    });
  });

  describe('TRANSACTION_STATUSES', () => {
    it('should have all transaction statuses', () => {
      expect(TRANSACTION_STATUSES.PENDING).toBe('pending');
      expect(TRANSACTION_STATUSES.CONFIRMED).toBe('confirmed');
      expect(TRANSACTION_STATUSES.FAILED).toBe('failed');
    });
  });

  describe('POLLING_INTERVALS', () => {
    it('should have correct polling intervals in milliseconds', () => {
      expect(POLLING_INTERVALS.FAST).toBe(10000); // 10 seconds
      expect(POLLING_INTERVALS.NORMAL).toBe(30000); // 30 seconds
      expect(POLLING_INTERVALS.SLOW).toBe(60000); // 1 minute
    });
  });

  describe('API_VERSION', () => {
    it('should be v1', () => {
      expect(API_VERSION).toBe('v1');
    });
  });

  describe('LICENSING_NOTICE', () => {
    it('should contain required licensing information', () => {
      expect(LICENSING_NOTICE).toContain('Velocity BPA Licensing Notice');
      expect(LICENSING_NOTICE).toContain('Business Source License 1.1');
      expect(LICENSING_NOTICE).toContain('BSL 1.1');
      expect(LICENSING_NOTICE).toContain('for-profit organizations');
      expect(LICENSING_NOTICE).toContain('commercial license');
      expect(LICENSING_NOTICE).toContain('velobpa.com/licensing');
      expect(LICENSING_NOTICE).toContain('licensing@velobpa.com');
    });
  });
});
