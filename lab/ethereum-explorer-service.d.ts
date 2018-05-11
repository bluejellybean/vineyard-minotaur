import { MinotaurVillage } from "./village";
import { EthereumModel, OptionalMonitorConfig } from "../src";
import { EthereumConfig } from "./config-types";
export declare type EthereumVillage = MinotaurVillage<EthereumModel, EthereumConfig>;
export declare function startEthereumMonitor(village: EthereumVillage, config: OptionalMonitorConfig): Promise<void>;
export declare function createEthereumVillage(config: EthereumConfig): Promise<EthereumVillage>;
