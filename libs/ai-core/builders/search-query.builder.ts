import { SearchQuery } from '../interfaces/search.interface';

export class SearchQueryBuilder {
  private query: SearchQuery = {
    query: '',
    temperature: 0.7,
    maxTokens: 4000,
    includeReferences: true,
    searchMode: 'both'
  };

  setQuery(query: string): SearchQueryBuilder {
    this.query.query = query;
    return this;
  }

  setContext(context: string): SearchQueryBuilder {
    this.query.context = context;
    return this;
  }

  setModelId(modelId: string): SearchQueryBuilder {
    this.query.modelId = modelId;
    return this;
  }

  setTemperature(temperature: number): SearchQueryBuilder {
    this.query.temperature = Math.max(0, Math.min(2, temperature));
    return this;
  }

  setMaxTokens(maxTokens: number): SearchQueryBuilder {
    this.query.maxTokens = Math.max(1, maxTokens);
    return this;
  }

  setIncludeReferences(includeReferences: boolean): SearchQueryBuilder {
    this.query.includeReferences = includeReferences;
    return this;
  }

  setSearchMode(searchMode: 'web' | 'documents' | 'both'): SearchQueryBuilder {
    this.query.searchMode = searchMode;
    return this;
  }

  // Fluent interface methods for common configurations
  forWebSearch(): SearchQueryBuilder {
    this.query.searchMode = 'web';
    return this;
  }

  forDocumentSearch(): SearchQueryBuilder {
    this.query.searchMode = 'documents';
    return this;
  }

  withHighCreativity(): SearchQueryBuilder {
    this.query.temperature = 0.9;
    return this;
  }

  withLowCreativity(): SearchQueryBuilder {
    this.query.temperature = 0.3;
    return this;
  }

  withLongResponse(): SearchQueryBuilder {
    this.query.maxTokens = 8000;
    return this;
  }

  withShortResponse(): SearchQueryBuilder {
    this.query.maxTokens = 1000;
    return this;
  }

  withoutReferences(): SearchQueryBuilder {
    this.query.includeReferences = false;
    return this;
  }

  build(): SearchQuery {
    if (!this.query.query) {
      throw new Error('Query text is required');
    }
    return { ...this.query };
  }

  // Static factory methods for common query types
  static createSimpleQuery(query: string): SearchQuery {
    return new SearchQueryBuilder()
      .setQuery(query)
      .build();
  }

  static createWebSearchQuery(query: string): SearchQuery {
    return new SearchQueryBuilder()
      .setQuery(query)
      .forWebSearch()
      .build();
  }

  static createCreativeQuery(query: string): SearchQuery {
    return new SearchQueryBuilder()
      .setQuery(query)
      .withHighCreativity()
      .withLongResponse()
      .build();
  }

  static createPreciseQuery(query: string): SearchQuery {
    return new SearchQueryBuilder()
      .setQuery(query)
      .withLowCreativity()
      .withShortResponse()
      .build();
  }
} 