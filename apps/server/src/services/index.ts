import { BridgeService } from './bridgeService';
import { AptosService } from './aptosService';
import { WormholeService } from './wormholeService';

// Create service instances
export const aptosService = new AptosService();
export const wormholeService = new WormholeService();
export const bridgeService = new BridgeService();

// Re-export classes for testing
export { BridgeService, AptosService, WormholeService };
