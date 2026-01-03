/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { aztecApiRequest } from '../../transport/aztecClient';

export const networkOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['network'],
      },
    },
    options: [
      {
        name: 'Get Bridge Stats',
        value: 'getBridgeStats',
        description: 'Get bridge usage statistics',
        action: 'Get bridge statistics',
      },
      {
        name: 'Get Fee Schedule',
        value: 'getFeeSchedule',
        description: 'Get current gas costs',
        action: 'Get fee schedule',
      },
      {
        name: 'Get Pending Transactions',
        value: 'getPendingTxs',
        description: 'Get mempool transactions',
        action: 'Get pending transactions',
      },
      {
        name: 'Get Rollup Status',
        value: 'getRollupStatus',
        description: 'Get current rollup block info',
        action: 'Get rollup status',
      },
    ],
    default: 'getRollupStatus',
  },
];

export const networkFields: INodeProperties[] = [
  // Get Pending Txs fields
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    description: 'Maximum number of pending transactions to return',
    displayOptions: {
      show: {
        resource: ['network'],
        operation: ['getPendingTxs'],
      },
    },
  },
  {
    displayName: 'Filter by Type',
    name: 'filterType',
    type: 'options',
    options: [
      {
        name: 'All',
        value: 'all',
      },
      {
        name: 'Transfers',
        value: 'transfer',
      },
      {
        name: 'Shield/Unshield',
        value: 'shieldUnshield',
      },
      {
        name: 'Swaps',
        value: 'swap',
      },
      {
        name: 'Bridge',
        value: 'bridge',
      },
      {
        name: 'Contract Calls',
        value: 'contractCall',
      },
    ],
    default: 'all',
    description: 'Filter pending transactions by type',
    displayOptions: {
      show: {
        resource: ['network'],
        operation: ['getPendingTxs'],
      },
    },
  },

  // Get Bridge Stats fields
  {
    displayName: 'Bridge ID',
    name: 'bridgeId',
    type: 'string',
    default: '',
    description: 'Specific bridge ID to get stats for (leave empty for all bridges)',
    displayOptions: {
      show: {
        resource: ['network'],
        operation: ['getBridgeStats'],
      },
    },
  },
  {
    displayName: 'Time Range',
    name: 'timeRange',
    type: 'options',
    options: [
      {
        name: '24 Hours',
        value: '24h',
      },
      {
        name: '7 Days',
        value: '7d',
      },
      {
        name: '30 Days',
        value: '30d',
      },
      {
        name: 'All Time',
        value: 'all',
      },
    ],
    default: '24h',
    description: 'Time range for statistics',
    displayOptions: {
      show: {
        resource: ['network'],
        operation: ['getBridgeStats'],
      },
    },
  },
];

export async function executeNetworkOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'getRollupStatus': {
      responseData = await aztecApiRequest.call(this, 'GET', '/v1/network/rollup/status');
      break;
    }

    case 'getFeeSchedule': {
      responseData = await aztecApiRequest.call(this, 'GET', '/v1/network/fees');
      break;
    }

    case 'getPendingTxs': {
      const limit = this.getNodeParameter('limit', i, 50) as number;
      const filterType = this.getNodeParameter('filterType', i, 'all') as string;

      const query: IDataObject = { limit };
      if (filterType !== 'all') query.type = filterType;

      responseData = await aztecApiRequest.call(this, 'GET', '/v1/network/pending', {}, query);
      break;
    }

    case 'getBridgeStats': {
      const bridgeId = this.getNodeParameter('bridgeId', i, '') as string;
      const timeRange = this.getNodeParameter('timeRange', i, '24h') as string;

      const query: IDataObject = { timeRange };
      let endpoint = '/v1/network/bridges/stats';

      if (bridgeId) {
        endpoint = `/v1/network/bridges/${bridgeId}/stats`;
      }

      responseData = await aztecApiRequest.call(this, 'GET', endpoint, {}, query);
      break;
    }
  }

  return responseData;
}
