/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { aztecApiRequest } from '../../transport/aztecClient';
import { deriveAztecKeys, generateMasterSecret, deriveAccountAddress } from '../../utils/crypto';

export const accountsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['accounts'],
      },
    },
    options: [
      {
        name: 'Create Account',
        value: 'createAccount',
        description: 'Create a new Aztec account',
        action: 'Create a new Aztec account',
      },
      {
        name: 'Get Account Aliases',
        value: 'getAccountAliases',
        description: 'Get named accounts',
        action: 'Get account aliases',
      },
      {
        name: 'Get Account Info',
        value: 'getAccountInfo',
        description: 'Get account details',
        action: 'Get account information',
      },
      {
        name: 'Get Account Keys',
        value: 'getAccountKeys',
        description: 'Get derived keys for an account',
        action: 'Get account keys',
      },
      {
        name: 'Recover Account',
        value: 'recoverAccount',
        description: 'Recover an account from a viewing key',
        action: 'Recover an account',
      },
      {
        name: 'Register Account',
        value: 'registerAccount',
        description: 'Register an account on-chain',
        action: 'Register an account on-chain',
      },
    ],
    default: 'getAccountInfo',
  },
];

export const accountsFields: INodeProperties[] = [
  // Create Account fields
  {
    displayName: 'Alias',
    name: 'alias',
    type: 'string',
    default: '',
    description: 'Optional alias for the account',
    displayOptions: {
      show: {
        resource: ['accounts'],
        operation: ['createAccount'],
      },
    },
  },
  {
    displayName: 'Recovery Key',
    name: 'recoveryKey',
    type: 'string',
    default: '',
    description: 'Optional recovery key for the account',
    displayOptions: {
      show: {
        resource: ['accounts'],
        operation: ['createAccount'],
      },
    },
  },

  // Get Account Info fields
  {
    displayName: 'Account Address',
    name: 'accountAddress',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'The Aztec account address',
    displayOptions: {
      show: {
        resource: ['accounts'],
        operation: ['getAccountInfo', 'getAccountKeys', 'registerAccount'],
      },
    },
    required: true,
  },

  // Recover Account fields
  {
    displayName: 'Viewing Key',
    name: 'viewingKeyRecover',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'The viewing key to recover the account from',
    displayOptions: {
      show: {
        resource: ['accounts'],
        operation: ['recoverAccount'],
      },
    },
    required: true,
  },
  {
    displayName: 'Scan From Block',
    name: 'scanFromBlock',
    type: 'number',
    default: 0,
    description: 'Block number to start scanning from',
    displayOptions: {
      show: {
        resource: ['accounts'],
        operation: ['recoverAccount'],
      },
    },
  },
];

export async function executeAccountsOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'createAccount': {
      const alias = this.getNodeParameter('alias', i, '') as string;
      const recoveryKey = this.getNodeParameter('recoveryKey', i, '') as string;

      // Generate master secret and derive keys
      const masterSecret = generateMasterSecret();
      const keys = deriveAztecKeys(masterSecret);

      // Derive partial address
      const partialAddress = generateMasterSecret();
      const accountAddress = deriveAccountAddress(
        keys.spendingKey.publicKey,
        keys.viewingKey.publicKey,
        partialAddress,
      );

      // Register with API
      const body: IDataObject = {
        spendingPublicKey: keys.spendingKey.publicKey,
        viewingPublicKey: keys.viewingKey.publicKey,
        partialAddress,
      };

      if (alias) body.alias = alias;
      if (recoveryKey) body.recoveryKey = recoveryKey;

      const apiResponse = await aztecApiRequest.call(this, 'POST', '/v1/accounts', body);

      responseData = {
        address: accountAddress,
        spendingKey: keys.spendingKey,
        viewingKey: keys.viewingKey,
        nullifierKey: keys.nullifierKey,
        partialAddress,
        masterSecret,
        alias,
        apiResponse,
      };
      break;
    }

    case 'getAccountInfo': {
      const accountAddress = this.getNodeParameter('accountAddress', i) as string;
      responseData = await aztecApiRequest.call(this, 'GET', `/v1/accounts/${accountAddress}`);
      break;
    }

    case 'getAccountKeys': {
      const accountAddress = this.getNodeParameter('accountAddress', i) as string;
      responseData = await aztecApiRequest.call(this, 'GET', `/v1/accounts/${accountAddress}/keys`);
      break;
    }

    case 'registerAccount': {
      const accountAddress = this.getNodeParameter('accountAddress', i) as string;
      responseData = await aztecApiRequest.call(
        this,
        'POST',
        `/v1/accounts/${accountAddress}/register`,
      );
      break;
    }

    case 'getAccountAliases': {
      responseData = await aztecApiRequest.call(this, 'GET', '/v1/accounts/aliases');
      break;
    }

    case 'recoverAccount': {
      const viewingKey = this.getNodeParameter('viewingKeyRecover', i) as string;
      const scanFromBlock = this.getNodeParameter('scanFromBlock', i, 0) as number;

      responseData = await aztecApiRequest.call(this, 'POST', '/v1/accounts/recover', {
        viewingKey,
        scanFromBlock,
      });
      break;
    }
  }

  return responseData;
}
