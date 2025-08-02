import { BridgeService } from './bridgeService';
import { AptosService } from './aptosService';
import { WormholeService } from './wormholeService';
import { AIService } from './aiService';

// Create service instances
export const aptosService = new AptosService();
export const wormholeService = new WormholeService();
export const bridgeService = new BridgeService();
export const aiService = new AIService();

// Re-export classes for testing
export { BridgeService, AptosService, WormholeService, AIService };
