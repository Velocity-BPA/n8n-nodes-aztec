/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { aztecApiRequest } from '../../transport/aztecClient';

export const privateTokensOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['privateTokens'],
      },
    },
    options: [
      {
        name: 'Get Private Balance',
        value: 'getPrivateBalance',
        description: 'Get hidden balance for an account',
        action: 'Get private balance',
      },
      {
        name: 'Get Private History',
        value: 'getPrivateHistory',
        description: 'Get private transaction history',
        action: 'Get private transaction history',
      },
      {
        name: 'Private Transfer',
        value: 'privateTransfer',
        description: 'Send tokens privately',
        action: 'Send tokens privately',
      },
      {
        name: 'Shield Tokens',
        value: 'shieldTokens',
        description: 'Move tokens from public to private state',
        action: 'Shield tokens (public to private)',
      },
      {
        name: 'Unshield Tokens',
        value: 'unshieldTokens',
        description: 'Move tokens from private to public state',
        action: 'Unshield tokens (private to public)',
      },
    ],
    default: 'getPrivateBalance',
  },
];

export const privateTokensFields: INodeProperties[] = [
  // Get Private Balance fields
  {
    displayName: 'Account Address',
    name: 'accountAddress',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'The Aztec account address',
    displayOptions: {
      show: {
        resource: ['privateTokens'],
        operation: ['getPrivateBalance', 'getPrivateHistory'],
      },
    },
    required: true,
  },
  {
    displayName: 'Token Address',
    name: 'tokenAddress',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'The token contract address',
    displayOptions: {
      show: {
        resource: ['privateTokens'],
        operation: [
          'getPrivateBalance',
          'shieldTokens',
          'unshieldTokens',
          'privateTransfer',
          'getPrivateHistory',
        ],
      },
    },
    required: true,
  },

  // Shield Tokens fields
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'string',
    default: '',
    placeholder: '1.0',
    description: 'Amount of tokens to shield/unshield/transfer',
    displayOptions: {
      show: {
        resource: ['privateTokens'],
        operation: ['shieldTokens', 'unshieldTokens', 'privateTransfer'],
      },
    },
    required: true,
  },
  {
    displayName: 'Secret Hash',
    name: 'secretHash',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'Secret hash for shield operation',
    displayOptions: {
      show: {
        resource: ['privateTokens'],
        operation: ['shieldTokens'],
      },
    },
  },

  // Unshield Tokens fields
  {
    displayName: 'Recipient',
    name: 'recipient',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'Public address to receive unshielded tokens',
    displayOptions: {
      show: {
        resource: ['privateTokens'],
        operation: ['unshieldTokens'],
      },
    },
    required: true,
  },

  // Private Transfer fields
  {
    displayName: 'To Address',
    name: 'toAddress',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'Recipient Aztec address',
    displayOptions: {
      show: {
        resource: ['privateTokens'],
        operation: ['privateTransfer'],
      },
    },
    required: true,
  },

  // History pagination
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    description: 'Maximum number of records to return',
    displayOptions: {
      show: {
        resource: ['privateTokens'],
        operation: ['getPrivateHistory'],
      },
    },
  },
  {
    displayName: 'Offset',
    name: 'offset',
    type: 'number',
    default: 0,
    description: 'Number of records to skip',
    displayOptions: {
      show: {
        resource: ['privateTokens'],
        operation: ['getPrivateHistory'],
      },
    },
  },
];

export async function executePrivateTokensOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'getPrivateBalance': {
      const accountAddress = this.getNodeParameter('accountAddress', i) as string;
      const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
      responseData = await aztecApiRequest.call(
        this,
        'GET',
        `/v1/tokens/private/balance/${accountAddress}`,
        {},
        { tokenAddress },
      );
      break;
    }

    case 'shieldTokens': {
      const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
      const amount = this.getNodeParameter('amount', i) as string;
      const secretHash = this.getNodeParameter('secretHash', i, '') as string;

      const body: IDataObject = {
        tokenAddress,
        amount,
      };
      if (secretHash) body.secretHash = secretHash;

      responseData = await aztecApiRequest.call(this, 'POST', '/v1/tokens/private/shield', body);
      break;
    }

    case 'unshieldTokens': {
      const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
      const amount = this.getNodeParameter('amount', i) as string;
      const recipient = this.getNodeParameter('recipient', i) as string;

      responseData = await aztecApiRequest.call(this, 'POST', '/v1/tokens/private/unshield', {
        tokenAddress,
        amount,
        recipient,
      });
      break;
    }

    case 'privateTransfer': {
      const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
      const amount = this.getNodeParameter('amount', i) as string;
      const toAddress = this.getNodeParameter('toAddress', i) as string;

      responseData = await aztecApiRequest.call(this, 'POST', '/v1/tokens/private/transfer', {
        tokenAddress,
        amount,
        to: toAddress,
      });
      break;
    }

    case 'getPrivateHistory': {
      const accountAddress = this.getNodeParameter('accountAddress', i) as string;
      const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
      const limit = this.getNodeParameter('limit', i, 50) as number;
      const offset = this.getNodeParameter('offset', i, 0) as number;

      responseData = await aztecApiRequest.call(
        this,
        'GET',
        `/v1/tokens/private/history/${accountAddress}`,
        {},
        { tokenAddress, limit, offset },
      );
      break;
    }
  }

  return responseData;
}
