import { AIModel } from '../interfaces/ai-model.interface';
import { ModelFactory, ModelConfig } from './model-factory.interface';
import { GPT4oStrategy } from '../strategies/gpt4o.strategy';

export class AIModelFactory implements ModelFactory {
  private modelCreators: Map<string, (config: ModelConfig) => Promise<AIModel>> = new Map();

  constructor() {
    this.registerModelCreators();
  }

  async createModel(config: ModelConfig): Promise<AIModel> {
    const creator = this.modelCreators.get(config.provider.toLowerCase());
    if (!creator) {
      throw new Error(`Unsupported provider: ${config.provider}`);
    }

    return await creator(config);
  }

  validateModelConfig(config: ModelConfig): boolean {
    if (!config.id || !config.name || !config.provider || !config.version) {
      return false;
    }

    if (!this.modelCreators.has(config.provider.toLowerCase())) {
      return false;
    }

    return true;
  }

  getSupportedProviders(): string[] {
    return Array.from(this.modelCreators.keys());
  }

  getModelCapabilities(provider: string): Partial<AIModel['capabilities']> {
    const capabilities: Record<string, Partial<AIModel['capabilities']>> = {
      'openai': {
        maxTokens: 128000,
        supportsStreaming: true,
        supportsFunctionCalling: true,
        supportsVision: true,
        supportsCodeGeneration: true,
        supportsReasoning: true,
        modelType: 'multimodal'
      },
      'anthropic': {
        maxTokens: 200000,
        supportsStreaming: true,
        supportsFunctionCalling: false,
        supportsVision: true,
        supportsCodeGeneration: true,
        supportsReasoning: true,
        modelType: 'chat'
      },
      'google': {
        maxTokens: 1000000,
        supportsStreaming: true,
        supportsFunctionCalling: true,
        supportsVision: true,
        supportsCodeGeneration: true,
        supportsReasoning: true,
        modelType: 'multimodal'
      }
    };

    return capabilities[provider.toLowerCase()] || {};
  }

  private registerModelCreators(): void {
    // OpenAI Models
    this.modelCreators.set('openai', async (config: ModelConfig) => {
      if (!config.apiKey) {
        throw new Error('API key is required for OpenAI models');
      }

      switch (config.id) {
        case 'gpt-4o':
          return new GPT4oStrategy(config.apiKey, config.endpoint);
        // Add more OpenAI models here
        default:
          throw new Error(`Unsupported OpenAI model: ${config.id}`);
      }
    });

    // Anthropic Models (placeholder for future implementation)
    this.modelCreators.set('anthropic', async (config: ModelConfig) => {
      throw new Error('Anthropic models not yet implemented');
    });

    // Google Models (placeholder for future implementation)
    this.modelCreators.set('google', async (config: ModelConfig) => {
      throw new Error('Google models not yet implemented');
    });
  }
} 