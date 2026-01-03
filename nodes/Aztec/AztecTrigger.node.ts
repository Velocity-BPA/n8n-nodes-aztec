/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IPollFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';

import { LICENSING_NOTICE } from './constants/constants';
import { aztecApiRequest } from './transport/aztecClient';

// Log licensing notice once on load
let licensingNoticeLogged = false;

async function pollPrivateTransactions(
  pollFunctions: IPollFunctions,
  lastPollTime: string | undefined,
  maxResults: number,
): Promise<IDataObject[]> {
  const tokenAddress = pollFunctions.getNodeParameter('tokenAddress', '') as string;
  const minAmount = pollFunctions.getNodeParameter('minAmount', '') as string;

  const queryParams: IDataObject = {
    limit: maxResults,
    type: 'private',
  };

  if (lastPollTime) {
    queryParams.since = lastPollTime;
  }
  if (tokenAddress) {
    queryParams.token = tokenAddress;
  }
  if (minAmount) {
    queryParams.minAmount = minAmount;
  }

  const response = await aztecApiRequest.call(
    pollFunctions,
    'GET',
    '/transactions',
    {},
    queryParams,
  );

  const transactions = response.transactions || response.data || response;
  const txArray = Array.isArray(transactions) ? transactions : [];
  return txArray.map((tx: IDataObject) => ({
    ...tx,
    eventType: 'newPrivateTransaction',
    triggeredAt: new Date().toISOString(),
  }));
}

async function pollShieldUnshieldEvents(
  pollFunctions: IPollFunctions,
  lastPollTime: string | undefined,
  maxResults: number,
): Promise<IDataObject[]> {
  const shieldType = pollFunctions.getNodeParameter('shieldType', 'both') as string;
  const tokenAddress = pollFunctions.getNodeParameter('shieldTokenAddress', '') as string;

  const queryParams: IDataObject = {
    limit: maxResults,
  };

  if (lastPollTime) {
    queryParams.since = lastPollTime;
  }
  if (shieldType !== 'both') {
    queryParams.type = shieldType;
  }
  if (tokenAddress) {
    queryParams.token = tokenAddress;
  }

  const response = await aztecApiRequest.call(
    pollFunctions,
    'GET',
    '/events/shield',
    {},
    queryParams,
  );

  const events = response.events || response.data || response;
  const eventArray = Array.isArray(events) ? events : [];
  return eventArray.map((evt: IDataObject) => ({
    ...evt,
    eventType: 'shieldUnshieldEvent',
    triggeredAt: new Date().toISOString(),
  }));
}

async function pollNoteEvents(
  pollFunctions: IPollFunctions,
  lastPollTime: string | undefined,
  maxResults: number,
): Promise<IDataObject[]> {
  const noteType = pollFunctions.getNodeParameter('noteType', 'all') as string;

  const queryParams: IDataObject = {
    limit: maxResults,
    status: 'committed',
  };

  if (lastPollTime) {
    queryParams.since = lastPollTime;
  }
  if (noteType !== 'all') {
    queryParams.noteType = noteType;
  }

  const response = await aztecApiRequest.call(
    pollFunctions,
    'GET',
    '/notes',
    {},
    queryParams,
  );

  const notes = response.notes || response.data || response;
  const noteArray = Array.isArray(notes) ? notes : [];
  return noteArray.map((note: IDataObject) => ({
    ...note,
    eventType: 'noteReceived',
    triggeredAt: new Date().toISOString(),
  }));
}

