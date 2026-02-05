'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
    BarChart3,
    TrendingUp,
    AlertCircle,
    Lightbulb,
    Target,
    Award,
    AlertTriangle,
} from 'lucide-react';

interface AIResponseDisplayProps {
    analysis: any;
    loading?: boolean;
}

export function AIResponseDisplay({ analysis, loading }: AIResponseDisplayProps) {
    if (loading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
                <div className="grid md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-5 w-32" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-32 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!analysis) {
        return null;
    }

    // Group insights by severity for display
    const positiveInsights = Array.isArray(analysis.insights)
        ? analysis.insights.filter((i: any) => i.severity === 'positive')
        : [];
    const warningInsights = Array.isArray(analysis.insights)
        ? analysis.insights.filter((i: any) => i.severity === 'warning' || i.severity === 'critical')
        : [];
    const growthInsights = Array.isArray(analysis.insights)
        ? analysis.insights.filter((i: any) =>
            i.category === 'revenue' && i.severity !== 'critical' && i.severity !== 'warning'
        )
        : [];
    const riskInsights = Array.isArray(analysis.insights)
        ? analysis.insights.filter((i: any) =>
            (i.category === 'risk' || i.category === 'cash_flow' || i.category === 'debt') &&
            (i.severity === 'critical' || i.severity === 'warning')
        )
        : [];

    return (
        <div className="space-y-8">
            {/* Executive Summary */}
            {analysis.aiSummary && (
                <Card className="border-primary/20 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <BarChart3 className="h-7 w-7 text-primary" />
                            Executive Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg leading-relaxed text-foreground/90">
                            {analysis.aiSummary}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Credit Assessment */}
            {analysis.scores?.creditworthiness && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-6 w-6 text-primary" />
                            Credit Assessment
                        </CardTitle>
                        <CardDescription>Your business creditworthiness evaluation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-8 mb-6">
                            <div className="text-center">
                                <div className="text-5xl font-bold text-primary mb-2">
                                    {analysis.scores.creditworthiness.score}
                                </div>
                                <div className="text-sm text-muted-foreground">Credit Score</div>
                            </div>
                            <div className="flex-1">
                                <Progress
                                    value={analysis.scores.creditworthiness.score}
                                    className="h-4 mb-2"
                                />
                                <Badge
                                    variant={
                                        ['AAA', 'AA', 'A'].includes(analysis.scores.creditworthiness.rating)
                                            ? 'success'
                                            : ['BBB', 'BB', 'B'].includes(analysis.scores.creditworthiness.rating)
                                                ? 'default'
                                                : 'destructive'
                                    }
                                    className="text-base px-4 py-1"
                                >
                                    {analysis.scores.creditworthiness.rating}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Insights Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths (Positive Insights) */}
                <Card className="border-green-200 bg-green-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <TrendingUp className="h-5 w-5" />
                            Strengths
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {positiveInsights.length > 0 ? (
                            <ul className="space-y-2.5">
                                {positiveInsights.map((insight: any, index: number) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5 font-bold">✓</span>
                                        <div className="text-sm leading-relaxed">
                                            <strong>{insight.title}:</strong> {insight.description}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No positive insights identified yet.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Weaknesses (Warning/Critical Insights) */}
                <Card className="border-red-200 bg-red-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="h-5 w-5" />
                            Areas for Improvement
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {warningInsights.length > 0 ? (
                            <ul className="space-y-2.5">
                                {warningInsights.map((insight: any, index: number) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-red-600 mt-0.5 font-bold">!</span>
                                        <div className="text-sm leading-relaxed">
                                            <strong>{insight.title}:</strong> {insight.description}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No critical issues identified.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Opportunities (Growth Insights) */}
                <Card className="border-blue-200 bg-blue-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <Lightbulb className="h-5 w-5" />
                            Growth Opportunities
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {growthInsights.length > 0 ? (
                            <ul className="space-y-2.5">
                                {growthInsights.map((insight: any, index: number) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-0.5 font-bold">→</span>
                                        <div className="text-sm leading-relaxed">
                                            <strong>{insight.title}:</strong> {insight.description}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">Focus on addressing current issues first.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Threats (Risk Insights) */}
                <Card className="border-orange-200 bg-orange-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-700">
                            <AlertTriangle className="h-5 w-5" />
                            Risk Factors
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {riskInsights.length > 0 ? (
                            <ul className="space-y-2.5">
                                {riskInsights.map((insight: any, index: number) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-orange-600 mt-0.5 font-bold">⚠</span>
                                        <div className="text-sm leading-relaxed">
                                            <strong>{insight.title}:</strong> {insight.impact}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No major risk factors detected.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-6 w-6 text-primary" />
                            Actionable Recommendations
                        </CardTitle>
                        <CardDescription>
                            Prioritized actions to improve your financial health
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-5">
                            {analysis.recommendations.map((rec: any, index: number) => (
                                <div
                                    key={index}
                                    className="border-l-4 border-primary pl-5 py-3 bg-muted/30 rounded-r-lg"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge
                                            variant={
                                                rec.priority === 'high'
                                                    ? 'destructive'
                                                    : rec.priority === 'medium'
                                                        ? 'default'
                                                        : 'secondary'
                                            }
                                        >
                                            {rec.priority} priority
                                        </Badge>
                                        <span className="font-semibold text-lg">{rec.title}</span>
                                    </div>
                                    <p className="text-muted-foreground mb-2 leading-relaxed">
                                        {rec.description}
                                    </p>
                                    {rec.expectedImpact && (
                                        <p className="text-sm text-green-600 font-medium">
                                            💡 Expected Impact: {rec.expectedImpact}
                                        </p>
                                    )}
                                    {rec.actionItems && rec.actionItems.length > 0 && (
                                        <ul className="mt-3 space-y-1 text-sm">
                                            {rec.actionItems.map((item: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-primary mt-0.5">▸</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
