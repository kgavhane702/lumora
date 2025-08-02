import { SearchQuery, SearchResult } from '../interfaces/search.interface';
import { AIModel } from '../interfaces/ai-model.interface';

export interface SearchStrategy {
  name: string;
  description: string;
  
  execute(query: SearchQuery, model: AIModel): Promise<SearchResult>;
  isApplicable(query: SearchQuery): boolean;
  getPriority(): number; // Higher priority strategies are tried first
}

export interface SearchStrategyContext {
  getAvailableModels(): Promise<AIModel[]>;
  getDefaultModel(): AIModel | undefined;
  setActiveModel(modelId: string): void;
} 