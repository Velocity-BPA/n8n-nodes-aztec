/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { aztecApiRequest } from '../../transport/aztecClient';

export const publicTokensOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['publicTokens'],
      },
    },
    options: [
      {
        name: 'Deposit',
        value: 'deposit',
        description: 'Move tokens from L1 to Aztec',
        action: 'Deposit tokens from L1',
      },
      {
        name: 'Get Public Balance',
        value: 'getPublicBalance',
        description: 'Get visible balance for an account',
        action: 'Get public balance',
      },
      {
        name: 'Public Transfer',
        value: 'publicTransfer',
        description: 'Standard visible token transfer',
        action: 'Transfer tokens publicly',
      },
      {
        name: 'Withdraw',
        value: 'withdraw',
        description: 'Move tokens from Aztec to L1',
        action: 'Withdraw tokens to L1',
      },
    ],
    default: 'getPublicBalance',
  },
];

export const publicTokensFields: INodeProperties[] = [
  // Get Public Balance fields
  {
    displayName: 'Account Address',
    name: 'accountAddress',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'The Aztec account address',
    displayOptions: {
      show: {
        resource: ['publicTokens'],
        operation: ['getPublicBalance'],
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
        resource: ['publicTokens'],
        operation: ['getPublicBalance', 'deposit', 'withdraw', 'publicTransfer'],
      },
    },
    required: true,
  },

  // Deposit fields
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'string',
    default: '',
    placeholder: '1.0',
    description: 'Amount of tokens to deposit/withdraw/transfer',
    displayOptions: {
      show: {
        resource: ['publicTokens'],
        operation: ['deposit', 'withdraw', 'publicTransfer'],
      },
    },
    required: true,
  },
  {
    displayName: 'L1 Address',
    name: 'l1Address',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'L1 Ethereum address',
    displayOptions: {
      show: {
        resource: ['publicTokens'],
        operation: ['deposit'],
      },
    },
    required: true,
  },

  // Withdraw fields
  {
    displayName: 'L1 Recipient',
    name: 'l1Recipient',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'L1 Ethereum address to receive withdrawn tokens',
    displayOptions: {
      show: {
        resource: ['publicTokens'],
        operation: ['withdraw'],
      },
    },
    required: true,
  },

  // Public Transfer fields
  {
    displayName: 'To Address',
    name: 'toAddress',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'Recipient Aztec address',
    displayOptions: {
      show: {
        resource: ['publicTokens'],
        operation: ['publicTransfer'],
      },
    },
    required: true,
  },
];

export async function executePublicTokensOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'getPublicBalance': {
      const accountAddress = this.getNodeParameter('accountAddress', i) as string;
      const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
      responseData = await aztecApiRequest.call(
        this,
        'GET',
        `/v1/tokens/public/balance/${accountAddress}`,
        {},
        { tokenAddress },
      );
      break;
    }

    case 'deposit': {
      const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
      const amount = this.getNodeParameter('amount', i) as string;
      const l1Address = this.getNodeParameter('l1Address', i) as string;

      responseData = await aztecApiRequest.call(this, 'POST', '/v1/tokens/public/deposit', {
        tokenAddress,
        amount,
        l1Address,
      });
      break;
    }

    case 'withdraw': {
      const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
      const amount = this.getNodeParameter('amount', i) as string;
      const l1Recipient = this.getNodeParameter('l1Recipient', i) as string;

      responseData = await aztecApiRequest.call(this, 'POST', '/v1/tokens/public/withdraw', {
        tokenAddress,
        amount,
        l1Recipient,
      });
      break;
    }

    case 'publicTransfer': {
      const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
      const amount = this.getNodeParameter('amount', i) as string;
      const toAddress = this.getNodeParameter('toAddress', i) as string;

      responseData = await aztecApiRequest.call(this, 'POST', '/v1/tokens/public/transfer', {
        tokenAddress,
        amount,
        to: toAddress,
      });
      break;
    }
  }

  return responseData;
}
