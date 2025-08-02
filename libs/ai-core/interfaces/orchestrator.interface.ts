import { AIModel, AIPrompt, AIResponse } from './ai-model.interface';
import { SearchQuery, SearchResult, Reference } from './search.interface';

export interface AIOrchestrator {
  // Core search functionality
  search(query: SearchQuery): Promise<SearchResult>;
  searchWithReasoning(query: SearchQuery): Promise<SearchResult & { reasoningSteps: any[] }>;
  
  // Model management
  getAvailableModels(): Promise<AIModel[]>;
  setActiveModel(modelId: string): void;
  getActiveModel(): AIModel | undefined;
  
  // Advanced features
  generateWithReferences(prompt: AIPrompt): Promise<AIResponse & { references: Reference[] }>;
  debateWithModels(query: SearchQuery, modelIds: string[]): Promise<{
    responses: AIResponse[];
    consensus?: string;
    disagreements?: string[];
  }>;
  
  // Streaming
  streamSearch(query: SearchQuery): AsyncGenerator<Partial<SearchResult>>;
  
  // Health and monitoring
  checkHealth(): Promise<{
    orchestrator: boolean;
    models: Record<string, boolean>;
    services: Record<string, boolean>;
  }>;
} 