import { createBlockQueue, scanBlocks } from "./monitor-logic";
import { EthereumMonitorDao, MonitorConfig, SingleTransactionBlockClient } from "./ethereum-explorer";
import { EmptyProfiler, Profiler } from "./utility";
import { blockchain } from "vineyard-blockchain"
import { flatMap } from "./utility/index";
import { AddressMap, getOrCreateAddresses, saveBlocks, saveSingleTransactions } from "./database-functions";
import { BlockBundle } from "../../vineyard-ethereum/src";

function gatherAddresses(blockBundle: BlockBundle<blockchain.block, blockchain.Transactions>) {
  const blocks = blockBundle.block
  const addresses: AddressMap = {}
  for (let block of blocks) {
    for (let transaction of block.transactions) {
      if (transaction.to)
        addresses [transaction.to] = -1

      if (transaction.from)
        addresses [transaction.from] = -1
    }
  }

  return addresses
}

async function saveFullBlocks(dao: EthereumMonitorDao, BlockBundle: BlockBundle<blockchain.block, blockchain.Transaction[]>): Promise<void> {
  const blocks = BlockBundle.blocks
  const ground = dao.ground
  const transactions = flatMap(BlockBundle.transactions, b => b.transactions)
  const addresses = gatherAddresses(blocks)
  const lastBlockIndex = blocks.sort((a, b) => b.index - a.index)[0].index

  await Promise.all([
      saveBlocks(ground, blocks),
      dao.lastBlockDao.setLastBlock(lastBlockIndex),
      getOrCreateAddresses(dao.ground, add
        .then(() => saveSingleTransactions(ground, transactions, addresses))
    ]
  )

  console.log('Saved blocks; count', blocks.length, 'last', lastBlockIndex)
}

export async function scanMiniBlocks(dao: EthereumMonitorDao,
                                     client: SingleTransactionBlockClient,
                                     config: MonitorConfig,
                                     profiler: Profiler = new EmptyProfiler()): Promise<any> {

  const blockQueue = await createBlockQueue(dao.lastBlockDao, client, config.queue, config.minConfirmations, -1) // TODO: Set this to something that works
  const saver = (BlockBundle: BlockBundle<blockchain.block, blockchain.Transaction[]>) => saveFullBlocks(dao, BlockBundle.block)
  return scanBlocks(blockQueue, saver, dao.ground, dao.lastBlockDao, config, profiler)
}