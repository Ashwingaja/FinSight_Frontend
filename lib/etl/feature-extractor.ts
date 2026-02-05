import { ExtractedData } from './extractor';

// Calculate financial ratios and health scores

export interface FinancialFeatures {
  ratios: {
    currentRatio?: number;
    quickRatio?: number;
    debtToEquity?: number;
    profitMargin: number;
    returnOnAssets?: number;
    expenseRatio: number;
  };
  healthScore: number;
  riskScore: number;
  trends: {
    revenueGrowth?: number;
    expenseGrowth?: number;
    profitGrowth?: number;
  };
}

export function calculateFinancialFeatures(
  data: ExtractedData,
  historicalData?: ExtractedData
): FinancialFeatures {
  const { revenue, expenses, cashFlow, loans, accountsReceivable, accountsPayable } = data;

  // Calculate ratios
  const profitMargin = revenue.total > 0 ? (revenue.total - expenses.total) / revenue.total : 0;
  const expenseRatio = revenue.total > 0 ? expenses.total / revenue.total : 1;

  let currentRatio: number | undefined;
  let quickRatio: number | undefined;
  let debtToEquity: number | undefined;

  // Current Ratio = Current Assets / Current Liabilities
  if (accountsReceivable && accountsPayable && accountsPayable > 0) {
    const currentAssets = accountsReceivable + (cashFlow.net > 0 ? cashFlow.net : 0);
    currentRatio = currentAssets / accountsPayable;
    quickRatio = accountsReceivable / accountsPayable; // Simplified
  }

  // Debt to Equity (simplified)
  if (loans && loans.length > 0) {
    const totalDebt = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const equity = revenue.total - expenses.total; // Simplified as net profit
    if (equity > 0) {
      debtToEquity = totalDebt / equity;
    }
  }

  // Calculate trends if historical data is available
  let revenueGrowth: number | undefined;
  let expenseGrowth: number | undefined;
  let profitGrowth: number | undefined;

  if (historicalData) {
    if (historicalData.revenue.total > 0) {
      revenueGrowth = (revenue.total - historicalData.revenue.total) / historicalData.revenue.total;
    }
    if (historicalData.expenses.total > 0) {
      expenseGrowth = (expenses.total - historicalData.expenses.total) / historicalData.expenses.total;
    }
    const currentProfit = revenue.total - expenses.total;
    const historicalProfit = historicalData.revenue.total - historicalData.expenses.total;
    if (historicalProfit !== 0) {
      profitGrowth = (currentProfit - historicalProfit) / Math.abs(historicalProfit);
    }
  }

  // Calculate Health Score (0-100)
  const healthScore = calculateHealthScore({
    profitMargin,
    currentRatio,
    cashFlowNet: cashFlow.net,
    revenueTotal: revenue.total,
    expenseRatio,
  });

  // Calculate Risk Score (0-100, higher = more risk)
  const riskScore = calculateRiskScore({
    profitMargin,
    debtToEquity,
    currentRatio,
    expenseRatio,
    cashFlowNet: cashFlow.net,
  });

  return {
    ratios: {
      currentRatio,
      quickRatio,
      debtToEquity,
      profitMargin,
      expenseRatio,
    },
    healthScore,
    riskScore,
    trends: {
      revenueGrowth,
      expenseGrowth,
      profitGrowth,
    },
  };
}

function calculateHealthScore(params: {
  profitMargin: number;
  currentRatio?: number;
  cashFlowNet: number;
  revenueTotal: number;
  expenseRatio: number;
}): number {
  let score = 50; // Base score

  // Profit margin contribution (max 25 points)
  if (params.profitMargin > 0.3) score += 25;
  else if (params.profitMargin > 0.2) score += 20;
  else if (params.profitMargin > 0.1) score += 15;
  else if (params.profitMargin > 0) score += 10;
  else score -= 20; // Negative margin

  // Current ratio contribution (max 15 points)
  if (params.currentRatio) {
    if (params.currentRatio >= 2) score += 15;
    else if (params.currentRatio >= 1.5) score += 12;
    else if (params.currentRatio >= 1) score += 8;
    else score -= 10;
  }

  // Cash flow contribution (max 15 points)
  if (params.cashFlowNet > 0) {
    const cashFlowRatio = params.cashFlowNet / params.revenueTotal;
    if (cashFlowRatio > 0.2) score += 15;
    else if (cashFlowRatio > 0.1) score += 10;
    else score += 5;
  } else {
    score -= 15;
  }

  // Expense ratio contribution (max -5 to +5 points)
  if (params.expenseRatio < 0.7) score += 5;
  else if (params.expenseRatio > 0.9) score -= 5;

  return Math.max(0, Math.min(100, score));
}

function calculateRiskScore(params: {
  profitMargin: number;
  debtToEquity?: number;
  currentRatio?: number;
  expenseRatio: number;
  cashFlowNet: number;
}): number {
  let risk = 30; // Base risk

  // Negative profit increases risk
  if (params.profitMargin < 0) risk += 25;
  else if (params.profitMargin < 0.05) risk += 15;
  else if (params.profitMargin > 0.2) risk -= 10;

  // High debt increases risk
  if (params.debtToEquity) {
    if (params.debtToEquity > 2) risk += 20;
    else if (params.debtToEquity > 1) risk += 10;
    else if (params.debtToEquity < 0.5) risk -= 5;
  }

  // Low liquidity increases risk
  if (params.currentRatio) {
    if (params.currentRatio < 1) risk += 15;
    else if (params.currentRatio < 1.5) risk += 8;
    else if (params.currentRatio > 2) risk -= 5;
  }

  // High expense ratio increases risk
  if (params.expenseRatio > 0.9) risk += 15;
  else if (params.expenseRatio > 0.8) risk += 8;

  // Negative cash flow increases risk
  if (params.cashFlowNet < 0) risk += 20;

  return Math.max(0, Math.min(100, risk));
}
