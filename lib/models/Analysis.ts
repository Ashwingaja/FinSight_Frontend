import mongoose, { Schema, Model } from 'mongoose';

export interface IAnalysis {
  _id: string;
  userId: mongoose.Types.ObjectId;
  financialDataId: mongoose.Types.ObjectId;
  insights: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  recommendations: Array<{
    category: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    expectedImpact: string;
  }>;
  forecast: {
    revenue: Array<{ period: string; amount: number }>;
    expenses: Array<{ period: string; amount: number }>;
    cashFlow: Array<{ period: string; amount: number }>;
  };
  industryBenchmark?: {
    industry: string;
    metrics: any;
  };
  creditworthiness: {
    score: number;
    rating: string;
    factors: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    financialDataId: {
      type: Schema.Types.ObjectId,
      ref: 'FinancialData',
      required: true,
    },
    insights: {
      summary: String,
      strengths: [String],
      weaknesses: [String],
      opportunities: [String],
      threats: [String],
    },
    recommendations: [
      {
        category: String,
        priority: {
          type: String,
          enum: ['high', 'medium', 'low'],
        },
        title: String,
        description: String,
        expectedImpact: String,
      },
    ],
    forecast: {
      revenue: [
        {
          period: String,
          amount: Number,
        },
      ],
      expenses: [
        {
          period: String,
          amount: Number,
        },
      ],
      cashFlow: [
        {
          period: String,
          amount: Number,
        },
      ],
    },
    industryBenchmark: {
      industry: String,
      metrics: Schema.Types.Mixed,
    },
    creditworthiness: {
      score: Number,
      rating: String,
      factors: [String],
    },
  },
  {
    timestamps: true,
  }
);

const Analysis: Model<IAnalysis> = mongoose.models.Analysis || mongoose.model<IAnalysis>('Analysis', AnalysisSchema);

export default Analysis;
