import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Shield, Zap, TrendingUp, FileText, Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FinSight Pro
            </span>
          </div>
          <Link href="/auth/signin">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            AI-Powered Financial Health Assessment for SMEs
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your business finances with intelligent analysis, actionable insights, and data-driven recommendations
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/auth/signin">
              <Button size="lg" className="gap-2">
                Start Free Analysis <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need for Financial Success
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Brain className="h-10 w-10 text-blue-600" />}
            title="AI-Powered Insights"
            description="Get intelligent analysis of your financial data with actionable recommendations powered by advanced AI"
          />
          <FeatureCard
            icon={<FileText className="h-10 w-10 text-purple-600" />}
            title="Smart Document Processing"
            description="Upload CSV, Excel, or PDF files and let our ETL pipeline extract and analyze your financial data"
          />
          <FeatureCard
            icon={<TrendingUp className="h-10 w-10 text-green-600" />}
            title="Financial Forecasting"
            description="Predict future revenue, expenses, and cash flow with AI-driven forecasting models"
          />
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10 text-orange-600" />}
            title="Interactive Dashboards"
            description="Visualize your financial health with beautiful charts and real-time metrics"
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10 text-red-600" />}
            title="Risk Assessment"
            description="Identify financial risks early with comprehensive risk scoring and analysis"
          />
          <FeatureCard
            icon={<Zap className="h-10 w-10 text-yellow-600" />}
            title="Instant Reports"
            description="Generate investor-ready financial reports in seconds with professional formatting"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Business Finances?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of SMEs using FinSight Pro to make better financial decisions
          </p>
          <Link href="/auth/signin">
            <Button size="lg" variant="secondary" className="gap-2">
              Get Started Free <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 FinSight Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl border bg-white hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
