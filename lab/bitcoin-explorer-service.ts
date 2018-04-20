import { createVillage, MinotaurVillage } from "./village";
import { MonitorConfig, scanBitcoinExplorerBlocks } from "../src"
import { SimpleProfiler } from "../src/utility"
import { FullConfig } from "./config-types";
import { getBitcoinExplorerSchema } from "../src/schema";
import { BitcoinModel, createBitcoinExplorerDao } from "../src/bitcoin-explorer/bitcoin-model"
import { MultiTransactionBlockClient } from "../src/bitcoin-explorer/bitcoin-explorer"

export type BitcoinVillage = MinotaurVillage<BitcoinModel> & { client: MultiTransactionBlockClient }

export async function startBitcoinMonitor(village: BitcoinVillage, config: MonitorConfig) {
  try {
    const { model, client } = village

    const dao = createBitcoinExplorerDao(model)
    console.log('Starting cron')
    const profiler = new SimpleProfiler()
    await scanBitcoinExplorerBlocks(dao, client, config, profiler)
    profiler.logFlat()
  }
  catch (error) {
    console.error(error)
  }
}

export async function createBitcoinVillage(config: FullConfig, client: MultiTransactionBlockClient): Promise<BitcoinVillage> {
  const minotaurVillage = await createVillage<BitcoinModel>(getBitcoinExplorerSchema(), config)
  return { ...minotaurVillage, client }
}