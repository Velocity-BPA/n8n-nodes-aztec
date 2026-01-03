/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { aztecApiRequest } from '../../transport/aztecClient';

export const noirContractsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['noirContracts'],
      },
    },
    options: [
      {
        name: 'Call Contract',
        value: 'callContract',
        description: 'Execute a contract function',
        action: 'Call contract function',
      },
      {
        name: 'Deploy Contract',
        value: 'deployContract',
        description: 'Upload a Noir contract',
        action: 'Deploy contract',
      },
      {
        name: 'Get Contract Events',
        value: 'getContractEvents',
        description: 'Get event logs from a contract',
        action: 'Get contract events',
      },
      {
        name: 'Get Contract State',
        value: 'getContractState',
        description: 'Read contract state',
        action: 'Get contract state',
      },
    ],
    default: 'getContractState',
  },
];

export const noirContractsFields: INodeProperties[] = [
  // Deploy Contract fields
  {
    displayName: 'Contract Bytecode',
    name: 'bytecode',
    type: 'string',
    default: '',
    description: 'The compiled Noir contract bytecode',
    displayOptions: {
      show: {
        resource: ['noirContracts'],
        operation: ['deployContract'],
      },
    },
    required: true,
  },
  {
    displayName: 'Constructor Arguments (JSON)',
    name: 'constructorArgs',
    type: 'json',
    default: '[]',
    description: 'JSON array of constructor arguments',
    displayOptions: {
      show: {
        resource: ['noirContracts'],
        operation: ['deployContract'],
      },
    },
  },
  {
    displayName: 'Salt',
    name: 'salt',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'Optional salt for deterministic deployment address',
    displayOptions: {
      show: {
        resource: ['noirContracts'],
        operation: ['deployContract'],
      },
    },
  },

  // Call Contract / Get State / Get Events fields
  {
    displayName: 'Contract Address',
    name: 'contractAddress',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'The deployed contract address',
    displayOptions: {
      show: {
        resource: ['noirContracts'],
        operation: ['callContract', 'getContractState', 'getContractEvents'],
      },
    },
    required: true,
  },

  // Call Contract fields
  {
    displayName: 'Function Name',
    name: 'functionName',
    type: 'string',
    default: '',
    description: 'The function name to call',
    displayOptions: {
      show: {
        resource: ['noirContracts'],
        operation: ['callContract'],
      },
    },
    required: true,
  },
  {
    displayName: 'Function Arguments (JSON)',
    name: 'functionArgs',
    type: 'json',
    default: '[]',
    description: 'JSON array of function arguments',
    displayOptions: {
      show: {
        resource: ['noirContracts'],
        operation: ['callContract'],
      },
    },
  },
  {
    displayName: 'Is Private',
    name: 'isPrivate',
    type: 'boolean',
    default: true,
    description: 'Whether this is a private function call',
    displayOptions: {
      show: {
        resource: ['noirContracts'],
        operation: ['callContract'],
      },
    },
  },
  {
    displayName: 'Simulate Only',
    name: 'simulateOnly',
    type: 'boolean',
    default: false,
    description: 'Whether to only simulate the call without executing',
    displayOptions: {
      show: {
        resource: ['noirContracts'],
        operation: ['callContract'],
      },
    },
  },

  // Get Contract State fields
  {
    displayName: 'Storage Slot',
    name: 'storageSlot',
    type: 'string',
    default: '',
    description: 'The storage slot to read',
    displayOptions: {
      show: {
        resource: ['noirContracts'],
        operation: ['getContractState'],
      },
    },
    required: true,
  },
  {
    displayName: 'Block Number',
    name: 'blockNumber',
    type: 'number',
    default: 0,
    description: 'Block number to read state at (0 for latest)',
    displayOptions: {
      show: {
        resource: ['noirContracts'],
        operation: ['getContractState'],
      },
    },
  },

  // Get Contract Events fields
  {
    displayName: 'Event Name',
    name: 'eventName',
    type: 'string',
    default: '',
    description: 'Filter by event name (leave empty for all events)',
    displayOptions: {
      show: {
        resource: ['noirContracts'],
        operation: ['getContractEvents'],
      },
    },
  },
  {
    displayName: 'From Block',
    name: 'fromBlock',
    type: 'number',
    default: 0,
    description: 'Start block for event query',
    displayOptions: {
      show: {
        resource: ['noirContracts'],
        operation: ['getContractEvents'],
      },
    },
  },
  {
    displayName: 'To Block',
    name: 'toBlock',
    type: 'number',
    default: 0,
    description: 'End block for event query (0 for latest)',
    displayOptions: {
      show: {
        resource: ['noirContracts'],
        operation: ['getContractEvents'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 100,
    description: 'Maximum number of events to return',
    displayOptions: {
      show: {
        resource: ['noirContracts'],
        operation: ['getContractEvents'],
      },
    },
  },
];

export async function executeNoirContractsOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'deployContract': {
      const bytecode = this.getNodeParameter('bytecode', i) as string;
      const constructorArgs = this.getNodeParameter('constructorArgs', i, []) as IDataObject[];
      const salt = this.getNodeParameter('salt', i, '') as string;

      const body: IDataObject = {
        bytecode,
        args: constructorArgs,
      };
      if (salt) body.salt = salt;

      responseData = await aztecApiRequest.call(this, 'POST', '/v1/contracts/deploy', body);
      break;
    }

    case 'callContract': {
      const contractAddress = this.getNodeParameter('contractAddress', i) as string;
      const functionName = this.getNodeParameter('functionName', i) as string;
      const functionArgs = this.getNodeParameter('functionArgs', i, []) as IDataObject[];
      const isPrivate = this.getNodeParameter('isPrivate', i, true) as boolean;
      const simulateOnly = this.getNodeParameter('simulateOnly', i, false) as boolean;

      responseData = await aztecApiRequest.call(this, 'POST', '/v1/contracts/call', {
        contractAddress,
        functionName,
        args: functionArgs,
        isPrivate,
        simulateOnly,
      });
      break;
    }

    case 'getContractState': {
      const contractAddress = this.getNodeParameter('contractAddress', i) as string;
      const storageSlot = this.getNodeParameter('storageSlot', i) as string;
      const blockNumber = this.getNodeParameter('blockNumber', i, 0) as number;

      const query: IDataObject = { slot: storageSlot };
      if (blockNumber > 0) query.blockNumber = blockNumber;

      responseData = await aztecApiRequest.call(
        this,
        'GET',
        `/v1/contracts/${contractAddress}/state`,
        {},
        query,
      );
      break;
    }

    case 'getContractEvents': {
      const contractAddress = this.getNodeParameter('contractAddress', i) as string;
      const eventName = this.getNodeParameter('eventName', i, '') as string;
      const fromBlock = this.getNodeParameter('fromBlock', i, 0) as number;
      const toBlock = this.getNodeParameter('toBlock', i, 0) as number;
      const limit = this.getNodeParameter('limit', i, 100) as number;

      const query: IDataObject = { limit };
      if (eventName) query.eventName = eventName;
      if (fromBlock > 0) query.fromBlock = fromBlock;
      if (toBlock > 0) query.toBlock = toBlock;

      responseData = await aztecApiRequest.call(
        this,
        'GET',
        `/v1/contracts/${contractAddress}/events`,
        {},
        query,
      );
      break;
    }
  }

  return responseData;
}
