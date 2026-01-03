/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { aztecApiRequest } from '../../transport/aztecClient';
import {
  deriveAztecKeys,
  generateMasterSecret,
  encryptNote,
  decryptNote,
} from '../../utils/crypto';

export const utilityOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['utility'],
      },
    },
    options: [
      {
        name: 'Decrypt Note',
        value: 'decryptNote',
        description: 'Reveal note data',
        action: 'Decrypt note',
      },
      {
        name: 'Derive Keys',
        value: 'deriveKeys',
        description: 'Generate key pairs from a secret',
        action: 'Derive keys',
      },
      {
        name: 'Encrypt Note',
        value: 'encryptNote',
        description: 'Hide note data',
        action: 'Encrypt note',
      },
      {
        name: 'Get API Health',
        value: 'getApiHealth',
        description: 'Check service status',
        action: 'Get API health',
      },
    ],
    default: 'getApiHealth',
  },
];

export const utilityFields: INodeProperties[] = [
  // Derive Keys fields
  {
    displayName: 'Master Secret',
    name: 'masterSecret',
    type: 'string',
    default: '',
    placeholder: '0x... (leave empty to generate)',
    description: 'Master secret to derive keys from (leave empty to generate new)',
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['deriveKeys'],
      },
    },
  },

  // Encrypt Note fields
  {
    displayName: 'Note Data',
    name: 'noteData',
    type: 'string',
    default: '',
    description: 'The note data to encrypt',
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['encryptNote'],
      },
    },
    required: true,
  },
  {
    displayName: 'Viewing Public Key',
    name: 'viewingPublicKey',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'Public viewing key of the recipient',
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['encryptNote'],
      },
    },
    required: true,
  },

  // Decrypt Note fields
  {
    displayName: 'Ciphertext',
    name: 'ciphertext',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'The encrypted note ciphertext',
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['decryptNote'],
      },
    },
    required: true,
  },
  {
    displayName: 'Ephemeral Public Key',
    name: 'ephemeralPublicKey',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'The ephemeral public key from encryption',
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['decryptNote'],
      },
    },
    required: true,
  },
  {
    displayName: 'Nonce',
    name: 'nonce',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'The nonce from encryption',
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['decryptNote'],
      },
    },
    required: true,
  },
  {
    displayName: 'Viewing Private Key',
    name: 'viewingPrivateKey',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'Private viewing key for decryption',
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['decryptNote'],
      },
    },
    required: true,
  },
];

export async function executeUtilityOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'deriveKeys': {
      let masterSecret = this.getNodeParameter('masterSecret', i, '') as string;

      if (!masterSecret) {
        masterSecret = generateMasterSecret();
      }

      const keys = deriveAztecKeys(masterSecret);

      responseData = {
        masterSecret,
        spendingKey: keys.spendingKey,
        viewingKey: keys.viewingKey,
        nullifierKey: keys.nullifierKey,
      };
      break;
    }

    case 'encryptNote': {
      const noteData = this.getNodeParameter('noteData', i) as string;
      const viewingPublicKey = this.getNodeParameter('viewingPublicKey', i) as string;

      const encrypted = encryptNote(noteData, viewingPublicKey);

      responseData = {
        ciphertext: encrypted.ciphertext,
        ephemeralPublicKey: encrypted.ephemeralPublicKey,
        nonce: encrypted.nonce,
      };
      break;
    }

    case 'decryptNote': {
      const ciphertext = this.getNodeParameter('ciphertext', i) as string;
      const ephemeralPublicKey = this.getNodeParameter('ephemeralPublicKey', i) as string;
      const nonce = this.getNodeParameter('nonce', i) as string;
      const viewingPrivateKey = this.getNodeParameter('viewingPrivateKey', i) as string;

      const decrypted = decryptNote(
        {
          ciphertext,
          ephemeralPublicKey,
          nonce,
        },
        viewingPrivateKey,
      );

      responseData = {
        noteData: decrypted,
      };
      break;
    }

    case 'getApiHealth': {
      responseData = await aztecApiRequest.call(this, 'GET', '/health');
      break;
    }
  }

  return responseData;
}
