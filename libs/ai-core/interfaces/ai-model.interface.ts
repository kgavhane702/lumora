export interface AIModelCapabilities {
  maxTokens: number;
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  supportsVision: boolean;
  supportsCodeGeneration: boolean;
  supportsReasoning: boolean;
  modelType: 'chat' | 'completion' | 'multimodal';
}

export interface AIResponse {
  content: string;
  modelId: string;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: {
    finishReason?: string;
    latency?: number;
    confidence?: number;
  };
}

export interface AIPrompt {
  content: string;
  systemPrompt?: string;
  context?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  version: string;
  capabilities: AIModelCapabilities;
  
  // Core methods
  generateResponse(prompt: AIPrompt): Promise<AIResponse>;
  generateStreamingResponse?(prompt: AIPrompt): AsyncGenerator<AIResponse>;
  
  // Model management
  isAvailable(): Promise<boolean>;
  getCapabilities(): AIModelCapabilities;
  
  // Optional advanced features
  generateWithFunctions?(prompt: AIPrompt, functions: any[]): Promise<AIResponse>;
  generateWithVision?(prompt: AIPrompt, images: string[]): Promise<AIResponse>;
} 