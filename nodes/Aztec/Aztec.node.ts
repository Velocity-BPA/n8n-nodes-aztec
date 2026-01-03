/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

import { LICENSING_NOTICE } from './constants/constants';
import {
  accountsOperations,
  accountsFields,
  executeAccountsOperation,
  privateTokensOperations,
  privateTokensFields,
  executePrivateTokensOperation,
  publicTokensOperations,
  publicTokensFields,
  executePublicTokensOperation,
  notesOperations,
  notesFields,
  executeNotesOperation,
  transactionsOperations,
  transactionsFields,
  executeTransactionsOperation,
  privateDeFiOperations,
  privateDeFiFields,
  executePrivateDeFiOperation,
  proofsOperations,
  proofsFields,
  executeProofsOperation,
  networkOperations,
  networkFields,
  executeNetworkOperation,
  bridgesOperations,
  bridgesFields,
  executeBridgesOperation,
  noirContractsOperations,
  noirContractsFields,
  executeNoirContractsOperation,
  utilityOperations,
  utilityFields,
  executeUtilityOperation,
} from './actions';

// Log licensing notice once on load
let licensingNoticeLogged = false;

export class Aztec implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Aztec',
    name: 'aztec',
    icon: 'file:aztec.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Aztec Network - Privacy-focused L2 for Ethereum with ZK proofs',
    defaults: {
      name: 'Aztec',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'aztecApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Account',
            value: 'accounts',
            description: 'Manage Aztec accounts',
          },
          {
            name: 'Bridge',
            value: 'bridges',
            description: 'Aztec Connect bridge operations',
          },
          {
            name: 'Network',
            value: 'network',
            description: 'Network status and information',
          },
          {
            name: 'Noir Contract',
            value: 'noirContracts',
            description: 'Deploy and interact with Noir contracts',
          },
          {
            name: 'Note',
            value: 'notes',
            description: 'Manage private notes',
          },
          {
            name: 'Private DeFi',
            value: 'privateDeFi',
            description: 'Private DeFi operations',
          },
          {
            name: 'Private Token',
            value: 'privateTokens',
            description: 'Private token operations',
          },
          {
            name: 'Proof',
            value: 'proofs',
            description: 'ZK proof operations',
          },
          {
            name: 'Public Token',
            value: 'publicTokens',
            description: 'Public token operations',
          },
          {
            name: 'Transaction',
            value: 'transactions',
            description: 'Transaction management',
          },
          {
            name: 'Utility',
            value: 'utility',
            description: 'Utility functions',
          },
        ],
        default: 'accounts',
      },
      // Operations for each resource
      ...accountsOperations,
      ...privateTokensOperations,
      ...publicTokensOperations,
      ...notesOperations,
      ...transactionsOperations,
      ...privateDeFiOperations,
      ...proofsOperations,
      ...networkOperations,
      ...bridgesOperations,
      ...noirContractsOperations,
      ...utilityOperations,
      // Fields for each resource
      ...accountsFields,
      ...privateTokensFields,
      ...publicTokensFields,
      ...notesFields,
      ...transactionsFields,
      ...privateDeFiFields,
      ...proofsFields,
      ...networkFields,
      ...bridgesFields,
      ...noirContractsFields,
      ...utilityFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Log licensing notice once
    if (!licensingNoticeLogged) {
      this.logger.warn(LICENSING_NOTICE);
      licensingNoticeLogged = true;
    }

    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData;

        switch (resource) {
          case 'accounts':
            responseData = await executeAccountsOperation.call(this, operation, i);
            break;
          case 'privateTokens':
            responseData = await executePrivateTokensOperation.call(this, operation, i);
            break;
          case 'publicTokens':
            responseData = await executePublicTokensOperation.call(this, operation, i);
            break;
          case 'notes':
            responseData = await executeNotesOperation.call(this, operation, i);
            break;
          case 'transactions':
            responseData = await executeTransactionsOperation.call(this, operation, i);
            break;
          case 'privateDeFi':
            responseData = await executePrivateDeFiOperation.call(this, operation, i);
            break;
          case 'proofs':
            responseData = await executeProofsOperation.call(this, operation, i);
            break;
          case 'network':
            responseData = await executeNetworkOperation.call(this, operation, i);
            break;
          case 'bridges':
            responseData = await executeBridgesOperation.call(this, operation, i);
            break;
          case 'noirContracts':
            responseData = await executeNoirContractsOperation.call(this, operation, i);
            break;
          case 'utility':
            responseData = await executeUtilityOperation.call(this, operation, i);
            break;
          default:
            throw new Error(`Unknown resource: ${resource}`);
        }

        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(responseData),
          { itemData: { item: i } },
        );

        returnData.push(...executionData);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
