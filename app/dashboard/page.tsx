'use client';

import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    AlertTriangle,
    FileText,
    Upload,
    LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';

export default function Dashboard() {
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/auth/signin');
        }
    }, [isLoaded, isSignedIn, router]);

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchDashboardData();
        }
    }, [isLoaded, isSignedIn]);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/dashboard');
            const data = await response.json();
            setDashboardData(data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!dashboardData?.hasData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <DashboardHeader
                    userName={user?.fullName || user?.primaryEmailAddress?.emailAddress || 'User'}
                    onSignOut={() => signOut({ redirectUrl: '/' })}
                />
                <div className="container mx-auto px-4 py-20">
                    <Card className="max-w-2xl mx-auto text-center">
                        <CardHeader>
                            <CardTitle className="text-3xl">Welcome to FinSight Pro!</CardTitle>
                            <CardDescription>
                                Get started by uploading your financial documents
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-8 bg-muted/50 rounded-lg">
                                <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground mb-4">
                                    Upload CSV, Excel, or PDF files containing your financial data
                                </p>
                            </div>
                            <Link href="/upload">
                                <Button size="lg" className="gap-2">
                                    <Upload className="h-5 w-5" />
                                    Upload Documents
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const { summary, financialData, trends } = dashboardData;

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <DashboardHeader
                userName={user?.fullName || user?.primaryEmailAddress?.emailAddress || 'User'}
                onSignOut={() => signOut({ redirectUrl: '/' })}
            />

            <div className="container mx-auto px-4 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Total Revenue"
                        value={formatCurrency(summary.totalRevenue)}
                        icon={<DollarSign className="h-5 w-5" />}
                        trend={summary.profitMargin > 0 ? 'up' : 'down'}
                    />
                    <MetricCard
                        title="Net Profit"
                        value={formatCurrency(summary.netProfit)}
                        icon={<TrendingUp className="h-5 w-5" />}
                        trend={summary.netProfit > 0 ? 'up' : 'down'}
                    />
                    <MetricCard
                        title="Health Score"
                        value={`${summary.healthScore}/100`}
                        icon={<BarChart3 className="h-5 w-5" />}
                        badge={
                            <Badge variant={summary.healthScore >= 70 ? 'success' : summary.healthScore >= 50 ? 'default' : 'destructive'}>
                                {summary.healthScore >= 70 ? 'Good' : summary.healthScore >= 50 ? 'Fair' : 'Poor'}
                            </Badge>
                        }
                    />
                    <MetricCard
                        title="Risk Score"
                        value={`${summary.riskScore}/100`}
                        icon={<AlertTriangle className="h-5 w-5" />}
                        badge={
                            <Badge variant={summary.riskScore < 40 ? 'success' : summary.riskScore < 60 ? 'default' : 'destructive'}>
                                {summary.riskScore < 40 ? 'Low' : summary.riskScore < 60 ? 'Medium' : 'High'}
                            </Badge>
                        }
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Revenue Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Trend</CardTitle>
                            <CardDescription>Historical revenue performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={trends.revenue}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis />
                                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                                    <Legend />
                                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Expense Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Expense Categories</CardTitle>
                            <CardDescription>Top expense categories</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={financialData.expenses.categories.slice(0, 5)}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) => entry.name}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="amount"
                                    >
                                        {financialData.expenses.categories.slice(0, 5).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Financial Health Meter */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Financial Health Overview</CardTitle>
                        <CardDescription>Key performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="font-medium">Health Score</span>
                                <span className="text-muted-foreground">{summary.healthScore}/100</span>
                            </div>
                            <Progress value={summary.healthScore} className="h-3" />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="font-medium">Profit Margin</span>
                                <span className="text-muted-foreground">{summary.profitMargin.toFixed(2)}%</span>
                            </div>
                            <Progress value={Math.min(100, summary.profitMargin * 2)} className="h-3" />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="font-medium">Risk Level</span>
                                <span className="text-muted-foreground">{summary.riskScore}/100</span>
                            </div>
                            <Progress value={summary.riskScore} className="h-3" />
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/upload">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="pt-6 text-center">
                                <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
                                <h3 className="font-semibold mb-2">Upload More Data</h3>
                                <p className="text-sm text-muted-foreground">Add new financial documents</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/analysis">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="pt-6 text-center">
                                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                                <h3 className="font-semibold mb-2">View Analysis</h3>
                                <p className="text-sm text-muted-foreground">AI-powered insights</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/reports">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="pt-6 text-center">
                                <FileText className="h-12 w-12 mx-auto mb-4 text-green-600" />
                                <h3 className="font-semibold mb-2">Generate Report</h3>
                                <p className="text-sm text-muted-foreground">Investor-ready reports</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function DashboardHeader({
    userName,
    onSignOut,
}: {
    userName: string;
    onSignOut: () => void;
}) {
    return (
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        FinSight Pro
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                        {userName}
                    </span>
                    <Button variant="outline" size="sm" onClick={onSignOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </header>
    );
}

function MetricCard({
    title,
    value,
    icon,
    trend,
    badge,
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down';
    badge?: React.ReactNode;
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{title}</span>
                    {icon}
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{value}</span>
                    {badge}
                    {trend && (
                        <div className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                            {trend === 'up' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
