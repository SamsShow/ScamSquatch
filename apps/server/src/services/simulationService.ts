import { ethers } from 'ethers';
import type { RouteInfo } from './oneInchService';

export interface SimulationResult {
  success: boolean;
  error?: string;
  data?: {
    simulation: {
      success: boolean;
      gasUsed: string;
      gasLimit: string;
      gasPrice: string;
      totalCost: string;
      error?: string;
    };
    approval: {
      required: boolean;
      currentAllowance: string;
      requiredAllowance: string;
      approvalGas: string;
      approvalCost: string;
    };
    security: {
      tokenDrainRisk: boolean;
      suspiciousPatterns: string[];
      warnings: string[];
      recommendations: string[];
    };
    preview: {
      inputAmount: string;
      outputAmount: string;
      priceImpact: number;
      slippage: number;
      fees: {
        protocol: string;
        gas: string;
        total: string;
      };
    };
  };
}

export interface ApprovalCheck {
  required: boolean;
  currentAllowance: string;
  requiredAllowance: string;
  approvalGas: string;
  approvalCost: string;
  spenderAddress: string;
}

export interface TokenDrainAnalysis {
  risk: boolean;
  patterns: string[];
  warnings: string[];
  recommendations: string[];
}

// Known drain patterns
const DRAIN_PATTERNS = [
  'infinite_approval',
  'max_uint256_approval',
  'high_fee_transfer',
  'suspicious_contract',
  'proxy_contract',
  'upgradeable_contract',
  'admin_functions',
  'emergency_functions',
  'blacklist_functions',
  'pause_functions',
];

// Suspicious function signatures
const SUSPICIOUS_FUNCTIONS = [
  '0x23b872dd', // transferFrom
  '0xa9059cbb', // transfer
  '0x095ea7b3', // approve
  '0x40c10f19', // mint
  '0x42966c68', // burn
  '0x8456cb59', // pause
  '0x3f4ba83a', // unpause
  '0x8da5cb5b', // owner
  '0x715018a6', // renounceOwnership
  '0xf2fde38b', // transferOwnership
];