async function pollRollupEvents(
  pollFunctions: IPollFunctions,
  lastPollTime: string | undefined,
  maxResults: number,
): Promise<IDataObject[]> {
  const includeTransactions = pollFunctions.getNodeParameter('includeTransactions', false) as boolean;

  const queryParams: IDataObject = {
    limit: maxResults,
  };

  if (lastPollTime) {
    queryParams.since = lastPollTime;
  }
  if (includeTransactions) {
    queryParams.includeTransactions = true;
  }

  const response = await aztecApiRequest.call(
    pollFunctions,
    'GET',
    '/rollups',
    {},
    queryParams,
  );

  const rollups = response.rollups || response.data || response;
  const rollupArray = Array.isArray(rollups) ? rollups : [];
  return rollupArray.map((rollup: IDataObject) => ({
    ...rollup,
    eventType: 'rollupPublished',
    triggeredAt: new Date().toISOString(),
  }));
}

async function pollBridgeEvents(
  pollFunctions: IPollFunctions,
  lastPollTime: string | undefined,
  maxResults: number,
): Promise<IDataObject[]> {
  const bridgeId = pollFunctions.getNodeParameter('bridgeId', '') as string;
  const bridgeStatus = pollFunctions.getNodeParameter('bridgeStatus', 'completed') as string;

  const queryParams: IDataObject = {
    limit: maxResults,
  };

  if (lastPollTime) {
    queryParams.since = lastPollTime;
  }
  if (bridgeId) {
    queryParams.bridgeId = bridgeId;
  }
  if (bridgeStatus !== 'all') {
    queryParams.status = bridgeStatus;
  }

  const response = await aztecApiRequest.call(
    pollFunctions,
    'GET',
    '/bridges/events',
    {},
    queryParams,
  );

  const events = response.events || response.data || response;
  const eventArray = Array.isArray(events) ? events : [];
  return eventArray.map((evt: IDataObject) => ({
    ...evt,
    eventType: 'bridgeCompletion',
    triggeredAt: new Date().toISOString(),
  }));
}

