import { AIModel } from './ai-model.interface';

export interface ModelRegistry {
  // Model registration
  registerModel(model: AIModel): void;
  unregisterModel(modelId: string): void;
  
  // Model discovery
  getModel(modelId: string): AIModel | undefined;
  getAllModels(): AIModel[];
  getAvailableModels(): Promise<AIModel[]>;
  
  // Model filtering
  getModelsByProvider(provider: string): AIModel[];
  getModelsByCapability(capability: keyof AIModel['capabilities']): AIModel[];
  
  // Model selection
  getDefaultModel(): AIModel | undefined;
  setDefaultModel(modelId: string): void;
  
  // Health checks
  checkModelHealth(modelId: string): Promise<boolean>;
  checkAllModelsHealth(): Promise<Record<string, boolean>>;
}

export interface ModelFactory {
  createModel(config: any): Promise<AIModel>;
  validateModelConfig(config: any): boolean;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  version: string;
  apiKey?: string;
  endpoint?: string;
  capabilities: Partial<AIModel['capabilities']>;
  settings?: Record<string, any>;
} 