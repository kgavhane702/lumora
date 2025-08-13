export interface Reference {
  id: string;
  title: string;
  url: string;
  snippet: string;
  relevance: number;
  source: 'web' | 'document' | 'database';
  domain?: string;
  publishedDate?: Date;
  author?: string;
}

export interface SearchResult {
  id: string;
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
  followUpQuestions?: string[];
  relatedTopics?: string[];
  timestamp: Date;
  query: string;
}

export interface SearchResultBuilder {
  setAnswer(answer: string): SearchResultBuilder;
  addReference(reference: Reference): SearchResultBuilder;
  setModelUsed(model: string): SearchResultBuilder;
  setConfidence(confidence: number): SearchResultBuilder;
  setSearchTime(time: number): SearchResultBuilder;
  setTokenUsage(usage: { prompt: number; completion: number; total: number }): SearchResultBuilder;
  addFollowUpQuestion(question: string): SearchResultBuilder;
  addRelatedTopic(topic: string): SearchResultBuilder;
  build(): SearchResult;
}
