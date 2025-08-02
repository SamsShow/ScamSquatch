import { AptosClient, AptosAccount, CoinClient, Types, MaybeHexString } from 'aptos';
import { APIError } from '../utils/errorHandler';
import pino from 'pino';

const logger = pino({
  name: 'aptos-service',
  level: process.env.LOG_LEVEL || 'info'
});

export interface AptosTransaction {
  hash: string;
  sender: string;
  sequence_number: string;
  max_gas_amount: string;
  gas_unit_price: string;
  expiration_timestamp_secs: string;
  payload: Types.EntryFunctionPayload;
}

export class AptosService {
  private client: AptosClient;
  private coinClient: CoinClient;
  
  constructor() {
    this.client = new AptosClient(process.env.APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com');
    this.coinClient = new CoinClient(this.client);
  }

  async getBalance(address: string, coinType = '0x1::aptos_coin::AptosCoin'): Promise<string> {
    try {
      const balance = await this.coinClient.checkBalance(address, { coinType });
      return balance.toString();
    } catch (error) {
      logger.error('Failed to get Aptos balance:', error);
      throw new APIError(500, 'Failed to get Aptos balance');
    }
  }

  async validateAddress(address: string): Promise<boolean> {
    try {
      // Basic validation - should be 0x followed by 64 hex chars
      if (!/^0x[a-fA-F0-9]{64}$/.test(address)) {
        return false;
      }
      
      // Try to get account info to verify it exists
      await this.client.getAccount(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  async estimateGasFee(): Promise<string> {
    try {
      const estimate = await this.client.estimateGasPrice();
      return estimate.gas_estimate.toString();
    } catch (error) {
      logger.error('Failed to estimate Aptos gas fee:', error);
      throw new APIError(500, 'Failed to estimate Aptos gas fee');
    }
  }

  async submitTransaction(
    senderAccount: AptosAccount,
    payload: Types.EntryFunctionPayload
  ): Promise<AptosTransaction> {
    try {
      const txnRequest = await this.client.generateTransaction(senderAccount.address(), payload);
      const signedTxn = await this.client.signTransaction(senderAccount, txnRequest);
      const response = await this.client.submitTransaction(signedTxn);
      
      await this.client.waitForTransaction(response.hash);
      
      return {
        hash: response.hash,
        sender: senderAccount.address().toString(),
        sequence_number: txnRequest.sequence_number.toString(),
        max_gas_amount: txnRequest.max_gas_amount.toString(),
        gas_unit_price: txnRequest.gas_unit_price.toString(),
        expiration_timestamp_secs: txnRequest.expiration_timestamp_secs.toString(),
        payload
      };
    } catch (error) {
      logger.error('Failed to submit Aptos transaction:', error);
      throw new APIError(500, 'Failed to submit Aptos transaction');
    }
  }
}
