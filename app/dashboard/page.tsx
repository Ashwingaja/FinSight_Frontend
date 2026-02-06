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
    const [generatingReport, setGeneratingReport] = useState(false);

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
            const result = await response.json();
            console.log('🔍 API Response:', result);
            // Backend returns { status: 'success', data: {...} }
            const data = result.data || result;
            console.log('📊 Dashboard Data:', data);
            console.log('💡 Recent Insights:', data.recentInsights);
            console.log('🎯 Top Recommendations:', data.topRecommendations);
            setDashboardData(data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async () => {
        try {
            setGeneratingReport(true);
            console.log('🔄 Generating report...');
            
            // Generate report
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportType: 'investor' }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            const result = await response.json();
            console.log('✅ Report generated:', result);
            
            const reportId = result.report._id || result.report.id;
            
            // Download the PDF
            console.log('📥 Downloading PDF...');
            const downloadResponse = await fetch(`/api/reports/${reportId}/download`);
            
            if (!downloadResponse.ok) {
                throw new Error('Failed to download report');
            }

            // Create blob and download
            const blob = await downloadResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `FinSight-Report-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            console.log('✅ Report downloaded successfully!');
            alert('Report generated and downloaded successfully!');
        } catch (error) {
            console.error('❌ Failed to generate report:', error);
            alert('Failed to generate report. Please try again.');
        } finally {
            setGeneratingReport(false);
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

    if (!dashboardData?.financialSummary) {
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

    const summary = {
        totalRevenue: dashboardData.financialSummary?.revenue || 0,
        netProfit: dashboardData.financialSummary?.netProfit || 0,
        profitMargin: dashboardData.financialSummary?.netMargin || 0,
        healthScore: dashboardData.scores?.healthScore || 0,
        riskScore: dashboardData.scores?.riskScore || 0,
    };

    const financialData = {
        expenses: {
            categories: dashboardData.charts?.expenseBreakdown || [],
        },
    };

    const trends = {
        revenue: dashboardData.charts?.revenueVsExpenses?.revenue || [],
    };

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

                {/* AI Insights & Recommendations */}
                {(dashboardData.recentInsights?.length > 0 || dashboardData.topRecommendations?.length > 0) && (
                    <>
                        {console.log('✅ Rendering Insights Section - Insights:', dashboardData.recentInsights?.length, 'Recommendations:', dashboardData.topRecommendations?.length)}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* AI Insights */}
                        {dashboardData.recentInsights?.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        <CardTitle>AI Insights</CardTitle>
                                    </div>
                                    <CardDescription>Key findings from your financial data</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {dashboardData.recentInsights.map((insight: any, index: number) => {
                                            const severityColors = {
                                                critical: 'bg-red-50 border-red-200',
                                                warning: 'bg-yellow-50 border-yellow-200',
                                                info: 'bg-blue-50 border-blue-200',
                                                positive: 'bg-green-50 border-green-200',
                                            };
                                            const severityDots = {
                                                critical: 'bg-red-600',
                                                warning: 'bg-yellow-600',
                                                info: 'bg-blue-600',
                                                positive: 'bg-green-600',
                                            };
                                            return (
                                                <div 
                                                    key={index} 
                                                    className={`flex gap-3 p-3 rounded-lg border ${severityColors[insight.severity as keyof typeof severityColors] || 'bg-gray-50 border-gray-200'}`}
                                                >
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        <div className={`h-2 w-2 rounded-full ${severityDots[insight.severity as keyof typeof severityDots] || 'bg-gray-600'}`}></div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-900 mb-1">{insight.title}</p>
                                                        <p className="text-sm text-gray-700">{insight.description}</p>
                                                        {insight.impact && (
                                                            <p className="text-xs text-gray-600 mt-1 italic">{insight.impact}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <Link href="/analysis" className="block mt-4">
                                        <Button variant="outline" size="sm" className="w-full">
                                            View Full Analysis
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}

                        {/* Top Recommendations */}
                        {dashboardData.topRecommendations?.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                        <CardTitle>Recommendations</CardTitle>
                                    </div>
                                    <CardDescription>AI-powered suggestions for improvement</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {dashboardData.topRecommendations.map((recommendation: any, index: number) => {
                                            const priorityColors = {
                                                high: 'bg-red-50 border-red-200',
                                                medium: 'bg-yellow-50 border-yellow-200',
                                                low: 'bg-green-50 border-green-200',
                                            };
                                            const priorityBadges = {
                                                high: 'bg-red-100 text-red-800',
                                                medium: 'bg-yellow-100 text-yellow-800',
                                                low: 'bg-green-100 text-green-800',
                                            };
                                            return (
                                                <div 
                                                    key={index} 
                                                    className={`flex gap-3 p-3 rounded-lg border ${priorityColors[recommendation.priority as keyof typeof priorityColors] || 'bg-gray-50 border-gray-200'}`}
                                                >
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="text-sm font-semibold text-gray-900">{recommendation.title}</p>
                                                            <Badge className={`text-xs ${priorityBadges[recommendation.priority as keyof typeof priorityBadges] || 'bg-gray-100 text-gray-800'}`}>
                                                                {recommendation.priority}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-700">{recommendation.description}</p>
                                                        {recommendation.expectedImpact && (
                                                            <p className="text-xs text-gray-600 mt-1 italic">Impact: {recommendation.expectedImpact}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <Link href="/analysis" className="block mt-4">
                                        <Button variant="outline" size="sm" className="w-full">
                                            View All Recommendations
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                    </>
                )}

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
                    <Card 
                        className={`hover:shadow-lg transition-shadow ${generatingReport ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                        onClick={generatingReport ? undefined : handleGenerateReport}
                    >
                        <CardContent className="pt-6 text-center">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-green-600" />
                            <h3 className="font-semibold mb-2">
                                {generatingReport ? 'Generating...' : 'Generate Report'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {generatingReport ? 'Please wait...' : 'Download PDF report'}
                            </p>
                        </CardContent>
                    </Card>
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