export class AztecTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Aztec Trigger',
    name: 'aztecTrigger',
    icon: 'file:aztec.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Triggers when Aztec Network events occur',
    defaults: {
      name: 'Aztec Trigger',
    },
    polling: true,
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'aztecApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Bridge Completion',
            value: 'bridgeCompletion',
            description: 'Trigger when a bridge action is completed',
          },
          {
            name: 'New Private Transaction',
            value: 'newPrivateTransaction',
            description: 'Trigger when a private transaction is confirmed',
          },
          {
            name: 'Note Received',
            value: 'noteReceived',
            description: 'Trigger when a new note is received',
          },
          {
            name: 'Rollup Published',
            value: 'rollupPublished',
            description: 'Trigger when a new rollup batch is published',
          },
          {
            name: 'Shield/Unshield Event',
            value: 'shieldUnshieldEvent',
            description: 'Trigger on privacy state changes (shield/unshield)',
          },
        ],
        default: 'newPrivateTransaction',
      },
      // Private Transaction options
      {
        displayName: 'Token Address',
        name: 'tokenAddress',
        type: 'string',
        default: '',
        placeholder: '0x...',
        description: 'Filter by specific token address (optional)',
        displayOptions: {
          show: {
            event: ['newPrivateTransaction'],
          },
        },
      },
      {
        displayName: 'Min Amount',
        name: 'minAmount',
        type: 'string',
        default: '',
        placeholder: '0.1',
        description: 'Minimum transaction amount to trigger (optional)',
        displayOptions: {
          show: {
            event: ['newPrivateTransaction'],
          },
        },
      },
      // Shield/Unshield options
      {
        displayName: 'Event Type',
        name: 'shieldType',
        type: 'options',
        options: [
          { name: 'Both', value: 'both' },
          { name: 'Shield Only', value: 'shield' },
          { name: 'Unshield Only', value: 'unshield' },
        ],
        default: 'both',
        description: 'Filter by shield or unshield events',
        displayOptions: {
          show: {
            event: ['shieldUnshieldEvent'],
          },
        },
      },
      {
        displayName: 'Token Address',
        name: 'shieldTokenAddress',
        type: 'string',
        default: '',
        placeholder: '0x...',
        description: 'Filter by specific token address (optional)',
        displayOptions: {
          show: {
            event: ['shieldUnshieldEvent'],
          },
        },
      },
      // Note options
      {
        displayName: 'Note Type',
        name: 'noteType',
        type: 'options',
        options: [
          { name: 'All Notes', value: 'all' },
          { name: 'Value Notes Only', value: 'value' },
          { name: 'Custom Notes Only', value: 'custom' },
        ],
        default: 'all',
        description: 'Filter by note type',
        displayOptions: {
          show: {
            event: ['noteReceived'],
          },
        },
      },
      // Rollup options
      {
        displayName: 'Include Transactions',
        name: 'includeTransactions',
        type: 'boolean',
        default: false,
        description: 'Whether to include full transaction details in rollup events',
        displayOptions: {
          show: {
            event: ['rollupPublished'],
          },
        },
      },
      // Bridge options
      {
        displayName: 'Bridge ID',
        name: 'bridgeId',
        type: 'string',
        default: '',
        placeholder: 'e.g., 1',
        description: 'Filter by specific bridge ID (optional)',
        displayOptions: {
          show: {
            event: ['bridgeCompletion'],
          },
        },
      },
      {
        displayName: 'Status Filter',
        name: 'bridgeStatus',
        type: 'options',
        options: [
          { name: 'All Statuses', value: 'all' },
          { name: 'Completed Only', value: 'completed' },
          { name: 'Failed Only', value: 'failed' },
        ],
        default: 'completed',
        description: 'Filter by bridge completion status',
        displayOptions: {
          show: {
            event: ['bridgeCompletion'],
          },
        },
      },
      // Common options
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Max Results',
            name: 'maxResults',
            type: 'number',
            default: 50,
            description: 'Maximum number of results per poll',
          },
        ],
      },
    ],
  };

  async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
    // Log licensing notice once
    if (!licensingNoticeLogged) {
      this.logger.warn(LICENSING_NOTICE);
      licensingNoticeLogged = true;
    }

    const event = this.getNodeParameter('event') as string;
    const options = this.getNodeParameter('options', {}) as IDataObject;
    const maxResults = (options.maxResults as number) || 50;

    // Get stored data for deduplication
    const webhookData = this.getWorkflowStaticData('node');
    const lastPollTime = webhookData.lastPollTime as string | undefined;
    const lastProcessedIds = (webhookData.lastProcessedIds as string[]) || [];

    const now = new Date().toISOString();
    let events: IDataObject[] = [];

    try {
      switch (event) {
        case 'newPrivateTransaction':
          events = await pollPrivateTransactions(this, lastPollTime, maxResults);
          break;
        case 'shieldUnshieldEvent':
          events = await pollShieldUnshieldEvents(this, lastPollTime, maxResults);
          break;
        case 'noteReceived':
          events = await pollNoteEvents(this, lastPollTime, maxResults);
          break;
        case 'rollupPublished':
          events = await pollRollupEvents(this, lastPollTime, maxResults);
          break;
        case 'bridgeCompletion':
          events = await pollBridgeEvents(this, lastPollTime, maxResults);
          break;
        default:
          throw new Error(`Unknown event type: ${event}`);
      }

      // Filter out already processed events
      const newEvents = events.filter((e) => {
        const id = (e.id as string) || (e.txHash as string) || (e.commitment as string) || '';
        return !lastProcessedIds.includes(id);
      });

      // Update webhook data
      webhookData.lastPollTime = now;
      webhookData.lastProcessedIds = newEvents
        .map((e) => (e.id as string) || (e.txHash as string) || (e.commitment as string) || '')
        .slice(0, 100); // Keep last 100 IDs

      if (newEvents.length === 0) {
        return null;
      }

      return [newEvents.map((e) => ({ json: e }))];
    } catch (error) {
      this.logger.error(`Aztec Trigger poll error: ${(error as Error).message}`);
      throw error;
    }
  }
}
