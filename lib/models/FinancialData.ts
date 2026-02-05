import mongoose, { Schema, Model } from 'mongoose';

export interface IFinancialData {
  _id: string;
  userId: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
  period: {
    startDate: Date;
    endDate: Date;
  };
  revenue: {
    total: number;
    streams: Array<{ name: string; amount: number }>;
  };
  expenses: {
    total: number;
    categories: Array<{ name: string; amount: number }>;
  };
  cashFlow: {
    operating: number;
    investing: number;
    financing: number;
    net: number;
  };
  inventory?: {
    opening: number;
    closing: number;
    turnover: number;
  };
  loans?: Array<{
    type: string;
    amount: number;
    interestRate: number;
    emi: number;
  }>;
  accountsReceivable?: number;
  accountsPayable?: number;
  ratios: {
    currentRatio?: number;
    quickRatio?: number;
    debtToEquity?: number;
    profitMargin?: number;
    returnOnAssets?: number;
  };
  healthScore: number;
  riskScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialDataSchema = new Schema<IFinancialData>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    period: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    revenue: {
      total: { type: Number, required: true },
      streams: [
        {
          name: String,
          amount: Number,
        },
      ],
    },
    expenses: {
      total: { type: Number, required: true },
      categories: [
        {
          name: String,
          amount: Number,
        },
      ],
    },
    cashFlow: {
      operating: Number,
      investing: Number,
      financing: Number,
      net: Number,
    },
    inventory: {
      opening: Number,
      closing: Number,
      turnover: Number,
    },
    loans: [
      {
        type: String,
        amount: Number,
        interestRate: Number,
        emi: Number,
      },
    ],
    accountsReceivable: Number,
    accountsPayable: Number,
    ratios: {
      currentRatio: Number,
      quickRatio: Number,
      debtToEquity: Number,
      profitMargin: Number,
      returnOnAssets: Number,
    },
    healthScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const FinancialData: Model<IFinancialData> =
  mongoose.models.FinancialData || mongoose.model<IFinancialData>('FinancialData', FinancialDataSchema);

export default FinancialData;
