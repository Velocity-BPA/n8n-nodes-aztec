/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  IPollFunctions,
  IDataObject,
  IHttpRequestMethods,
  IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import type { IAztecApiResponse } from '../utils/types';

const NETWORK_ENDPOINTS: Record<string, string> = {
  mainnet: 'https://aztec-mainnet.example.com',
  testnet: 'https://aztec-testnet.example.com',
};

export interface IAztecApiCredentials {
  network: string;
  rpcEndpoint?: string;
  accountType: string;
  spendingKey?: string;
  viewingKey?: string;
  accountAddress?: string;
}

export function getEndpoint(credentials: IAztecApiCredentials): string {
  if (credentials.network === 'custom' && credentials.rpcEndpoint) {
    return credentials.rpcEndpoint.replace(/\/$/, '');
  }
  return NETWORK_ENDPOINTS[credentials.network] || NETWORK_ENDPOINTS.testnet;
}

export async function aztecApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  query: IDataObject = {},
  headers: IDataObject = {},
): Promise<IDataObject> {
  const credentials = (await this.getCredentials('aztecApi')) as IAztecApiCredentials;
  const baseUrl = getEndpoint(credentials);

  const options: IHttpRequestOptions = {
    method,
    url: `${baseUrl}${endpoint}`,
    body,
    qs: query,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    json: true,
  };

  // Add authentication headers if we have keys
  if (credentials.accountAddress) {
    options.headers = {
      ...options.headers,
      'X-Aztec-Account': credentials.accountAddress,
    };
  }

  if (credentials.accountType === 'spending' && credentials.spendingKey) {
    options.headers = {
      ...options.headers,
      'X-Aztec-Key-Type': 'spending',
    };
  } else if (credentials.accountType === 'viewing' && credentials.viewingKey) {
    options.headers = {
      ...options.headers,
      'X-Aztec-Key-Type': 'viewing',
    };
  }

  // Remove empty body for GET requests
  if (method === 'GET') {
    delete options.body;
  }

  // Remove empty query params
  if (Object.keys(query).length === 0) {
    delete options.qs;
  }

  try {
    const response = await this.helpers.httpRequest(options);
    return response as IDataObject;
  } catch (error) {
    const err = error as Error;
    throw new NodeApiError(this.getNode(), {
      message: err.message,
      description: `Aztec API request failed: ${err.message}`,
    });
  }
}

export async function aztecApiRequestAllItems(
  this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  query: IDataObject = {},
  propertyName: string = 'items',
): Promise<IDataObject[]> {
  const returnData: IDataObject[] = [];
  let responseData: IDataObject;
  let page = 1;
  const pageSize = 100;

  do {
    query.page = page;
    query.pageSize = pageSize;
    responseData = await aztecApiRequest.call(this, method, endpoint, body, query);

    const items = responseData[propertyName] as IDataObject[];
    if (items && Array.isArray(items)) {
      returnData.push(...items);
    }

    page++;
  } while (responseData.hasMore === true);

  return returnData;
}

export function handleApiResponse<T>(response: IAztecApiResponse<T>): T {
  if (!response.success && response.error) {
    throw new Error(`API Error [${response.error.code}]: ${response.error.message}`);
  }
  return response.data as T;
}

export function buildQueryParams(params: IDataObject): IDataObject {
  const query: IDataObject = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query[key] = value;
    }
  }
  return query;
}

export function formatHexString(value: string): string {
  if (!value) return '';
  return value.startsWith('0x') ? value : `0x${value}`;
}

export function parseHexString(value: string): string {
  if (!value) return '';
  return value.startsWith('0x') ? value.slice(2) : value;
}

export function validateAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}

export function validateKey(key: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(key);
}

export function weiToEth(wei: string): string {
  const weiStr = wei.padStart(19, '0');
  const decimalPos = weiStr.length - 18;
  const integerPart = weiStr.slice(0, decimalPos) || '0';
  const decimalPart = weiStr.slice(decimalPos);
  
  // Remove trailing zeros and unnecessary decimal point
  const trimmedDecimal = decimalPart.replace(/0+$/, '');
  if (trimmedDecimal === '') {
    return integerPart.replace(/^0+/, '') || '0';
  }
  return (integerPart.replace(/^0+/, '') || '0') + '.' + trimmedDecimal;
}

export function ethToWei(eth: string): string {
  const ethNum = parseFloat(eth);
  const weiNum = BigInt(Math.floor(ethNum * 1e18));
  return weiNum.toString();
}
