'use client';

import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, LogOut, TrendingUp, AlertCircle, Lightbulb, Target } from 'lucide-react';
import Link from 'next/link';
import { AIResponseDisplay } from '@/components/ai-response-display';

export default function AnalysisPage() {
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/auth/signin');
        }
    }, [isLoaded, isSignedIn, router]);

    useEffect(() => {
        if (isLoaded && isSignedIn && mounted) {
            fetchAnalysis();
        }
    }, [isLoaded, isSignedIn, mounted]);

    const fetchAnalysis = async () => {
        try {
            console.log('🔍 Fetching latest analysis...');
            
            // Try to fetch the latest analysis directly
            const analysisResponse = await fetch('/api/analyze/latest');
            console.log('📥 Analysis Response Status:', analysisResponse.status);

            if (analysisResponse.ok) {
                const result = await analysisResponse.json();
                console.log('✅ Analysis Result:', result);
                // Backend returns {status, analysis}
                const analysisData = result.analysis || result.data || result;
                console.log('📊 Analysis Data:', analysisData);
                setAnalysis(analysisData);
            } else {
                console.log('⚠️ No analysis found, checking for financial data...');
                // No analysis exists, check if we have financial data to generate from
                const dashboardResponse = await fetch('/api/dashboard');
                const dashboardResult = await dashboardResponse.json();
                const dashboardData = dashboardResult.data || dashboardResult;
                
                console.log('📈 Dashboard Data:', dashboardData);

                if (dashboardData.financialSummary) {
                    console.log('💡 Financial data exists, but no analysis yet');
                    // We have financial data but no analysis - user needs to generate it
                    setAnalysis(null);
                } else {
                    console.log('❌ No financial data available');
                    setAnalysis(null);
                }
            }
        } catch (error) {
            console.error('❌ Failed to fetch analysis:', error);
            setAnalysis(null);
        } finally {
            setLoading(false);
        }
    };

    const generateAnalysis = async (financialDataId: string) => {
        setGenerating(true);
        try {
            console.log('🔄 Generating analysis for:', financialDataId);
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ financialDataId }),
            });

            console.log('📤 Generate Response Status:', response.status);
            const data = await response.json();
            console.log('✅ Generated Analysis:', data);
            setAnalysis(data.analysis || data);
        } catch (error) {
            console.error('❌ Failed to generate analysis:', error);
        } finally {
            setGenerating(false);
        }
    };

    // Prevent hydration mismatch by showing loading state until mounted
    if (!mounted || !isLoaded || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading analysis...</p>
                </div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <DashboardHeader
                    userName={user?.fullName || user?.primaryEmailAddress?.emailAddress || 'User'}
                    onSignOut={() => signOut({ redirectUrl: '/' })}
                />
                <div className="container mx-auto px-4 py-20">
                    <Card className="max-w-2xl mx-auto text-center">
                        <CardHeader>
                            <CardTitle className="text-3xl">No Analysis Available</CardTitle>
                            <CardDescription>
                                Upload financial documents first to generate AI-powered insights
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <DashboardHeader
                userName={user?.fullName || user?.primaryEmailAddress?.emailAddress || 'User'}
                onSignOut={() => signOut({ redirectUrl: '/' })}
            />

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">AI-Powered Financial Analysis</h1>
                        <p className="text-muted-foreground">
                            Comprehensive insights and recommendations for your business
                        </p>
                    </div>
                    {analysis && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                const dashboardResponse = fetch('/api/dashboard').then(r => r.json());
                                dashboardResponse.then(data => {
                                    if (data.financialData?._id) {
                                        generateAnalysis(data.financialData._id);
                                    }
                                });
                            }}
                            disabled={generating}
                        >
                            {generating ? 'Regenerating...' : 'Regenerate Analysis'}
                        </Button>
                    )}
                </div>

                <AIResponseDisplay analysis={analysis} loading={generating} />
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
