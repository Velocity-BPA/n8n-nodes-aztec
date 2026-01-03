/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { aztecApiRequest } from '../../transport/aztecClient';

export const notesOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['notes'],
      },
    },
    options: [
      {
        name: 'Get Note by Commitment',
        value: 'getNoteByCommitment',
        description: 'Lookup a specific note by its commitment',
        action: 'Get note by commitment',
      },
      {
        name: 'Get Notes',
        value: 'getNotes',
        description: "Get user's notes",
        action: 'Get notes',
      },
      {
        name: 'Get Nullified Notes',
        value: 'getNullifiedNotes',
        description: 'Get spent notes',
        action: 'Get nullified notes',
      },
      {
        name: 'Get Pending Notes',
        value: 'getPendingNotes',
        description: 'Get uncommitted notes',
        action: 'Get pending notes',
      },
      {
        name: 'Spend Note',
        value: 'spendNote',
        description: 'Use a note in a transaction',
        action: 'Spend a note',
      },
    ],
    default: 'getNotes',
  },
];

export const notesFields: INodeProperties[] = [
  // Get Notes fields
  {
    displayName: 'Account Address',
    name: 'accountAddress',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'The Aztec account address',
    displayOptions: {
      show: {
        resource: ['notes'],
        operation: ['getNotes', 'getPendingNotes', 'getNullifiedNotes'],
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
    description: 'Filter by token contract address',
    displayOptions: {
      show: {
        resource: ['notes'],
        operation: ['getNotes', 'getPendingNotes', 'getNullifiedNotes'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    description: 'Maximum number of notes to return',
    displayOptions: {
      show: {
        resource: ['notes'],
        operation: ['getNotes', 'getPendingNotes', 'getNullifiedNotes'],
      },
    },
  },
  {
    displayName: 'Offset',
    name: 'offset',
    type: 'number',
    default: 0,
    description: 'Number of notes to skip',
    displayOptions: {
      show: {
        resource: ['notes'],
        operation: ['getNotes', 'getPendingNotes', 'getNullifiedNotes'],
      },
    },
  },

  // Get Note by Commitment fields
  {
    displayName: 'Commitment',
    name: 'commitment',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'The note commitment hash',
    displayOptions: {
      show: {
        resource: ['notes'],
        operation: ['getNoteByCommitment', 'spendNote'],
      },
    },
    required: true,
  },

  // Spend Note fields
  {
    displayName: 'Transaction Type',
    name: 'transactionType',
    type: 'options',
    options: [
      {
        name: 'Transfer',
        value: 'transfer',
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
    ],
    default: 'transfer',
    description: 'Type of transaction to create with this note',
    displayOptions: {
      show: {
        resource: ['notes'],
        operation: ['spendNote'],
      },
    },
  },
  {
    displayName: 'Recipient',
    name: 'recipient',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'Recipient address for the transaction',
    displayOptions: {
      show: {
        resource: ['notes'],
        operation: ['spendNote'],
      },
    },
    required: true,
  },
];

export async function executeNotesOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'getNotes': {
      const accountAddress = this.getNodeParameter('accountAddress', i) as string;
      const tokenAddress = this.getNodeParameter('tokenAddress', i, '') as string;
      const limit = this.getNodeParameter('limit', i, 50) as number;
      const offset = this.getNodeParameter('offset', i, 0) as number;

      const query: IDataObject = { limit, offset };
      if (tokenAddress) query.tokenAddress = tokenAddress;

      responseData = await aztecApiRequest.call(
        this,
        'GET',
        `/v1/notes/${accountAddress}`,
        {},
        query,
      );
      break;
    }

    case 'getNoteByCommitment': {
      const commitment = this.getNodeParameter('commitment', i) as string;
      responseData = await aztecApiRequest.call(this, 'GET', `/v1/notes/commitment/${commitment}`);
      break;
    }

    case 'spendNote': {
      const commitment = this.getNodeParameter('commitment', i) as string;
      const transactionType = this.getNodeParameter('transactionType', i) as string;
      const recipient = this.getNodeParameter('recipient', i) as string;

      responseData = await aztecApiRequest.call(this, 'POST', '/v1/notes/spend', {
        commitment,
        transactionType,
        recipient,
      });
      break;
    }

    case 'getPendingNotes': {
      const accountAddress = this.getNodeParameter('accountAddress', i) as string;
      const tokenAddress = this.getNodeParameter('tokenAddress', i, '') as string;
      const limit = this.getNodeParameter('limit', i, 50) as number;
      const offset = this.getNodeParameter('offset', i, 0) as number;

      const query: IDataObject = { limit, offset, status: 'pending' };
      if (tokenAddress) query.tokenAddress = tokenAddress;

      responseData = await aztecApiRequest.call(
        this,
        'GET',
        `/v1/notes/${accountAddress}/pending`,
        {},
        query,
      );
      break;
    }

    case 'getNullifiedNotes': {
      const accountAddress = this.getNodeParameter('accountAddress', i) as string;
      const tokenAddress = this.getNodeParameter('tokenAddress', i, '') as string;
      const limit = this.getNodeParameter('limit', i, 50) as number;
      const offset = this.getNodeParameter('offset', i, 0) as number;

      const query: IDataObject = { limit, offset };
      if (tokenAddress) query.tokenAddress = tokenAddress;

      responseData = await aztecApiRequest.call(
        this,
        'GET',
        `/v1/notes/${accountAddress}/nullified`,
        {},
        query,
      );
      break;
    }
  }

  return responseData;
}
