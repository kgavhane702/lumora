import { AIModel } from '../interfaces/ai-model.interface';

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

export interface ModelFactory {
  createModel(config: ModelConfig): Promise<AIModel>;
  validateModelConfig(config: ModelConfig): boolean;
  getSupportedProviders(): string[];
  getModelCapabilities(provider: string): Partial<AIModel['capabilities']>;
} 