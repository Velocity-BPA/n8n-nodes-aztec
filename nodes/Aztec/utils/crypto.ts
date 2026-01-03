/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes, utf8ToBytes, randomBytes } from '@noble/hashes/utils';
import type { IAztecKeyPair, IAztecEncryptedNote } from './types';

/**
 * Derives Aztec keys from a master secret
 */
export function deriveAztecKeys(masterSecret: string): {
  spendingKey: IAztecKeyPair;
  viewingKey: IAztecKeyPair;
  nullifierKey: IAztecKeyPair;
} {
  const masterBytes = hexToBytes(masterSecret.replace('0x', ''));

  // Derive spending key
  const spendingPrivate = sha256(new Uint8Array([...masterBytes, ...utf8ToBytes('spending')]));
  const spendingPublic = sha256(spendingPrivate);

  // Derive viewing key
  const viewingPrivate = sha256(new Uint8Array([...masterBytes, ...utf8ToBytes('viewing')]));
  const viewingPublic = sha256(viewingPrivate);

  // Derive nullifier key
  const nullifierPrivate = sha256(new Uint8Array([...masterBytes, ...utf8ToBytes('nullifier')]));
  const nullifierPublic = sha256(nullifierPrivate);

  return {
    spendingKey: {
      publicKey: '0x' + bytesToHex(spendingPublic),
      privateKey: '0x' + bytesToHex(spendingPrivate),
      type: 'spending',
    },
    viewingKey: {
      publicKey: '0x' + bytesToHex(viewingPublic),
      privateKey: '0x' + bytesToHex(viewingPrivate),
      type: 'viewing',
    },
    nullifierKey: {
      publicKey: '0x' + bytesToHex(nullifierPublic),
      privateKey: '0x' + bytesToHex(nullifierPrivate),
      type: 'nullifier',
    },
  };
}

/**
 * Generates a random master secret
 */
export function generateMasterSecret(): string {
  const secret = randomBytes(32);
  return '0x' + bytesToHex(secret);
}

/**
 * Derives an account address from public keys
 */
export function deriveAccountAddress(
  spendingPublicKey: string,
  viewingPublicKey: string,
  partialAddress: string,
): string {
  const combined = new Uint8Array([
    ...hexToBytes(spendingPublicKey.replace('0x', '')),
    ...hexToBytes(viewingPublicKey.replace('0x', '')),
    ...hexToBytes(partialAddress.replace('0x', '')),
  ]);
  const hash = sha256(combined);
  return '0x' + bytesToHex(hash);
}

/**
 * Computes a note commitment
 */
export function computeNoteCommitment(
  value: string,
  tokenAddress: string,
  owner: string,
  randomness: string,
): string {
  const data = new Uint8Array([
    ...hexToBytes(value.replace('0x', '').padStart(64, '0')),
    ...hexToBytes(tokenAddress.replace('0x', '')),
    ...hexToBytes(owner.replace('0x', '')),
    ...hexToBytes(randomness.replace('0x', '')),
  ]);
  const hash = sha256(data);
  return '0x' + bytesToHex(hash);
}

/**
 * Computes a nullifier for a note
 */
export function computeNullifier(
  noteCommitment: string,
  nullifierKey: string,
  position: number,
): string {
  const data = new Uint8Array([
    ...hexToBytes(noteCommitment.replace('0x', '')),
    ...hexToBytes(nullifierKey.replace('0x', '')),
    ...new Uint8Array(new BigUint64Array([BigInt(position)]).buffer),
  ]);
  const hash = sha256(data);
  return '0x' + bytesToHex(hash);
}

/**
 * Simple XOR-based encryption for note data (simplified for demonstration)
 * In production, use proper AES-GCM encryption
 */
export function encryptNote(
  noteData: string,
  viewingPublicKey: string,
): IAztecEncryptedNote {
  const nonce = randomBytes(12);
  const ephemeralKey = randomBytes(32);

  // Derive shared secret (simplified)
  const sharedSecret = sha256(
    new Uint8Array([
      ...ephemeralKey,
      ...hexToBytes(viewingPublicKey.replace('0x', '')),
    ]),
  );

  // XOR encryption (simplified)
  const noteBytes = utf8ToBytes(noteData);
  const encrypted = new Uint8Array(noteBytes.length);
  for (let i = 0; i < noteBytes.length; i++) {
    encrypted[i] = noteBytes[i] ^ sharedSecret[i % sharedSecret.length];
  }

  return {
    ciphertext: '0x' + bytesToHex(encrypted),
    ephemeralPublicKey: '0x' + bytesToHex(sha256(ephemeralKey)),
    nonce: '0x' + bytesToHex(nonce),
  };
}

/**
 * Decrypts note data using viewing key
 */
export function decryptNote(
  encryptedNote: IAztecEncryptedNote,
  viewingPrivateKey: string,
): string {
  // Derive shared secret (simplified)
  const sharedSecret = sha256(
    new Uint8Array([
      ...hexToBytes(encryptedNote.ephemeralPublicKey.replace('0x', '')),
      ...hexToBytes(viewingPrivateKey.replace('0x', '')),
    ]),
  );

  // XOR decryption (simplified)
  const encryptedBytes = hexToBytes(encryptedNote.ciphertext.replace('0x', ''));
  const decrypted = new Uint8Array(encryptedBytes.length);
  for (let i = 0; i < encryptedBytes.length; i++) {
    decrypted[i] = encryptedBytes[i] ^ sharedSecret[i % sharedSecret.length];
  }

  return new TextDecoder().decode(decrypted);
}

/**
 * Generates random bytes for note randomness
 */
export function generateNoteRandomness(): string {
  const rand = randomBytes(32);
  return '0x' + bytesToHex(rand);
}

/**
 * Computes a secret hash for shield operations
 */
export function computeSecretHash(secret: string): string {
  const secretBytes = hexToBytes(secret.replace('0x', ''));
  const hash = sha256(secretBytes);
  return '0x' + bytesToHex(hash);
}

/**
 * Generates a random secret for shield operations
 */
export function generateShieldSecret(): string {
  const secret = randomBytes(32);
  return '0x' + bytesToHex(secret);
}

/**
 * Validates a hex string
 */
export function isValidHex(value: string, expectedLength?: number): boolean {
  const hexRegex = /^0x[a-fA-F0-9]+$/;
  if (!hexRegex.test(value)) return false;
  if (expectedLength !== undefined) {
    return value.length === expectedLength + 2; // +2 for '0x' prefix
  }
  return true;
}

/**
 * Pads a hex string to a specific length
 */
export function padHex(value: string, length: number): string {
  const hex = value.replace('0x', '');
  return '0x' + hex.padStart(length, '0');
}

/**
 * Converts a number to a hex string
 */
export function numberToHex(value: number | bigint): string {
  return '0x' + BigInt(value).toString(16);
}

/**
 * Converts a hex string to a number
 */
export function hexToNumber(value: string): bigint {
  return BigInt(value);
}
