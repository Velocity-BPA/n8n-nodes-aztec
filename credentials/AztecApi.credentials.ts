/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class AztecApi implements ICredentialType {
  name = 'aztecApi';
  displayName = 'Aztec API';
  documentationUrl = 'https://docs.aztec.network/';
  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        {
          name: 'Mainnet',
          value: 'mainnet',
        },
        {
          name: 'Testnet (Sandbox)',
          value: 'testnet',
        },
        {
          name: 'Custom',
          value: 'custom',
        },
      ],
      default: 'testnet',
      description: 'The Aztec network to connect to',
    },
    {
      displayName: 'RPC Endpoint',
      name: 'rpcEndpoint',
      type: 'string',
      default: 'http://localhost:8080',
      placeholder: 'https://aztec-rpc.example.com',
      description: 'The Aztec RPC endpoint URL',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'Account Type',
      name: 'accountType',
      type: 'options',
      options: [
        {
          name: 'Spending Account (Full Access)',
          value: 'spending',
        },
        {
          name: 'Viewing Account (Read Only)',
          value: 'viewing',
        },
      ],
      default: 'spending',
      description: 'Type of account access',
    },
    {
      displayName: 'Spending Key',
      name: 'spendingKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      placeholder: '0x...',
      description: 'Private spending key for signing transactions',
      displayOptions: {
        show: {
          accountType: ['spending'],
        },
      },
    },
    {
      displayName: 'Viewing Key',
      name: 'viewingKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      placeholder: '0x...',
      description: 'Viewing key for decrypting notes (read-only access)',
      displayOptions: {
        show: {
          accountType: ['viewing'],
        },
      },
    },
    {
      displayName: 'Account Address',
      name: 'accountAddress',
      type: 'string',
      default: '',
      placeholder: '0x...',
      description: 'The Aztec account address',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.network === "custom" ? $credentials.rpcEndpoint : ($credentials.network === "mainnet" ? "https://aztec-mainnet.example.com" : "https://aztec-testnet.example.com")}}',
      url: '/health',
      method: 'GET',
    },
  };
}
