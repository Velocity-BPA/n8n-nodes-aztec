/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  getEndpoint,
  buildQueryParams,
  formatHexString,
  parseHexString,
  validateAddress,
  validateKey,
  weiToEth,
  ethToWei,
  handleApiResponse,
  IAztecApiCredentials,
} from '../../nodes/Aztec/transport/aztecClient';
import type { IAztecApiResponse } from '../../nodes/Aztec/utils/types';

describe('Aztec Transport Utilities', () => {
  describe('getEndpoint', () => {
    it('should return mainnet endpoint', () => {
      const credentials: IAztecApiCredentials = {
        network: 'mainnet',
        accountType: 'spending',
      };
      const endpoint = getEndpoint(credentials);
      expect(endpoint).toBe('https://aztec-mainnet.example.com');
    });

    it('should return testnet endpoint', () => {
      const credentials: IAztecApiCredentials = {
        network: 'testnet',
        accountType: 'spending',
      };
      const endpoint = getEndpoint(credentials);
      expect(endpoint).toBe('https://aztec-testnet.example.com');
    });

    it('should return custom endpoint when specified', () => {
      const credentials: IAztecApiCredentials = {
        network: 'custom',
        rpcEndpoint: 'https://my-custom-node.com/',
        accountType: 'spending',
      };
      const endpoint = getEndpoint(credentials);
      expect(endpoint).toBe('https://my-custom-node.com');
    });

    it('should strip trailing slash from custom endpoint', () => {
      const credentials: IAztecApiCredentials = {
        network: 'custom',
        rpcEndpoint: 'https://my-custom-node.com///',
        accountType: 'spending',
      };
      const endpoint = getEndpoint(credentials);
      expect(endpoint).toBe('https://my-custom-node.com//');
    });

    it('should default to testnet for unknown network', () => {
      const credentials: IAztecApiCredentials = {
        network: 'unknown',
        accountType: 'spending',
      };
      const endpoint = getEndpoint(credentials);
      expect(endpoint).toBe('https://aztec-testnet.example.com');
    });
  });

  describe('buildQueryParams', () => {
    it('should filter out null, undefined, and empty values', () => {
      const params = {
        a: 'value1',
        b: null,
        c: undefined,
        d: '',
        e: 'value2',
        f: 0,
        g: false,
      };
      const query = buildQueryParams(params);
      expect(query).toEqual({
        a: 'value1',
        e: 'value2',
        f: 0,
        g: false,
      });
    });

    it('should return empty object for all empty values', () => {
      const params = {
        a: null,
        b: undefined,
        c: '',
      };
      const query = buildQueryParams(params);
      expect(query).toEqual({});
    });
  });

  describe('formatHexString', () => {
    it('should add 0x prefix if missing', () => {
      expect(formatHexString('1234')).toBe('0x1234');
      expect(formatHexString('abcdef')).toBe('0xabcdef');
    });

    it('should not double prefix', () => {
      expect(formatHexString('0x1234')).toBe('0x1234');
      expect(formatHexString('0xabcdef')).toBe('0xabcdef');
    });

    it('should handle empty string', () => {
      expect(formatHexString('')).toBe('');
    });
  });

  describe('parseHexString', () => {
    it('should remove 0x prefix', () => {
      expect(parseHexString('0x1234')).toBe('1234');
      expect(parseHexString('0xabcdef')).toBe('abcdef');
    });

    it('should return as-is if no prefix', () => {
      expect(parseHexString('1234')).toBe('1234');
      expect(parseHexString('abcdef')).toBe('abcdef');
    });

    it('should handle empty string', () => {
      expect(parseHexString('')).toBe('');
    });
  });

  describe('validateAddress', () => {
    it('should validate correct 64-char hex addresses', () => {
      expect(validateAddress('0x' + '1'.repeat(64))).toBe(true);
      expect(validateAddress('0x' + 'a'.repeat(64))).toBe(true);
      expect(validateAddress('0x' + 'A'.repeat(64))).toBe(true);
      expect(validateAddress('0x' + 'aB1C2d3E'.repeat(8))).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(validateAddress('0x' + '1'.repeat(63))).toBe(false); // too short
      expect(validateAddress('0x' + '1'.repeat(65))).toBe(false); // too long
      expect(validateAddress('1'.repeat(64))).toBe(false); // no prefix
      expect(validateAddress('0x' + 'g'.repeat(64))).toBe(false); // invalid char
      expect(validateAddress('')).toBe(false);
    });
  });

  describe('validateKey', () => {
    it('should validate correct 64-char hex keys', () => {
      expect(validateKey('0x' + '1'.repeat(64))).toBe(true);
      expect(validateKey('0x' + 'a'.repeat(64))).toBe(true);
    });

    it('should reject invalid keys', () => {
      expect(validateKey('0x' + '1'.repeat(63))).toBe(false);
      expect(validateKey('0x' + '1'.repeat(65))).toBe(false);
      expect(validateKey('1'.repeat(64))).toBe(false);
      expect(validateKey('')).toBe(false);
    });
  });

  describe('weiToEth', () => {
    it('should convert wei to eth correctly', () => {
      expect(weiToEth('1000000000000000000')).toBe('1');
      expect(weiToEth('500000000000000000')).toBe('0.5');
      expect(weiToEth('100000000000000000')).toBe('0.1');
    });

    it('should handle small amounts', () => {
      expect(weiToEth('1')).toBe('0.000000000000000001');
      expect(weiToEth('1000')).toBe('0.000000000000001');
    });

    it('should handle zero', () => {
      expect(weiToEth('0')).toBe('0');
    });

    it('should handle large amounts', () => {
      expect(weiToEth('10000000000000000000')).toBe('10');
      expect(weiToEth('1000000000000000000000')).toBe('1000');
    });
  });

  describe('ethToWei', () => {
    it('should convert eth to wei correctly', () => {
      expect(ethToWei('1')).toBe('1000000000000000000');
      expect(ethToWei('0.5')).toBe('500000000000000000');
      expect(ethToWei('0.1')).toBe('100000000000000000');
    });

    it('should handle zero', () => {
      expect(ethToWei('0')).toBe('0');
    });

    it('should handle large amounts', () => {
      expect(ethToWei('10')).toBe('10000000000000000000');
      expect(ethToWei('1000')).toBe('1000000000000000000000');
    });
  });

  describe('handleApiResponse', () => {
    it('should return data on success', () => {
      const response: IAztecApiResponse<{ id: string }> = {
        success: true,
        data: { id: '123' },
      };
      const result = handleApiResponse(response);
      expect(result).toEqual({ id: '123' });
    });

    it('should throw error on failure', () => {
      const response: IAztecApiResponse<unknown> = {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid parameters',
        },
      };
      expect(() => handleApiResponse(response)).toThrow(
        'API Error [INVALID_INPUT]: Invalid parameters',
      );
    });

    it('should return data even if error is present but success is true', () => {
      const response: IAztecApiResponse<{ id: string }> = {
        success: true,
        data: { id: '123' },
        error: {
          code: 'WARNING',
          message: 'Some warning',
        },
      };
      const result = handleApiResponse(response);
      expect(result).toEqual({ id: '123' });
    });
  });
});
