'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    RadialBarChart,
    RadialBar,
} from 'recharts';
import {
    PIE_COLORS,
    currencyTooltipFormatter,
    percentageTooltipFormatter,
    getHealthScoreColor,
    getRiskScoreColor,
} from '@/lib/chart-utils';

interface FinancialChartsProps {
    revenueTrend?: any[];
    expenseCategories?: any[];
    cashFlowData?: any[];
    healthScore?: number;
    riskScore?: number;
    workingCapital?: any[];
}

export function RevenueTrendChart({ data }: { data: any[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Historical revenue performance over time</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="period" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip formatter={currencyTooltipFormatter} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            name="Revenue"
                            dot={{ fill: '#3b82f6', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function ExpenseBreakdownChart({ data }: { data: any[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>Top expense categories breakdown</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data.slice(0, 5)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="amount"
                        >
                            {data.slice(0, 5).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={currencyTooltipFormatter} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function CashFlowChart({ data }: { data: any[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Cash Flow Trend</CardTitle>
                <CardDescription>Operating cash flow over time</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="period" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip formatter={currencyTooltipFormatter} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.3}
                            name="Cash Flow"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function HealthScoreGauge({ score }: { score: number }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Financial Health Score</CardTitle>
                <CardDescription>Overall business health assessment</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="80"
                            stroke="#e5e7eb"
                            strokeWidth="16"
                            fill="none"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r="80"
                            stroke={getHealthScoreColor(score)}
                            strokeWidth="16"
                            fill="none"
                            strokeDasharray={`${(score / 100) * 502.4} 502.4`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold" style={{ color: getHealthScoreColor(score) }}>
                            {score}
                        </span>
                        <span className="text-sm text-muted-foreground">/ 100</span>
                    </div>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                    {score >= 70 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Improvement'}
                </p>
            </CardContent>
        </Card>
    );
}

export function RiskScoreGauge({ score }: { score: number }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>Business risk level indicator</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="80"
                            stroke="#e5e7eb"
                            strokeWidth="16"
                            fill="none"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r="80"
                            stroke={getRiskScoreColor(score)}
                            strokeWidth="16"
                            fill="none"
                            strokeDasharray={`${(score / 100) * 502.4} 502.4`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold" style={{ color: getRiskScoreColor(score) }}>
                            {score}
                        </span>
                        <span className="text-sm text-muted-foreground">/ 100</span>
                    </div>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                    {score < 40 ? 'Low Risk' : score < 60 ? 'Medium Risk' : 'High Risk'}
                </p>
            </CardContent>
        </Card>
    );
}

export function WorkingCapitalChart({ data }: { data: any[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Working Capital</CardTitle>
                <CardDescription>Current assets vs current liabilities</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="period" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip formatter={currencyTooltipFormatter} />
                        <Legend />
                        <Bar dataKey="assets" fill="#3b82f6" name="Current Assets" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="liabilities" fill="#ef4444" name="Current Liabilities" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function FinancialCharts({
    revenueTrend,
    expenseCategories,
    cashFlowData,
    healthScore,
    riskScore,
    workingCapital,
}: FinancialChartsProps) {
    return (
        <div className="space-y-6">
            {/* Revenue and Expenses Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {revenueTrend && <RevenueTrendChart data={revenueTrend} />}
                {expenseCategories && <ExpenseBreakdownChart data={expenseCategories} />}
            </div>

            {/* Cash Flow and Scores Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {cashFlowData && (
                    <div className="lg:col-span-2">
                        <CashFlowChart data={cashFlowData} />
                    </div>
                )}
                {healthScore !== undefined && <HealthScoreGauge score={healthScore} />}
            </div>

            {/* Working Capital and Risk Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {workingCapital && (
                    <div className="lg:col-span-2">
                        <WorkingCapitalChart data={workingCapital} />
                    </div>
                )}
                {riskScore !== undefined && <RiskScoreGauge score={riskScore} />}
            </div>
        </div>
    );
}
