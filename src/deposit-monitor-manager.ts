import { Collection } from 'vineyard-ground'
import { blockchain } from "vineyard-blockchain"
import { Currency, DepositTransaction, LastBlock } from "./types";
import { Omit } from "./schema/index"

export interface DepositMonitorManagerModel {
  LastBlock: Collection<LastBlock>
  Transaction: Collection<DepositTransaction>
  ground: any
}

export class DepositMonitorManager {
  public model: DepositMonitorManagerModel
  public currency: Currency

  constructor(model: DepositMonitorManagerModel, currency: Currency) {
    this.model = model
    this.currency = currency
  }

  public async getTransactionByTxid(txid: string): Promise<DepositTransaction | undefined> {
    return this.model.Transaction.first({ txid: txid, currency: this.currency.id }).exec()
  }

  public async saveTransaction(transaction: Omit<DepositTransaction, 'id'>): Promise<DepositTransaction> {
    return this.model.Transaction.create(transaction)
  }

  public async setTransactionStatus(transaction: DepositTransaction, status: blockchain.TransactionStatus): Promise<DepositTransaction> {
    return this.model.Transaction.update(transaction, { status: status })
  }

  public async listPending(maxBlockIndex: number): Promise<DepositTransaction[]> {
    const sql = `
    SELECT transactions.* FROM transactions
    WHERE status = 0 
    AND transactions.currency = :currency
    AND transactions."blockIndex" < :maxBlockIndex`

    return this.model.ground.query(sql, {
      maxBlockIndex: maxBlockIndex,
      currency: this.currency.id
    })
  }

  public async getLastBlock(): Promise<LastBlock | undefined> {
    const last = await this.model.LastBlock.first({ currency: this.currency.id }).exec()
    if (!last) {
      return
    }
    return last
  }

  public async setLastBlock(block: LastBlock) {
    const currentLastBlock = await this.getLastBlock()
    if (currentLastBlock) {
      return await this.model.LastBlock.update(currentLastBlock.currency, block)
    } else {
      return await this.model.LastBlock.create(block)
    }
  }
}

export type SingleTransactionBlockchainModel = DepositMonitorManager