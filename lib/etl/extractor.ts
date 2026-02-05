// Extract financial features from raw data

export interface ExtractedData {
  transactions: Transaction[];
  revenue: RevenueData;
  expenses: ExpenseData;
  cashFlow: CashFlowData;
  inventory?: InventoryData;
  loans?: LoanData[];
  accountsReceivable?: number;
  accountsPayable?: number;
}

export interface Transaction {
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
}

export interface RevenueData {
  total: number;
  streams: Array<{ name: string; amount: number }>;
}

export interface ExpenseData {
  total: number;
  categories: Array<{ name: string; amount: number }>;
}

export interface CashFlowData {
  operating: number;
  investing: number;
  financing: number;
  net: number;
}

export interface InventoryData {
  opening: number;
  closing: number;
  turnover: number;
}

export interface LoanData {
  type: string;
  amount: number;
  interestRate: number;
  emi: number;
}

// Common column name variations for different data types
const COLUMN_MAPPINGS = {
  date: ['date', 'transaction date', 'txn date', 'posting date', 'value date'],
  description: ['description', 'narration', 'particulars', 'details', 'transaction details'],
  amount: ['amount', 'value', 'transaction amount', 'txn amount'],
  debit: ['debit', 'withdrawal', 'dr', 'paid out'],
  credit: ['credit', 'deposit', 'cr', 'received'],
  balance: ['balance', 'closing balance', 'available balance'],
  category: ['category', 'type', 'expense type', 'income type'],
};

function findColumn(headers: string[], possibleNames: string[]): string | null {
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());
  for (const name of possibleNames) {
    const index = lowerHeaders.indexOf(name.toLowerCase());
    if (index !== -1) return headers[index];
  }
  return null;
}

export function extractTransactions(data: any[]): Transaction[] {
  if (!data || data.length === 0) return [];

  const headers = Object.keys(data[0]);
  const dateCol = findColumn(headers, COLUMN_MAPPINGS.date);
  const descCol = findColumn(headers, COLUMN_MAPPINGS.description);
  const amountCol = findColumn(headers, COLUMN_MAPPINGS.amount);
  const debitCol = findColumn(headers, COLUMN_MAPPINGS.debit);
  const creditCol = findColumn(headers, COLUMN_MAPPINGS.credit);
  const categoryCol = findColumn(headers, COLUMN_MAPPINGS.category);

  const transactions: Transaction[] = [];

  data.forEach((row) => {
    let amount = 0;
    let type: 'income' | 'expense' = 'expense';

    // Determine amount and type
    if (amountCol && row[amountCol]) {
      amount = Math.abs(parseFloat(row[amountCol]));
      // Assume positive amounts in a single column are income
      type = parseFloat(row[amountCol]) > 0 ? 'income' : 'expense';
    } else if (debitCol && creditCol) {
      if (row[debitCol]) {
        amount = Math.abs(parseFloat(row[debitCol]));
        type = 'expense';
      } else if (row[creditCol]) {
        amount = Math.abs(parseFloat(row[creditCol]));
        type = 'income';
      }
    }

    if (amount > 0 && dateCol && row[dateCol]) {
      transactions.push({
        date: new Date(row[dateCol]),
        description: descCol ? row[descCol] : 'Unknown',
        amount,
        type,
        category: categoryCol ? row[categoryCol] : categorizeTransaction(descCol ? row[descCol] : ''),
      });
    }
  });

  return transactions;
}

function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase();

  // Income categories
  if (desc.includes('sale') || desc.includes('revenue') || desc.includes('invoice')) {
    return 'Sales Revenue';
  }
  if (desc.includes('service') || desc.includes('consulting')) {
    return 'Service Revenue';
  }

  // Expense categories
  if (desc.includes('salary') || desc.includes('wage') || desc.includes('payroll')) {
    return 'Salaries & Wages';
  }
  if (desc.includes('rent') || desc.includes('lease')) {
    return 'Rent';
  }
  if (desc.includes('utility') || desc.includes('electricity') || desc.includes('water')) {
    return 'Utilities';
  }
  if (desc.includes('marketing') || desc.includes('advertising')) {
    return 'Marketing';
  }
  if (desc.includes('inventory') || desc.includes('stock') || desc.includes('purchase')) {
    return 'Inventory Purchase';
  }
  if (desc.includes('loan') || desc.includes('emi') || desc.includes('interest')) {
    return 'Loan Payment';
  }
  if (desc.includes('tax') || desc.includes('gst')) {
    return 'Taxes';
  }

  return 'Other';
}

export function extractRevenueData(transactions: Transaction[]): RevenueData {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const total = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const streamMap = new Map<string, number>();
  incomeTransactions.forEach(t => {
    const category = t.category || 'Other Revenue';
    streamMap.set(category, (streamMap.get(category) || 0) + t.amount);
  });

  const streams = Array.from(streamMap.entries()).map(([name, amount]) => ({
    name,
    amount,
  }));

  return { total, streams };
}

export function extractExpenseData(transactions: Transaction[]): ExpenseData {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const total = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const categoryMap = new Map<string, number>();
  expenseTransactions.forEach(t => {
    const category = t.category || 'Other Expenses';
    categoryMap.set(category, (categoryMap.get(category) || 0) + t.amount);
  });

  const categories = Array.from(categoryMap.entries()).map(([name, amount]) => ({
    name,
    amount,
  }));

  return { total, categories };
}

export function extractCashFlowData(transactions: Transaction[]): CashFlowData {
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  // Simplified cash flow calculation
  // In a real scenario, you'd categorize transactions into operating/investing/financing
  const operating = income - expenses;
  const investing = 0; // Would need specific transaction categorization
  const financing = 0; // Would need specific transaction categorization
  const net = operating + investing + financing;

  return { operating, investing, financing, net };
}

export function extractAllData(rawData: any[]): ExtractedData {
  const transactions = extractTransactions(rawData);
  const revenue = extractRevenueData(transactions);
  const expenses = extractExpenseData(transactions);
  const cashFlow = extractCashFlowData(transactions);

  return {
    transactions,
    revenue,
    expenses,
    cashFlow,
  };
}
