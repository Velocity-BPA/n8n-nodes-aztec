/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { aztecApiRequest } from '../../transport/aztecClient';

export const transactionsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['transactions'],
      },
    },
    options: [
      {
        name: 'Estimate Fees',
        value: 'estimateFees',
        description: 'Calculate transaction fees',
        action: 'Estimate transaction fees',
      },
      {
        name: 'Get Transaction',
        value: 'getTransaction',
        description: 'Get transaction details',
        action: 'Get transaction details',
      },
      {
        name: 'Get Transaction Proof',
        value: 'getTransactionProof',
        description: 'Get ZK proof for a transaction',
        action: 'Get transaction proof',
      },
      {
        name: 'Get Transaction Status',
        value: 'getTransactionStatus',
        description: 'Get confirmation status',
        action: 'Get transaction status',
      },
      {
        name: 'Submit Transaction',
        value: 'submitTransaction',
        description: 'Submit a signed transaction',
        action: 'Submit transaction',
      },
    ],
    default: 'getTransaction',
  },
];

export const transactionsFields: INodeProperties[] = [
  // Get Transaction fields
  {
    displayName: 'Transaction Hash',
    name: 'txHash',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'The transaction hash',
    displayOptions: {
      show: {
        resource: ['transactions'],
        operation: ['getTransaction', 'getTransactionStatus', 'getTransactionProof'],
      },
    },
    required: true,
  },

  // Submit Transaction fields
  {
    displayName: 'Signed Transaction',
    name: 'signedTx',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'The signed transaction data',
    displayOptions: {
      show: {
        resource: ['transactions'],
        operation: ['submitTransaction'],
      },
    },
    required: true,
  },
  {
    displayName: 'Proof Data',
    name: 'proofData',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'The ZK proof data for the transaction',
    displayOptions: {
      show: {
        resource: ['transactions'],
        operation: ['submitTransaction'],
      },
    },
    required: true,
  },

  // Estimate Fees fields
  {
    displayName: 'Transaction Type',
    name: 'txType',
    type: 'options',
    options: [
      {
        name: 'Private Transfer',
        value: 'privateTransfer',
      },
      {
        name: 'Public Transfer',
        value: 'publicTransfer',
      },
      {
        name: 'Shield',
        value: 'shield',
      },
      {
        name: 'Unshield',
        value: 'unshield',
      },
      {
        name: 'Swap',
        value: 'swap',
      },
      {
        name: 'Bridge',
        value: 'bridge',
      },
      {
        name: 'Contract Call',
        value: 'contractCall',
      },
    ],
    default: 'privateTransfer',
    description: 'Type of transaction to estimate fees for',
    displayOptions: {
      show: {
        resource: ['transactions'],
        operation: ['estimateFees'],
      },
    },
  },
  {
    displayName: 'Token Address',
    name: 'tokenAddress',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'Token address for the transaction',
    displayOptions: {
      show: {
        resource: ['transactions'],
        operation: ['estimateFees'],
      },
    },
  },
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'string',
    default: '',
    placeholder: '1.0',
    description: 'Transaction amount',
    displayOptions: {
      show: {
        resource: ['transactions'],
        operation: ['estimateFees'],
      },
    },
  },
  {
    displayName: 'Priority',
    name: 'priority',
    type: 'options',
    options: [
      {
        name: 'Low',
        value: 'low',
      },
      {
        name: 'Medium',
        value: 'medium',
      },
      {
        name: 'High',
        value: 'high',
      },
    ],
    default: 'medium',
    description: 'Transaction priority level',
    displayOptions: {
      show: {
        resource: ['transactions'],
        operation: ['estimateFees'],
      },
    },
  },
];

export async function executeTransactionsOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'getTransaction': {
      const txHash = this.getNodeParameter('txHash', i) as string;
      responseData = await aztecApiRequest.call(this, 'GET', `/v1/transactions/${txHash}`);
      break;
    }

    case 'getTransactionStatus': {
      const txHash = this.getNodeParameter('txHash', i) as string;
      responseData = await aztecApiRequest.call(this, 'GET', `/v1/transactions/${txHash}/status`);
      break;
    }

    case 'getTransactionProof': {
      const txHash = this.getNodeParameter('txHash', i) as string;
      responseData = await aztecApiRequest.call(this, 'GET', `/v1/transactions/${txHash}/proof`);
      break;
    }

    case 'submitTransaction': {
      const signedTx = this.getNodeParameter('signedTx', i) as string;
      const proofData = this.getNodeParameter('proofData', i) as string;

      responseData = await aztecApiRequest.call(this, 'POST', '/v1/transactions', {
        signedTx,
        proofData,
      });
      break;
    }

    case 'estimateFees': {
      const txType = this.getNodeParameter('txType', i) as string;
      const tokenAddress = this.getNodeParameter('tokenAddress', i, '') as string;
      const amount = this.getNodeParameter('amount', i, '') as string;
      const priority = this.getNodeParameter('priority', i, 'medium') as string;

      const body: IDataObject = { txType, priority };
      if (tokenAddress) body.tokenAddress = tokenAddress;
      if (amount) body.amount = amount;

      responseData = await aztecApiRequest.call(this, 'POST', '/v1/transactions/estimate-fees', body);
      break;
    }
  }

  return responseData;
}