class SimulationService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    // Initialize provider for Sepolia testnet
    this.provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo');
  }

  // Main simulation method
  async simulateTransaction(params: {
    route: RouteInfo;
    userAddress: string;
    fromAmount: string;
    toAmount: string;
    slippage: number;
  }): Promise<SimulationResult> {
    try {
      console.log('🔍 Simulating transaction:', {
        routeId: params.route.id,
        userAddress: params.userAddress.substring(0, 10) + '...',
        fromAmount: params.fromAmount,
        toAmount: params.toAmount,
      });

      // Step 1: Check approval requirements
      const approvalCheck = await this.checkApproval({
        tokenAddress: params.route.fromToken.address,
        spenderAddress: this.getSpenderAddress(params.route),
        amount: params.fromAmount,
        userAddress: params.userAddress,
      });

      // Step 2: Analyze token drain risk
      const drainAnalysis = await this.analyzeTokenDrain({
        tokenAddress: params.route.fromToken.address,
        toTokenAddress: params.route.toToken.address,
        route: params.route,
      });

      // Step 3: Simulate the transaction
      const simulation = await this.simulateSwap({
        route: params.route,
        userAddress: params.userAddress,
        fromAmount: params.fromAmount,
        toAmount: params.toAmount,
        slippage: params.slippage,
      });

      // Step 4: Calculate preview data
      const preview = this.calculatePreview({
        route: params.route,
        fromAmount: params.fromAmount,
        toAmount: params.toAmount,
        simulation,
        approvalCheck,
      });

      return {
        success: true,
        data: {
          simulation,
          approval: approvalCheck,
          security: {
            tokenDrainRisk: drainAnalysis.risk,
            suspiciousPatterns: drainAnalysis.patterns,
            warnings: drainAnalysis.warnings,
            recommendations: drainAnalysis.recommendations,
          },
          preview,
        },
      };
    } catch (error) {
      console.error('❌ Simulation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Simulation failed',
      };
    }
  }

  // Check if approval is required
  private async checkApproval(params: {
    tokenAddress: string;
    spenderAddress: string;
    amount: string;
    userAddress: string;
  }): Promise<ApprovalCheck> {
    try {
      // For ETH, no approval needed
      if (params.tokenAddress === '0x0000000000000000000000000000000000000000') {
        return {
          required: false,
          currentAllowance: '0',
          requiredAllowance: '0',
          approvalGas: '0',
          approvalCost: '0',
          spenderAddress: params.spenderAddress,
        };
      }

      // Get token contract
      const tokenContract = new ethers.Contract(
        params.tokenAddress,
        ['function allowance(address,address) view returns (uint256)'],
        this.provider
      );

      // Get current allowance
      const currentAllowance = await tokenContract.allowance(params.userAddress, params.spenderAddress);
      const requiredAllowance = ethers.parseUnits(params.amount, 18); // Assuming 18 decimals

      const required = currentAllowance < requiredAllowance;

      // Estimate approval gas if required
      let approvalGas = '0';
      let approvalCost = '0';

      if (required) {
        // Simulate approval transaction
        const approvalContract = new ethers.Contract(
          params.tokenAddress,
          ['function approve(address,uint256)'],
          this.provider
        );

        const approvalData = approvalContract.interface.encodeFunctionData('approve', [
          params.spenderAddress,
          requiredAllowance,
        ]);

        const gasEstimate = await this.provider.estimateGas({
          from: params.userAddress,
          to: params.tokenAddress,
          data: approvalData,
        });

        approvalGas = gasEstimate.toString();
        
        // Get current gas price
        const gasPrice = await this.provider.getFeeData();
        const gasPriceWei = gasPrice.gasPrice || ethers.parseUnits('20', 'gwei');
        approvalCost = (BigInt(approvalGas) * gasPriceWei).toString();
      }

      return {
        required,
        currentAllowance: currentAllowance.toString(),
        requiredAllowance: requiredAllowance.toString(),
        approvalGas,
        approvalCost,
        spenderAddress: params.spenderAddress,
      };
    } catch (error) {
      console.error('Error checking approval:', error);
      return {
        required: false,
        currentAllowance: '0',
        requiredAllowance: '0',
        approvalGas: '0',
        approvalCost: '0',
        spenderAddress: params.spenderAddress,
      };
    }
  }

  // Analyze token drain risk
  private async analyzeTokenDrain(params: {
    tokenAddress: string;
    toTokenAddress: string;
    route: RouteInfo;
  }): Promise<TokenDrainAnalysis> {
    const patterns: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check for suspicious token names
      const tokenNames = [
        params.route.fromToken.name.toLowerCase(),
        params.route.toToken.name.toLowerCase(),
        params.route.fromToken.symbol.toLowerCase(),
        params.route.toToken.symbol.toLowerCase(),
      ];

      const suspiciousNames = tokenNames.filter(name =>
        DRAIN_PATTERNS.some(pattern => name.includes(pattern))
      );

      if (suspiciousNames.length > 0) {
        patterns.push('suspicious_token_name');
        warnings.push(`Suspicious token names detected: ${suspiciousNames.join(', ')}`);
        recommendations.push('Verify token contract on blockchain explorer');
      }

      // Check for infinite approvals
      if (params.route.fromToken.address !== '0x0000000000000000000000000000000000000000') {
        const tokenContract = new ethers.Contract(
          params.route.fromToken.address,
          ['function allowance(address,address) view returns (uint256)'],
          this.provider
        );

        // Check if any protocol has infinite approval
        const maxUint256 = ethers.MaxUint256;
        const protocols = this.getProtocolAddresses(params.route);
        
        for (const protocol of protocols) {
          try {
            const allowance = await tokenContract.allowance(params.route.fromToken.address, protocol);
            if (allowance >= maxUint256) {
              patterns.push('infinite_approval');
              warnings.push(`Infinite approval detected for protocol: ${protocol}`);
              recommendations.push('Revoke infinite approvals for unused protocols');
            }
          } catch (error) {
            // Protocol might not be a contract, skip
          }
        }
      }

      // Check for high price impact
      if (params.route.priceImpact > 10) {
        patterns.push('high_price_impact');
        warnings.push(`High price impact: ${params.route.priceImpact.toFixed(2)}%`);
        recommendations.push('Consider using a different route or reducing amount');
      }

      // Check for complex routes
      if (params.route.protocols.length > 3) {
        patterns.push('complex_route');
        warnings.push(`Complex route with ${params.route.protocols.length} hops`);
        recommendations.push('Consider a simpler route to reduce risk');
      }

      // Check for unknown protocols
      const trustedProtocols = ['uniswap', 'sushiswap', 'pancakeswap', 'curve', 'balancer'];
      const unknownProtocols = params.route.protocols.filter(
        protocol => !trustedProtocols.includes(protocol.toLowerCase())
      );

      if (unknownProtocols.length > 0) {
        patterns.push('unknown_protocols');
        warnings.push(`Unknown protocols: ${unknownProtocols.join(', ')}`);
        recommendations.push('Research unknown protocols before proceeding');
      }

      return {
        risk: patterns.length > 0,
        patterns,
        warnings,
        recommendations,
      };
    } catch (error) {
      console.error('Error analyzing token drain:', error);
      return {
        risk: false,
        patterns: [],
        warnings: ['Unable to analyze token drain risk'],
        recommendations: ['Proceed with caution'],
      };
    }
  }

  // Simulate the actual swap transaction
  private async simulateSwap(params: {
    route: RouteInfo;
    userAddress: string;
    fromAmount: string;
    toAmount: string;
    slippage: number;
  }) {
    try {
      // For now, we'll simulate the gas estimation
      // In production, this would call the actual 1inch API for simulation
      
      const baseGas = 150000; // Base gas for swap
      const protocolGas = params.route.protocols.length * 50000; // Additional gas per protocol
      const estimatedGas = baseGas + protocolGas;
      
      // Get current gas price
      const gasPrice = await this.provider.getFeeData();
      const gasPriceWei = gasPrice.gasPrice || ethers.parseUnits('20', 'gwei');
      
      const totalCost = BigInt(estimatedGas) * gasPriceWei;
      
      return {
        success: true,
        gasUsed: estimatedGas.toString(),
        gasLimit: (estimatedGas * 1.2).toString(), // Add 20% buffer
        gasPrice: gasPriceWei.toString(),
        totalCost: totalCost.toString(),
      };
    } catch (error) {
      console.error('Error simulating swap:', error);
      return {
        success: false,
        gasUsed: '0',
        gasLimit: '0',
        gasPrice: '0',
        totalCost: '0',
        error: error instanceof Error ? error.message : 'Simulation failed',
      };
    }
  }

  // Calculate preview data
  private calculatePreview(params: {
    route: RouteInfo;
    fromAmount: string;
    toAmount: string;
    simulation: any;
    approvalCheck: ApprovalCheck;
  }) {
    const fromAmountNum = parseFloat(params.fromAmount);
    const toAmountNum = parseFloat(params.toAmount);
    
    // Calculate fees
    const gasCost = BigInt(params.simulation.gasUsed) * BigInt(params.simulation.gasPrice);
    const approvalCost = BigInt(params.approvalCheck.approvalCost);
    const totalFees = gasCost + approvalCost;

    return {
      inputAmount: params.fromAmount,
      outputAmount: params.toAmount,
      priceImpact: params.route.priceImpact,
      slippage: 0.5, // Default slippage
      fees: {
        protocol: '0', // Protocol fees would be calculated from route
        gas: gasCost.toString(),
        total: totalFees.toString(),
      },
    };
  }

  // Helper methods
  private getSpenderAddress(route: RouteInfo): string {
    // In a real implementation, this would get the spender address from the route
    // For now, we'll use a mock address
    return '0x1111111254EEB25477B68fb85Ed929f73A960582'; // 1inch router
  }

  private getProtocolAddresses(route: RouteInfo): string[] {
    // Extract protocol addresses from the route
    // This would be implemented based on the actual route structure
    return ['0x1111111254EEB25477B68fb85Ed929f73A960582']; // Mock 1inch router
  }

  // Public method to get improved gas estimation
  async getImprovedGasEstimate(params: {
    route: RouteInfo;
    userAddress: string;
    fromAmount: string;
  }): Promise<{
    success: boolean;
    gasEstimate: string;
    gasPrice: string;
    totalCost: string;
    error?: string;
  }> {
    try {
      const simulation = await this.simulateTransaction({
        route: params.route,
        userAddress: params.userAddress,
        fromAmount: params.fromAmount,
        toAmount: params.route.toAmount,
        slippage: 0.5,
      });

      if (!simulation.success || !simulation.data) {
        return {
          success: false,
          gasEstimate: '0',
          gasPrice: '0',
          totalCost: '0',
          error: simulation.error,
        };
      }

      const { simulation: simData, approval } = simulation.data;

      // Calculate total gas including approval
      const totalGas = BigInt(simData.gasUsed) + BigInt(approval.approvalGas);
      const gasPrice = BigInt(simData.gasPrice);
      const totalCost = totalGas * gasPrice;

      return {
        success: true,
        gasEstimate: totalGas.toString(),
        gasPrice: gasPrice.toString(),
        totalCost: totalCost.toString(),
      };
    } catch (error) {
      console.error('Error getting gas estimate:', error);
      return {
        success: false,
        gasEstimate: '0',
        gasPrice: '0',
        totalCost: '0',
        error: error instanceof Error ? error.message : 'Gas estimation failed',
      };
    }
  }
}

export const simulationService = new SimulationService(); 