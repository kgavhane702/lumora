export interface SearchQuery {
  query: string;
  context?: string;
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
  includeReferences?: boolean;
  searchMode?: 'web' | 'documents' | 'both';
}

export interface SearchResult {
  answer: string;
  references: Reference[];
  modelUsed: string;
  confidence: number;
  searchTime: number;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface Reference {
  title: string;
  url: string;
  snippet: string;
  relevance: number;
  source: 'web' | 'document' | 'database';
}

export interface ReasoningStep {
  step: number;
  action: string;
  reasoning: string;
  result?: any;
  modelId?: string;
} 