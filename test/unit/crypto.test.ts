/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  deriveAztecKeys,
  generateMasterSecret,
  deriveAccountAddress,
  computeNoteCommitment,
  computeNullifier,
  encryptNote,
  generateNoteRandomness,
  computeSecretHash,
  generateShieldSecret,
  isValidHex,
  padHex,
  numberToHex,
  hexToNumber,
} from '../../nodes/Aztec/utils/crypto';

describe('Aztec Crypto Utilities', () => {
  describe('generateMasterSecret', () => {
    it('should generate a valid 32-byte hex string', () => {
      const secret = generateMasterSecret();
      expect(secret).toMatch(/^0x[a-f0-9]{64}$/i);
    });

    it('should generate unique secrets on each call', () => {
      const secret1 = generateMasterSecret();
      const secret2 = generateMasterSecret();
      expect(secret1).not.toBe(secret2);
    });
  });

  describe('deriveAztecKeys', () => {
    const testSecret = '0x' + '1'.repeat(64);

    it('should derive spending, viewing, and nullifier key pairs', () => {
      const keys = deriveAztecKeys(testSecret);

      expect(keys.spendingKey).toBeDefined();
      expect(keys.viewingKey).toBeDefined();
      expect(keys.nullifierKey).toBeDefined();
    });

    it('should generate valid hex key pairs', () => {
      const keys = deriveAztecKeys(testSecret);

      expect(keys.spendingKey.publicKey).toMatch(/^0x[a-f0-9]{64}$/i);
      expect(keys.spendingKey.privateKey).toMatch(/^0x[a-f0-9]{64}$/i);
      expect(keys.viewingKey.publicKey).toMatch(/^0x[a-f0-9]{64}$/i);
      expect(keys.viewingKey.privateKey).toMatch(/^0x[a-f0-9]{64}$/i);
      expect(keys.nullifierKey.publicKey).toMatch(/^0x[a-f0-9]{64}$/i);
      expect(keys.nullifierKey.privateKey).toMatch(/^0x[a-f0-9]{64}$/i);
    });

    it('should set correct key types', () => {
      const keys = deriveAztecKeys(testSecret);

      expect(keys.spendingKey.type).toBe('spending');
      expect(keys.viewingKey.type).toBe('viewing');
      expect(keys.nullifierKey.type).toBe('nullifier');
    });

    it('should produce deterministic keys for same secret', () => {
      const keys1 = deriveAztecKeys(testSecret);
      const keys2 = deriveAztecKeys(testSecret);

      expect(keys1.spendingKey.publicKey).toBe(keys2.spendingKey.publicKey);
      expect(keys1.viewingKey.publicKey).toBe(keys2.viewingKey.publicKey);
      expect(keys1.nullifierKey.publicKey).toBe(keys2.nullifierKey.publicKey);
    });

    it('should produce different keys for different secrets', () => {
      const secret2 = '0x' + '2'.repeat(64);
      const keys1 = deriveAztecKeys(testSecret);
      const keys2 = deriveAztecKeys(secret2);

      expect(keys1.spendingKey.publicKey).not.toBe(keys2.spendingKey.publicKey);
    });
  });

  describe('deriveAccountAddress', () => {
    it('should derive a valid address from public keys', () => {
      const spendingPublicKey = '0x' + 'a'.repeat(64);
      const viewingPublicKey = '0x' + 'b'.repeat(64);
      const partialAddress = '0x' + 'c'.repeat(64);

      const address = deriveAccountAddress(spendingPublicKey, viewingPublicKey, partialAddress);

      expect(address).toMatch(/^0x[a-f0-9]{64}$/i);
    });

    it('should be deterministic', () => {
      const spendingPublicKey = '0x' + 'a'.repeat(64);
      const viewingPublicKey = '0x' + 'b'.repeat(64);
      const partialAddress = '0x' + 'c'.repeat(64);

      const address1 = deriveAccountAddress(spendingPublicKey, viewingPublicKey, partialAddress);
      const address2 = deriveAccountAddress(spendingPublicKey, viewingPublicKey, partialAddress);

      expect(address1).toBe(address2);
    });
  });

  describe('computeNoteCommitment', () => {
    it('should compute a valid commitment hash', () => {
      const value = '0x' + '1'.repeat(64);
      const tokenAddress = '0x' + '2'.repeat(64);
      const owner = '0x' + '3'.repeat(64);
      const randomness = '0x' + '4'.repeat(64);

      const commitment = computeNoteCommitment(value, tokenAddress, owner, randomness);

      expect(commitment).toMatch(/^0x[a-f0-9]{64}$/i);
    });

    it('should be deterministic', () => {
      const value = '0x100';
      const tokenAddress = '0x' + '2'.repeat(64);
      const owner = '0x' + '3'.repeat(64);
      const randomness = '0x' + '4'.repeat(64);

      const commitment1 = computeNoteCommitment(value, tokenAddress, owner, randomness);
      const commitment2 = computeNoteCommitment(value, tokenAddress, owner, randomness);

      expect(commitment1).toBe(commitment2);
    });

    it('should produce different commitments for different values', () => {
      const tokenAddress = '0x' + '2'.repeat(64);
      const owner = '0x' + '3'.repeat(64);
      const randomness = '0x' + '4'.repeat(64);

      const commitment1 = computeNoteCommitment('0x100', tokenAddress, owner, randomness);
      const commitment2 = computeNoteCommitment('0x200', tokenAddress, owner, randomness);

      expect(commitment1).not.toBe(commitment2);
    });
  });

  describe('computeNullifier', () => {
    it('should compute a valid nullifier hash', () => {
      const noteCommitment = '0x' + '1'.repeat(64);
      const nullifierKey = '0x' + '2'.repeat(64);
      const position = 0;

      const nullifier = computeNullifier(noteCommitment, nullifierKey, position);

      expect(nullifier).toMatch(/^0x[a-f0-9]{64}$/i);
    });

    it('should produce different nullifiers for different positions', () => {
      const noteCommitment = '0x' + '1'.repeat(64);
      const nullifierKey = '0x' + '2'.repeat(64);

      const nullifier1 = computeNullifier(noteCommitment, nullifierKey, 0);
      const nullifier2 = computeNullifier(noteCommitment, nullifierKey, 1);

      expect(nullifier1).not.toBe(nullifier2);
    });
  });

  describe('encryptNote and decryptNote', () => {
    it('should encrypt and decrypt note data correctly', () => {
      const noteData = 'Test note data 12345';
      const masterSecret = generateMasterSecret();
      const keys = deriveAztecKeys(masterSecret);

      const encrypted = encryptNote(noteData, keys.viewingKey.publicKey);
      expect(encrypted.ciphertext).toMatch(/^0x[a-f0-9]+$/i);
      expect(encrypted.ephemeralPublicKey).toMatch(/^0x[a-f0-9]+$/i);
      expect(encrypted.nonce).toMatch(/^0x[a-f0-9]+$/i);
    });

    it('should produce different ciphertexts for same data', () => {
      const noteData = 'Test note data';
      const masterSecret = generateMasterSecret();
      const keys = deriveAztecKeys(masterSecret);

      const encrypted1 = encryptNote(noteData, keys.viewingKey.publicKey);
      const encrypted2 = encryptNote(noteData, keys.viewingKey.publicKey);

      // Due to random ephemeral key, ciphertexts should differ
      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
    });
  });

  describe('generateNoteRandomness', () => {
    it('should generate a valid 32-byte hex string', () => {
      const randomness = generateNoteRandomness();
      expect(randomness).toMatch(/^0x[a-f0-9]{64}$/i);
    });

    it('should generate unique values', () => {
      const rand1 = generateNoteRandomness();
      const rand2 = generateNoteRandomness();
      expect(rand1).not.toBe(rand2);
    });
  });

  describe('computeSecretHash', () => {
    it('should compute a valid hash', () => {
      const secret = '0x' + '1'.repeat(64);
      const hash = computeSecretHash(secret);
      expect(hash).toMatch(/^0x[a-f0-9]{64}$/i);
    });

    it('should be deterministic', () => {
      const secret = '0x' + '1'.repeat(64);
      const hash1 = computeSecretHash(secret);
      const hash2 = computeSecretHash(secret);
      expect(hash1).toBe(hash2);
    });
  });

  describe('generateShieldSecret', () => {
    it('should generate a valid 32-byte hex string', () => {
      const secret = generateShieldSecret();
      expect(secret).toMatch(/^0x[a-f0-9]{64}$/i);
    });
  });

  describe('isValidHex', () => {
    it('should validate correct hex strings', () => {
      expect(isValidHex('0x1234')).toBe(true);
      expect(isValidHex('0xabcdef')).toBe(true);
      expect(isValidHex('0xABCDEF')).toBe(true);
      expect(isValidHex('0x' + '1'.repeat(64))).toBe(true);
    });

    it('should reject invalid hex strings', () => {
      expect(isValidHex('1234')).toBe(false);
      expect(isValidHex('0xgh')).toBe(false);
      expect(isValidHex('')).toBe(false);
      expect(isValidHex('0x')).toBe(false);
    });

    it('should validate expected length', () => {
      expect(isValidHex('0x1234', 4)).toBe(true);
      expect(isValidHex('0x1234', 6)).toBe(false);
      expect(isValidHex('0x' + '1'.repeat(64), 64)).toBe(true);
    });
  });

  describe('padHex', () => {
    it('should pad hex strings to specified length', () => {
      expect(padHex('0x1', 4)).toBe('0x0001');
      expect(padHex('0x12', 4)).toBe('0x0012');
      expect(padHex('0x123', 4)).toBe('0x0123');
      expect(padHex('0x1234', 4)).toBe('0x1234');
    });

    it('should handle hex without 0x prefix', () => {
      expect(padHex('1', 4)).toBe('0x0001');
    });
  });

  describe('numberToHex', () => {
    it('should convert numbers to hex', () => {
      expect(numberToHex(0)).toBe('0x0');
      expect(numberToHex(255)).toBe('0xff');
      expect(numberToHex(4096)).toBe('0x1000');
    });

    it('should handle bigint', () => {
      expect(numberToHex(BigInt('1000000000000000000'))).toBe('0xde0b6b3a7640000');
    });
  });

  describe('hexToNumber', () => {
    it('should convert hex to bigint', () => {
      expect(hexToNumber('0x0')).toBe(BigInt(0));
      expect(hexToNumber('0xff')).toBe(BigInt(255));
      expect(hexToNumber('0x1000')).toBe(BigInt(4096));
    });

    it('should handle large numbers', () => {
      expect(hexToNumber('0xde0b6b3a7640000')).toBe(BigInt('1000000000000000000'));
    });
  });
});
