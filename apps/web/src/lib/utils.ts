import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBalance(balance: string, decimals: number = 6): string {
  try {
    const num = parseFloat(balance)
    if (isNaN(num)) return '0.00'
    
    // Format based on the value size
    if (num === 0) return '0.00'
    if (num < 0.000001) return '< 0.000001'
    if (num < 0.01) return num.toFixed(6)
    if (num < 1) return num.toFixed(4)
    if (num < 1000) return num.toFixed(2)
    if (num < 1000000) return `${(num / 1000).toFixed(2)}K`
    if (num < 1000000000) return `${(num / 1000000).toFixed(2)}M`
    return `${(num / 1000000000).toFixed(2)}B`
  } catch {
    return '0.00'
  }
}

export function validateAmount(amount: string, balance: string): boolean {
  try {
    const amountNum = parseFloat(amount)
    const balanceNum = parseFloat(balance)
    
    if (isNaN(amountNum) || isNaN(balanceNum)) return false
    if (amountNum <= 0) return false
    if (amountNum > balanceNum) return false
    
    return true
  } catch {
    return false
  }
} 