import { AIModel, AIModelCapabilities } from '../interfaces/ai-model.interface';
import { ModelRegistry, ModelConfig } from '../interfaces/model-registry.interface';

export class AIModelRegistry implements ModelRegistry {
  private models: Map<string, AIModel> = new Map();
  private defaultModelId: string | undefined;

  // Model registration
  registerModel(model: AIModel): void {
    this.models.set(model.id, model);
    console.log(`Registered AI model: ${model.name} (${model.id})`);
  }

  unregisterModel(modelId: string): void {
    const model = this.models.get(modelId);
    if (model) {
      this.models.delete(modelId);
      console.log(`Unregistered AI model: ${model.name} (${modelId})`);
      
      // If this was the default model, clear the default
      if (this.defaultModelId === modelId) {
        this.defaultModelId = undefined;
      }
    }
  }

  // Model discovery
  getModel(modelId: string): AIModel | undefined {
    return this.models.get(modelId);
  }

  getAllModels(): AIModel[] {
    return Array.from(this.models.values());
  }

  async getAvailableModels(): Promise<AIModel[]> {
    const availableModels: AIModel[] = [];
    
    for (const model of this.models.values()) {
      try {
        const isAvailable = await model.isAvailable();
        if (isAvailable) {
          availableModels.push(model);
        }
      } catch (error) {
        console.warn(`Model ${model.id} availability check failed:`, error);
      }
    }
    
    return availableModels;
  }

  // Model filtering
  getModelsByProvider(provider: string): AIModel[] {
    return Array.from(this.models.values()).filter(
      model => model.provider.toLowerCase() === provider.toLowerCase()
    );
  }

  getModelsByCapability(capability: keyof AIModelCapabilities): AIModel[] {
    return Array.from(this.models.values()).filter(
      model => model.capabilities[capability] === true
    );
  }

  // Model selection
  getDefaultModel(): AIModel | undefined {
    if (this.defaultModelId) {
      return this.models.get(this.defaultModelId);
    }
    
    // Fallback to first available model
    const availableModels = Array.from(this.models.values());
    return availableModels.length > 0 ? availableModels[0] : undefined;
  }

  setDefaultModel(modelId: string): void {
    if (this.models.has(modelId)) {
      this.defaultModelId = modelId;
      console.log(`Set default model to: ${modelId}`);
    } else {
      throw new Error(`Model ${modelId} not found in registry`);
    }
  }

  // Health checks
  async checkModelHealth(modelId: string): Promise<boolean> {
    const model = this.models.get(modelId);
    if (!model) {
      return false;
    }
    
    try {
      return await model.isAvailable();
    } catch (error) {
      console.error(`Health check failed for model ${modelId}:`, error);
      return false;
    }
  }

  async checkAllModelsHealth(): Promise<Record<string, boolean>> {
    const healthStatus: Record<string, boolean> = {};
    
    for (const [modelId, model] of this.models.entries()) {
      try {
        healthStatus[modelId] = await model.isAvailable();
      } catch (error) {
        healthStatus[modelId] = false;
        console.error(`Health check failed for model ${modelId}:`, error);
      }
    }
    
    return healthStatus;
  }

  // Utility methods
  getModelCount(): number {
    return this.models.size;
  }

  getProviders(): string[] {
    const providers = new Set<string>();
    for (const model of this.models.values()) {
      providers.add(model.provider);
    }
    return Array.from(providers);
  }

  clear(): void {
    this.models.clear();
    this.defaultModelId = undefined;
    console.log('Cleared all models from registry');
  }
} 