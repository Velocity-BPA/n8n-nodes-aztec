/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { aztecApiRequest } from '../../transport/aztecClient';

export const privateDeFiOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['privateDeFi'],
      },
    },
    options: [
      {
        name: 'Get Supported Pairs',
        value: 'getSupportedPairs',
        description: 'Get available trading pairs',
        action: 'Get supported trading pairs',
      },
      {
        name: 'Get Swap Quote',
        value: 'getSwapQuote',
        description: 'Get exchange rate quote',
        action: 'Get swap quote',
      },
      {
        name: 'Private Bridge',
        value: 'privateBridge',
        description: 'Cross-chain transfer with privacy',
        action: 'Private bridge transfer',
      },
      {
        name: 'Private Swap',
        value: 'privateSwap',
        description: 'Confidential token swap',
        action: 'Execute private swap',
      },
    ],
    default: 'getSupportedPairs',
  },
];

export const privateDeFiFields: INodeProperties[] = [
  // Swap Quote fields
  {
    displayName: 'Input Token',
    name: 'inputToken',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'Token address to swap from',
    displayOptions: {
      show: {
        resource: ['privateDeFi'],
        operation: ['getSwapQuote', 'privateSwap'],
      },
    },
    required: true,
  },
  {
    displayName: 'Output Token',
    name: 'outputToken',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'Token address to swap to',
    displayOptions: {
      show: {
        resource: ['privateDeFi'],
        operation: ['getSwapQuote', 'privateSwap'],
      },
    },
    required: true,
  },
  {
    displayName: 'Input Amount',
    name: 'inputAmount',
    type: 'string',
    default: '',
    placeholder: '1.0',
    description: 'Amount of input token',
    displayOptions: {
      show: {
        resource: ['privateDeFi'],
        operation: ['getSwapQuote', 'privateSwap'],
      },
    },
    required: true,
  },

  // Private Swap fields
  {
    displayName: 'Minimum Output Amount',
    name: 'minOutputAmount',
    type: 'string',
    default: '',
    placeholder: '0.9',
    description: 'Minimum acceptable output amount (slippage protection)',
    displayOptions: {
      show: {
        resource: ['privateDeFi'],
        operation: ['privateSwap'],
      },
    },
    required: true,
  },
  {
    displayName: 'Deadline (Unix Timestamp)',
    name: 'deadline',
    type: 'number',
    default: 0,
    description: 'Transaction deadline (0 for no deadline)',
    displayOptions: {
      show: {
        resource: ['privateDeFi'],
        operation: ['privateSwap'],
      },
    },
  },

  // Private Bridge fields
  {
    displayName: 'Bridge ID',
    name: 'bridgeId',
    type: 'string',
    default: '',
    description: 'The bridge identifier to use',
    displayOptions: {
      show: {
        resource: ['privateDeFi'],
        operation: ['privateBridge'],
      },
    },
    required: true,
  },
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'string',
    default: '',
    placeholder: '1.0',
    description: 'Amount to bridge',
    displayOptions: {
      show: {
        resource: ['privateDeFi'],
        operation: ['privateBridge'],
      },
    },
    required: true,
  },
  {
    displayName: 'Destination Chain',
    name: 'destinationChain',
    type: 'options',
    options: [
      {
        name: 'Ethereum Mainnet',
        value: 'ethereum',
      },
      {
        name: 'Arbitrum',
        value: 'arbitrum',
      },
      {
        name: 'Optimism',
        value: 'optimism',
      },
      {
        name: 'Polygon',
        value: 'polygon',
      },
    ],
    default: 'ethereum',
    description: 'Destination chain for the bridge',
    displayOptions: {
      show: {
        resource: ['privateDeFi'],
        operation: ['privateBridge'],
      },
    },
  },
  {
    displayName: 'Destination Address',
    name: 'destinationAddress',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'Address on the destination chain',
    displayOptions: {
      show: {
        resource: ['privateDeFi'],
        operation: ['privateBridge'],
      },
    },
    required: true,
  },

  // Get Supported Pairs filters
  {
    displayName: 'Filter by Token',
    name: 'filterToken',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'Filter pairs containing this token',
    displayOptions: {
      show: {
        resource: ['privateDeFi'],
        operation: ['getSupportedPairs'],
      },
    },
  },
];

export async function executePrivateDeFiOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'getSwapQuote': {
      const inputToken = this.getNodeParameter('inputToken', i) as string;
      const outputToken = this.getNodeParameter('outputToken', i) as string;
      const inputAmount = this.getNodeParameter('inputAmount', i) as string;

      responseData = await aztecApiRequest.call(this, 'POST', '/v1/defi/quote', {
        inputToken,
        outputToken,
        inputAmount,
      });
      break;
    }

    case 'privateSwap': {
      const inputToken = this.getNodeParameter('inputToken', i) as string;
      const outputToken = this.getNodeParameter('outputToken', i) as string;
      const inputAmount = this.getNodeParameter('inputAmount', i) as string;
      const minOutputAmount = this.getNodeParameter('minOutputAmount', i) as string;
      const deadline = this.getNodeParameter('deadline', i, 0) as number;

      const body: IDataObject = {
        inputToken,
        outputToken,
        inputAmount,
        minOutputAmount,
      };
      if (deadline > 0) body.deadline = deadline;

      responseData = await aztecApiRequest.call(this, 'POST', '/v1/defi/swap', body);
      break;
    }

    case 'privateBridge': {
      const bridgeId = this.getNodeParameter('bridgeId', i) as string;
      const amount = this.getNodeParameter('amount', i) as string;
      const destinationChain = this.getNodeParameter('destinationChain', i) as string;
      const destinationAddress = this.getNodeParameter('destinationAddress', i) as string;

      responseData = await aztecApiRequest.call(this, 'POST', '/v1/defi/bridge', {
        bridgeId,
        amount,
        destinationChain,
        destinationAddress,
      });
      break;
    }

    case 'getSupportedPairs': {
      const filterToken = this.getNodeParameter('filterToken', i, '') as string;
      const query: IDataObject = {};
      if (filterToken) query.token = filterToken;

      responseData = await aztecApiRequest.call(this, 'GET', '/v1/defi/pairs', {}, query);
      break;
    }
  }

  return responseData;
}
