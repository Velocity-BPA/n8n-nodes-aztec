/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { aztecApiRequest } from '../../transport/aztecClient';

export const proofsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['proofs'],
      },
    },
    options: [
      {
        name: 'Generate Proof',
        value: 'generateProof',
        description: 'Create a ZK proof',
        action: 'Generate ZK proof',
      },
      {
        name: 'Get Proof Size',
        value: 'getProofSize',
        description: 'Get proof data size',
        action: 'Get proof size',
      },
      {
        name: 'Get Proof Status',
        value: 'getProofStatus',
        description: 'Check proof generation status',
        action: 'Get proof status',
      },
      {
        name: 'Verify Proof',
        value: 'verifyProof',
        description: 'Validate a ZK proof',
        action: 'Verify ZK proof',
      },
    ],
    default: 'getProofStatus',
  },
];

export const proofsFields: INodeProperties[] = [
  // Generate Proof fields
  {
    displayName: 'Proof Type',
    name: 'proofType',
    type: 'options',
    options: [
      {
        name: 'Transfer',
        value: 'transfer',
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
      {
        name: 'Custom',
        value: 'custom',
      },
    ],
    default: 'transfer',
    description: 'Type of proof to generate',
    displayOptions: {
      show: {
        resource: ['proofs'],
        operation: ['generateProof'],
      },
    },
  },
  {
    displayName: 'Proof Inputs (JSON)',
    name: 'proofInputs',
    type: 'json',
    default: '{}',
    description: 'JSON object containing proof inputs',
    displayOptions: {
      show: {
        resource: ['proofs'],
        operation: ['generateProof'],
      },
    },
    required: true,
  },
  {
    displayName: 'Async',
    name: 'async',
    type: 'boolean',
    default: true,
    description: 'Whether to generate proof asynchronously',
    displayOptions: {
      show: {
        resource: ['proofs'],
        operation: ['generateProof'],
      },
    },
  },

  // Get Proof Status / Size / Verify fields
  {
    displayName: 'Proof ID',
    name: 'proofId',
    type: 'string',
    default: '',
    description: 'The proof identifier',
    displayOptions: {
      show: {
        resource: ['proofs'],
        operation: ['getProofStatus', 'getProofSize'],
      },
    },
    required: true,
  },

  // Verify Proof fields
  {
    displayName: 'Proof Data',
    name: 'proofData',
    type: 'string',
    default: '',
    description: 'The proof data to verify',
    displayOptions: {
      show: {
        resource: ['proofs'],
        operation: ['verifyProof'],
      },
    },
    required: true,
  },
  {
    displayName: 'Public Inputs (JSON)',
    name: 'publicInputs',
    type: 'json',
    default: '[]',
    description: 'Array of public inputs for verification',
    displayOptions: {
      show: {
        resource: ['proofs'],
        operation: ['verifyProof'],
      },
    },
    required: true,
  },
  {
    displayName: 'Verifier Type',
    name: 'verifierType',
    type: 'options',
    options: [
      {
        name: 'Standard',
        value: 'standard',
      },
      {
        name: 'Recursive',
        value: 'recursive',
      },
      {
        name: 'Aggregated',
        value: 'aggregated',
      },
    ],
    default: 'standard',
    description: 'Type of verifier to use',
    displayOptions: {
      show: {
        resource: ['proofs'],
        operation: ['verifyProof'],
      },
    },
  },
];

export async function executeProofsOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'generateProof': {
      const proofType = this.getNodeParameter('proofType', i) as string;
      const proofInputs = this.getNodeParameter('proofInputs', i) as IDataObject;
      const async = this.getNodeParameter('async', i, true) as boolean;

      responseData = await aztecApiRequest.call(this, 'POST', '/v1/proofs/generate', {
        type: proofType,
        inputs: proofInputs,
        async,
      });
      break;
    }

    case 'verifyProof': {
      const proofData = this.getNodeParameter('proofData', i) as string;
      const publicInputs = this.getNodeParameter('publicInputs', i) as string[];
      const verifierType = this.getNodeParameter('verifierType', i, 'standard') as string;

      responseData = await aztecApiRequest.call(this, 'POST', '/v1/proofs/verify', {
        proofData,
        publicInputs,
        verifierType,
      });
      break;
    }

    case 'getProofStatus': {
      const proofId = this.getNodeParameter('proofId', i) as string;
      responseData = await aztecApiRequest.call(this, 'GET', `/v1/proofs/${proofId}/status`);
      break;
    }

    case 'getProofSize': {
      const proofId = this.getNodeParameter('proofId', i) as string;
      responseData = await aztecApiRequest.call(this, 'GET', `/v1/proofs/${proofId}/size`);
      break;
    }
  }

  return responseData;
}
