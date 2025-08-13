export interface SearchQuery {
  query: string;
  context?: string;
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
  includeReferences?: boolean;
  searchMode?: 'web' | 'documents' | 'both';
  focus?: 'concise' | 'detailed' | 'creative';
  language?: string;
  timestamp?: Date;
}

export interface SearchQueryBuilder {
  setQuery(query: string): SearchQueryBuilder;
  setContext(context: string): SearchQueryBuilder;
  setModel(modelId: string): SearchQueryBuilder;
  setTemperature(temp: number): SearchQueryBuilder;
  setMaxTokens(tokens: number): SearchQueryBuilder;
  setIncludeReferences(include: boolean): SearchQueryBuilder;
  setSearchMode(mode: 'web' | 'documents' | 'both'): SearchQueryBuilder;
  setFocus(focus: 'concise' | 'detailed' | 'creative'): SearchQueryBuilder;
  setLanguage(language: string): SearchQueryBuilder;
  build(): SearchQuery;
}
