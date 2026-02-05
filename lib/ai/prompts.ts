// Prompt templates for different AI analysis tasks

export function createForecastPrompt(historicalData: any[]): string {
  const dataPoints = historicalData.map(d => ({
    period: d.period,
    revenue: d.revenue.total,
    expenses: d.expenses.total,
  }));

  return `Based on the following historical financial data, provide a 6-month forecast:

${dataPoints.map((d, i) => `Month ${i + 1}: Revenue ₹${d.revenue.toLocaleString('en-IN')}, Expenses ₹${d.expenses.toLocaleString('en-IN')}`).join('\n')}

Provide forecasted values for the next 6 months in this format:
Month 1: Revenue ₹X, Expenses ₹Y
Month 2: Revenue ₹X, Expenses ₹Y
...and so on.

Also explain the key trends and assumptions used for the forecast.`;
}

export function createCostOptimizationPrompt(expenseData: any): string {
  const categories = expenseData.categories
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 5);

  return `Analyze these top expense categories and suggest cost optimization strategies:

${categories.map((c: any, i: number) => `${i + 1}. ${c.name}: ₹${c.amount.toLocaleString('en-IN')}`).join('\n')}

Total Expenses: ₹${expenseData.total.toLocaleString('en-IN')}

Provide 5 specific, actionable cost optimization recommendations with:
- Category to optimize
- Specific action to take
- Expected savings (percentage or amount)
- Implementation difficulty (Easy/Medium/Hard)`;
}

export function createIndustryBenchmarkPrompt(businessData: any, industry: string): string {
  return `Compare this ${industry} business against industry benchmarks:

Business Metrics:
- Revenue: ₹${businessData.revenue.total.toLocaleString('en-IN')}
- Profit Margin: ${(businessData.ratios.profitMargin * 100).toFixed(2)}%
- Expense Ratio: ${(businessData.ratios.expenseRatio * 100).toFixed(2)}%
- Current Ratio: ${businessData.ratios.currentRatio || 'N/A'}

Provide:
1. Typical industry benchmarks for ${industry} sector in India
2. How this business compares (above/below average)
3. Key areas where the business excels
4. Key areas needing improvement
5. Industry-specific recommendations`;
}

export function createWorkingCapitalPrompt(financialData: any): string {
  return `Analyze the working capital situation:

Accounts Receivable: ₹${(financialData.accountsReceivable || 0).toLocaleString('en-IN')}
Accounts Payable: ₹${(financialData.accountsPayable || 0).toLocaleString('en-IN')}
Cash Flow (Net): ₹${financialData.cashFlow.net.toLocaleString('en-IN')}
Current Ratio: ${financialData.ratios.currentRatio || 'N/A'}

Provide recommendations to optimize working capital including:
1. Strategies to improve cash conversion cycle
2. Receivables management tips
3. Payables optimization strategies
4. Inventory management suggestions (if applicable)
5. Short-term financing options if needed`;
}
