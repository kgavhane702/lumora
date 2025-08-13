export interface AIModelCapabilities {
  maxTokens: number;
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  supportsVision: boolean;
  supportsCodeGeneration: boolean;
  supportsReasoning: boolean;
  modelType: 'chat' | 'completion' | 'multimodal';
  contextWindow: number;
  costPerToken?: {
    input: number;
    output: number;
  };
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  version: string;
  capabilities: AIModelCapabilities;
  isAvailable: boolean;
  isDefault?: boolean;
  description?: string;
  tags?: string[];
}

export interface ModelSelector {
  selectedModel: AIModel;
  availableModels: AIModel[];
  onModelChange: (model: AIModel) => void;
}

export interface ModelRegistry {
  getAvailableModels(): AIModel[];
  getDefaultModel(): AIModel;
  setDefaultModel(modelId: string): void;
  isModelAvailable(modelId: string): boolean;
}
