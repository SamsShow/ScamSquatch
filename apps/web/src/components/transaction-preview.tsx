'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface TransactionPreviewProps {
  simulationData: {
    simulation: {
      success: boolean
      gasUsed: string
      gasLimit: string
      gasPrice: string
      totalCost: string
      error?: string
    }
    approval: {
      required: boolean
      currentAllowance: string
      requiredAllowance: string
      approvalGas: string
      approvalCost: string
    }
    security: {
      tokenDrainRisk: boolean
      suspiciousPatterns: string[]
      warnings: string[]
      recommendations: string[]
    }
    preview: {
      inputAmount: string
      outputAmount: string
      priceImpact: number
      slippage: number
      fees: {
        protocol: string
        gas: string
        total: string
      }
    }
  }
  onApprove?: () => void
  onExecute?: () => void
  isExecuting?: boolean
}

export function TransactionPreview({ 
  simulationData, 
  onApprove, 
  onExecute, 
  isExecuting = false 
}: TransactionPreviewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'fees'>('overview')

  const formatAmount = (amount: string, decimals: number = 18) => {
    const num = parseFloat(amount) / Math.pow(10, decimals)
    return num.toFixed(6)
  }

  const formatGas = (gas: string) => {
    const num = parseFloat(gas)
    return num > 1000000 ? `${(num / 1000000).toFixed(2)}M` : num.toLocaleString()
  }

  const formatCost = (cost: string) => {
    const num = parseFloat(cost) / Math.pow(10, 18) // Convert from wei to ETH
    return num.toFixed(6)
  }

  const getSecurityLevel = () => {
    if (simulationData.security.tokenDrainRisk) {
      return { level: 'HIGH', color: 'text-red-500', bgColor: 'bg-red-500/10', icon: '🚨' }
    }
    if (simulationData.approval.required) {
      return { level: 'MEDIUM', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', icon: '⚠️' }
    }
    return { level: 'LOW', color: 'text-green-500', bgColor: 'bg-green-500/10', icon: '✅' }
  }

  const securityLevel = getSecurityLevel()

  return (
    <Card className="p-4 bg-dark border-border/40">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Transaction Preview</h3>
          <div className={`px-2 py-1 rounded text-xs font-medium ${securityLevel.bgColor} ${securityLevel.color}`}>
            {securityLevel.icon} {securityLevel.level} RISK
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-dark-accent rounded-lg p-1">
          <button
            className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
              activeTab === 'overview' 
                ? 'bg-brand text-white' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
              activeTab === 'security' 
                ? 'bg-brand text-white' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button
            className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
              activeTab === 'fees' 
                ? 'bg-brand text-white' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('fees')}
          >
            Fees
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Transaction Summary */}
            <div className="space-y-3 p-3 bg-dark-accent rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Input Amount:</span>
                <span className="font-medium">
                  {formatAmount(simulationData.preview.inputAmount)} ETH
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Output Amount:</span>
                <span className="font-medium">
                  {formatAmount(simulationData.preview.outputAmount, 6)} USDC
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price Impact:</span>
                <span className={`font-medium ${
                  simulationData.preview.priceImpact > 5 ? 'text-orange-500' : 'text-green-500'
                }`}>
                  {simulationData.preview.priceImpact.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Slippage:</span>
                <span className="font-medium">
                  {simulationData.preview.slippage}%
                </span>
              </div>
            </div>

            {/* Gas Estimation */}
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
              <div className="text-sm text-green-500 font-medium mb-2">
                ⛽ Gas Estimation
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Gas Used:</span>
                  <span>{formatGas(simulationData.simulation.gasUsed)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gas Limit:</span>
                  <span>{formatGas(simulationData.simulation.gasLimit)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gas Price:</span>
                  <span>{formatCost(simulationData.simulation.gasPrice)} ETH</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Cost:</span>
                  <span>{formatCost(simulationData.simulation.totalCost)} ETH</span>
                </div>
              </div>
            </div>

            {/* Approval Status */}
            {simulationData.approval.required && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                <div className="text-sm text-yellow-500 font-medium mb-2">
                  ⚠️ Approval Required
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Current Allowance:</span>
                    <span>{formatAmount(simulationData.approval.currentAllowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Required Allowance:</span>
                    <span>{formatAmount(simulationData.approval.requiredAllowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approval Gas:</span>
                    <span>{formatGas(simulationData.approval.approvalGas)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approval Cost:</span>
                    <span>{formatCost(simulationData.approval.approvalCost)} ETH</span>
                  </div>
                </div>
                {onApprove && (
                  <Button
                    className="w-full mt-3 bg-yellow-600 hover:bg-yellow-700"
                    onClick={onApprove}
                  >
                    Approve Token
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            {/* Security Analysis */}
            <div className="p-3 bg-dark-accent rounded-lg">
              <div className="text-sm font-medium mb-3">🔍 Security Analysis</div>
              
              {simulationData.security.tokenDrainRisk ? (
                <div className="space-y-3">
                  <div className="text-xs text-red-500 font-medium">
                    🚨 Token Drain Risk Detected
                  </div>
                  
                  {simulationData.security.warnings.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">Warnings:</div>
                      <div className="space-y-1">
                        {simulationData.security.warnings.map((warning, index) => (
                          <div key={index} className="text-xs text-red-400">• {warning}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {simulationData.security.recommendations.length > 0 && (
                    <div>
                      <div className="text-xs text-blue-500 font-medium mt-3 mb-2">Recommendations:</div>
                      <div className="space-y-1">
                        {simulationData.security.recommendations.map((rec, index) => (
                          <div key={index} className="text-xs text-blue-400">• {rec}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-green-500">
                  ✅ No significant security risks detected
                </div>
              )}
            </div>

            {/* Suspicious Patterns */}
            {simulationData.security.suspiciousPatterns.length > 0 && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-md">
                <div className="text-sm text-orange-500 font-medium mb-2">
                  ⚠️ Suspicious Patterns
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  {simulationData.security.suspiciousPatterns.map((pattern, index) => (
                    <div key={index}>• {pattern}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="space-y-4">
            {/* Fee Breakdown */}
            <div className="p-3 bg-dark-accent rounded-lg">
              <div className="text-sm font-medium mb-3">💰 Fee Breakdown</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Protocol Fee:</span>
                  <span>{formatCost(simulationData.preview.fees.protocol)} ETH</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Gas Fee:</span>
                  <span>{formatCost(simulationData.preview.fees.gas)} ETH</span>
                </div>
                {simulationData.approval.required && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Approval Fee:</span>
                    <span>{formatCost(simulationData.approval.approvalCost)} ETH</span>
                  </div>
                )}
                <div className="border-t border-border/40 pt-2 mt-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total Fee:</span>
                    <span>{formatCost(simulationData.preview.fees.total)} ETH</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
              <div className="text-sm text-blue-500 font-medium mb-2">
                📊 Cost Analysis
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Input Value:</span>
                  <span>{formatAmount(simulationData.preview.inputAmount)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Fees:</span>
                  <span>{formatCost(simulationData.preview.fees.total)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee Percentage:</span>
                  <span>
                    {((parseFloat(simulationData.preview.fees.total) / parseFloat(simulationData.preview.inputAmount)) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {onExecute && (
            <Button
              className="w-full bg-brand hover:bg-brand-dark"
              disabled={isExecuting || simulationData.security.tokenDrainRisk}
              onClick={onExecute}
            >
              {isExecuting ? 'Executing...' : 'Execute Transaction'}
            </Button>
          )}
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground text-center">
          This preview is for informational purposes only. Actual transaction costs may vary.
        </div>
      </div>
    </Card>
  )
} 