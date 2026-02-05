/**
 * Format number as currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format number as percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Generate color palette for charts
 */
export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#a855f7',
  pink: '#ec4899',
};

export const PIE_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // green
  '#06b6d4', // cyan
  '#f97316', // orange
  '#a855f7', // violet
];

/**
 * Custom tooltip formatter for currency
 */
export function currencyTooltipFormatter(value: any): string {
  return formatCurrency(Number(value));
}

/**
 * Custom tooltip formatter for percentage
 */
export function percentageTooltipFormatter(value: any): string {
  return formatPercentage(Number(value));
}

/**
 * Responsive chart configuration
 */
export const RESPONSIVE_CHART_CONFIG = {
  small: { width: '100%', height: 200 },
  medium: { width: '100%', height: 300 },
  large: { width: '100%', height: 400 },
};

/**
 * Get health score color
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 70) return CHART_COLORS.success;
  if (score >= 50) return CHART_COLORS.warning;
  return CHART_COLORS.danger;
}

/**
 * Get risk score color
 */
export function getRiskScoreColor(score: number): string {
  if (score < 40) return CHART_COLORS.success;
  if (score < 60) return CHART_COLORS.warning;
  return CHART_COLORS.danger;
}
