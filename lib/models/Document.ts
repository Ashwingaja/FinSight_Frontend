import mongoose, { Schema, Model } from 'mongoose';

export interface IDocument {
  _id: string;
  userId: mongoose.Types.ObjectId;
  fileName: string;
  fileType: 'csv' | 'xlsx' | 'xlsm' | 'pdf';
  fileSize: number;
  uploadDate: Date;
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  rawData?: any;
  processedData?: any;
  errorMessage?: string;
}

const DocumentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['csv', 'xlsx', 'xlsm', 'pdf'],
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'processed', 'failed'],
      default: 'uploaded',
    },
    rawData: Schema.Types.Mixed,
    processedData: Schema.Types.Mixed,
    errorMessage: String,
  },
  {
    timestamps: true,
  }
);

const Document: Model<IDocument> = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);

export default Document;
