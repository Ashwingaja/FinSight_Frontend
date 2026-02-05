'use client';

import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, LogOut, FileText, Download } from 'lucide-react';
import Link from 'next/link';

export default function ReportsPage() {
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
            fetchData();
        }
    }, [isLoaded, isSignedIn]);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/dashboard');
            const data = await response.json();
            setDashboardData(data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
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
                            <CardTitle className="text-3xl">No Data Available</CardTitle>
                            <CardDescription>
                                Upload financial documents first to generate reports
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/upload">
                                <Button size="lg">Upload Documents</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const { summary, financialData } = dashboardData;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <DashboardHeader
                userName={user?.fullName || user?.primaryEmailAddress?.emailAddress || 'User'}
                onSignOut={() => signOut({ redirectUrl: '/' })}
            />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Financial Reports</h1>
                    <p className="text-muted-foreground">
                        Generate and download investor-ready financial reports
                    </p>
                </div>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Report Preview</CardTitle>
                        <CardDescription>Comprehensive financial summary</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Financial Summary</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                                    <p className="text-2xl font-bold">₹{summary.totalRevenue.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                                    <p className="text-2xl font-bold">₹{summary.netProfit.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Profit Margin</p>
                                    <p className="text-2xl font-bold">{summary.profitMargin.toFixed(2)}%</p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Health Score</p>
                                    <p className="text-2xl font-bold">{summary.healthScore}/100</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-4">Revenue Breakdown</h3>
                            <div className="space-y-2">
                                {financialData.revenue.streams.map((stream: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded">
                                        <span>{stream.name}</span>
                                        <span className="font-semibold">₹{stream.amount.toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-4">Expense Breakdown</h3>
                            <div className="space-y-2">
                                {financialData.expenses.categories.slice(0, 5).map((category: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded">
                                        <span>{category.name}</span>
                                        <span className="font-semibold">₹{category.amount.toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-4">Key Metrics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {financialData.ratios.profitMargin && (
                                    <div className="p-3 bg-muted/30 rounded">
                                        <p className="text-sm text-muted-foreground">Profit Margin</p>
                                        <p className="text-lg font-semibold">{(financialData.ratios.profitMargin * 100).toFixed(2)}%</p>
                                    </div>
                                )}
                                {financialData.ratios.currentRatio && (
                                    <div className="p-3 bg-muted/30 rounded">
                                        <p className="text-sm text-muted-foreground">Current Ratio</p>
                                        <p className="text-lg font-semibold">{financialData.ratios.currentRatio.toFixed(2)}</p>
                                    </div>
                                )}
                                <div className="p-3 bg-muted/30 rounded">
                                    <p className="text-sm text-muted-foreground">Risk Score</p>
                                    <p className="text-lg font-semibold">{summary.riskScore}/100</p>
                                </div>
                                <div className="p-3 bg-muted/30 rounded">
                                    <p className="text-sm text-muted-foreground">Cash Flow</p>
                                    <p className="text-lg font-semibold">₹{summary.cashFlow.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full gap-2" size="lg">
                            <Download className="h-5 w-5" />
                            Download PDF Report
                        </Button>
                    </CardContent>
                </Card>
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
                <Link href="/dashboard" className="flex items-center gap-2">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        FinSight Pro
                    </span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm">
                            Dashboard
                        </Button>
                    </Link>
                    <Link href="/upload">
                        <Button variant="ghost" size="sm">
                            Upload
                        </Button>
                    </Link>
                    <Link href="/analysis">
                        <Button variant="ghost" size="sm">
                            Analysis
                        </Button>
                    </Link>
                    <span className="text-sm text-muted-foreground">{userName}</span>
                    <Button variant="outline" size="sm" onClick={onSignOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </header>
    );
}
