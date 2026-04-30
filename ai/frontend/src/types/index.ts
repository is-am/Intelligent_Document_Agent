export type DocumentType = 'report' | 'proposal' | 'contract' | 'technical' | 'marketing' | 'other';
export type LanguageStyle = 'formal' | 'concise' | 'detailed' | 'casual';
export type DocumentStatus = 'draft' | 'reviewed' | 'approved';

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

export interface IDocument {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  languageStyle: LanguageStyle;
  status: DocumentStatus;
  reviewReport?: IReviewReport;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateRequest {
  title: string;
  content: string;
  type: DocumentType;
  languageStyle: LanguageStyle;
}

export interface ReviewRequest {
  documentId?: string;
  content: string;
}

export interface FormatRequest {
  content: string;
  format: 'markdown' | 'html' | 'plain';
}