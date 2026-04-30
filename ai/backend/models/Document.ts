import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  title: string;
  content: string;
  type: 'report' | 'proposal' | 'contract' | 'technical' | 'marketing' | 'other';
  languageStyle: 'formal' | 'concise' | 'detailed' | 'casual';
  status: 'draft' | 'reviewed' | 'approved';
  reviewReport?: IReviewReport;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewReport {
  grammarIssues: Array<{ position: string; issue: string; suggestion: string }>;
  spellingIssues: Array<{ position: string; word: string; suggestion: string }>;
  logicIssues: Array<{ position: string; issue: string; suggestion: string }>;
  sentimentAnalysis: {
    score: number;
    label: string;
    suggestions: string[];
  };
  overallRating: number;
  suggestions: string[];
  optimizedContent: string;
}

const ReviewReportSchema: Schema = new Schema({
  grammarIssues: [{
    position: { type: String, required: true },
    issue: { type: String, required: true },
    suggestion: { type: String, required: true }
  }],
  spellingIssues: [{
    position: { type: String, required: true },
    word: { type: String, required: true },
    suggestion: { type: String, required: true }
  }],
  logicIssues: [{
    position: { type: String, required: true },
    issue: { type: String, required: true },
    suggestion: { type: String, required: true }
  }],
  sentimentAnalysis: {
    score: { type: Number, required: true },
    label: { type: String, required: true },
    suggestions: [{ type: String }]
  },
  overallRating: { type: Number, required: true },
  suggestions: [{ type: String }],
  optimizedContent: { type: String, required: true }
});

const DocumentSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['report', 'proposal', 'contract', 'technical', 'marketing', 'other'],
    default: 'other'
  },
  languageStyle: {
    type: String,
    enum: ['formal', 'concise', 'detailed', 'casual'],
    default: 'formal'
  },
  status: {
    type: String,
    enum: ['draft', 'reviewed', 'approved'],
    default: 'draft'
  },
  reviewReport: ReviewReportSchema,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IDocument>('Document', DocumentSchema);