/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { aztecApiRequest } from '../../transport/aztecClient';

export const bridgesOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['bridges'],
      },
    },
    options: [
      {
        name: 'Call Bridge',
        value: 'callBridge',
        description: 'Execute a bridge action',
        action: 'Call bridge',
      },
      {
        name: 'Get Bridge Info',
        value: 'getBridgeInfo',
        description: 'Get bridge details',
        action: 'Get bridge info',
      },
      {
        name: 'Get Bridge Positions',
        value: 'getBridgePositions',
        description: 'Get user positions in bridges',
        action: 'Get bridge positions',
      },
      {
        name: 'Get Bridges',
        value: 'getBridges',
        description: 'Get available bridges',
        action: 'Get bridges',
      },
    ],
    default: 'getBridges',
  },
];

export const bridgesFields: INodeProperties[] = [
  // Get Bridges filters
  {
    displayName: 'Filter by Protocol',
    name: 'protocol',
    type: 'string',
    default: '',
    description: 'Filter bridges by protocol name',
    displayOptions: {
      show: {
        resource: ['bridges'],
        operation: ['getBridges'],
      },
    },
  },
  {
    displayName: 'Active Only',
    name: 'activeOnly',
    type: 'boolean',
    default: true,
    description: 'Whether to only return active bridges',
    displayOptions: {
      show: {
        resource: ['bridges'],
        operation: ['getBridges'],
      },
    },
  },

  // Get Bridge Info fields
  {
    displayName: 'Bridge ID',
    name: 'bridgeId',
    type: 'string',
    default: '',
    description: 'The bridge identifier',
    displayOptions: {
      show: {
        resource: ['bridges'],
        operation: ['getBridgeInfo', 'callBridge'],
      },
    },
    required: true,
  },

  // Call Bridge fields
  {
    displayName: 'Input Asset',
    name: 'inputAsset',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'Address of the input asset',
    displayOptions: {
      show: {
        resource: ['bridges'],
        operation: ['callBridge'],
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
    description: 'Amount of input asset',
    displayOptions: {
      show: {
        resource: ['bridges'],
        operation: ['callBridge'],
      },
    },
    required: true,
  },
  {
    displayName: 'Output Asset',
    name: 'outputAsset',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'Address of the expected output asset',
    displayOptions: {
      show: {
        resource: ['bridges'],
        operation: ['callBridge'],
      },
    },
  },
  {
    displayName: 'Aux Data',
    name: 'auxData',
    type: 'number',
    default: 0,
    description: 'Auxiliary data for the bridge call',
    displayOptions: {
      show: {
        resource: ['bridges'],
        operation: ['callBridge'],
      },
    },
  },

  // Get Bridge Positions fields
  {
    displayName: 'Account Address',
    name: 'accountAddress',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'The Aztec account address',
    displayOptions: {
      show: {
        resource: ['bridges'],
        operation: ['getBridgePositions'],
      },
    },
    required: true,
  },
  {
    displayName: 'Bridge ID Filter',
    name: 'bridgeIdFilter',
    type: 'string',
    default: '',
    description: 'Filter positions by bridge ID',
    displayOptions: {
      show: {
        resource: ['bridges'],
        operation: ['getBridgePositions'],
      },
    },
  },
  {
    displayName: 'Status Filter',
    name: 'statusFilter',
    type: 'options',
    options: [
      {
        name: 'All',
        value: 'all',
      },
      {
        name: 'Active',
        value: 'active',
      },
      {
        name: 'Closed',
        value: 'closed',
      },
      {
        name: 'Pending',
        value: 'pending',
      },
    ],
    default: 'all',
    description: 'Filter positions by status',
    displayOptions: {
      show: {
        resource: ['bridges'],
        operation: ['getBridgePositions'],
      },
    },
  },
];

export async function executeBridgesOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'getBridges': {
      const protocol = this.getNodeParameter('protocol', i, '') as string;
      const activeOnly = this.getNodeParameter('activeOnly', i, true) as boolean;

      const query: IDataObject = {};
      if (protocol) query.protocol = protocol;
      if (activeOnly) query.active = true;

      responseData = await aztecApiRequest.call(this, 'GET', '/v1/bridges', {}, query);
      break;
    }

    case 'getBridgeInfo': {
      const bridgeId = this.getNodeParameter('bridgeId', i) as string;
      responseData = await aztecApiRequest.call(this, 'GET', `/v1/bridges/${bridgeId}`);
      break;
    }

    case 'callBridge': {
      const bridgeId = this.getNodeParameter('bridgeId', i) as string;
      const inputAsset = this.getNodeParameter('inputAsset', i) as string;
      const inputAmount = this.getNodeParameter('inputAmount', i) as string;
      const outputAsset = this.getNodeParameter('outputAsset', i, '') as string;
      const auxData = this.getNodeParameter('auxData', i, 0) as number;

      const body: IDataObject = {
        bridgeId,
        inputAsset,
        inputAmount,
      };
      if (outputAsset) body.outputAsset = outputAsset;
      if (auxData) body.auxData = auxData;

      responseData = await aztecApiRequest.call(this, 'POST', '/v1/bridges/call', body);
      break;
    }

    case 'getBridgePositions': {
      const accountAddress = this.getNodeParameter('accountAddress', i) as string;
      const bridgeIdFilter = this.getNodeParameter('bridgeIdFilter', i, '') as string;
      const statusFilter = this.getNodeParameter('statusFilter', i, 'all') as string;

      const query: IDataObject = {};
      if (bridgeIdFilter) query.bridgeId = bridgeIdFilter;
      if (statusFilter !== 'all') query.status = statusFilter;

      responseData = await aztecApiRequest.call(
        this,
        'GET',
        `/v1/bridges/positions/${accountAddress}`,
        {},
        query,
      );
      break;
    }
  }

  return responseData;
}
