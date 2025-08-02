import { AIModel, AIPrompt } from '../interfaces/ai-model.interface';
import { AIOrchestrator } from '../interfaces/orchestrator.interface';
import { SearchQuery, SearchResult, Reference } from '../interfaces/search.interface';
import { SearchStrategy } from '../strategies/search-strategy.interface';
import { DirectSearchStrategy } from '../strategies/direct-search.strategy';
import { ReasoningSearchStrategy } from '../strategies/reasoning-search.strategy';
import { AIModelRegistry } from '../registry/model-registry';

export class SearchOrchestrator implements AIOrchestrator {
  private modelRegistry: AIModelRegistry;
  private activeModelId: string | undefined;
  private searchStrategies: SearchStrategy[] = [];

  constructor(modelRegistry: AIModelRegistry) {
    this.modelRegistry = modelRegistry;
    this.initializeStrategies();
  }

  async search(query: SearchQuery): Promise<SearchResult> {
    const model = this.getModelForQuery(query);
    if (!model) {
      throw new Error('No available AI model found');
    }

    // Find the best strategy for this query
    const strategy = this.selectStrategy(query);
    return await strategy.execute(query, model);
  }

  async searchWithReasoning(query: SearchQuery): Promise<SearchResult & { reasoningSteps: any[] }> {
    const model = this.getModelForQuery(query);
    if (!model) {
      throw new Error('No available AI model found');
    }

    // Use reasoning strategy for detailed analysis
    const reasoningStrategy = new ReasoningSearchStrategy();
    return await reasoningStrategy.execute(query, model);
  }

  async getAvailableModels(): Promise<AIModel[]> {
    return await this.modelRegistry.getAvailableModels();
  }

  setActiveModel(modelId: string): void {
    const model = this.modelRegistry.getModel(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }
    this.activeModelId = modelId;
  }

  getActiveModel(): AIModel | undefined {
    if (this.activeModelId) {
      return this.modelRegistry.getModel(this.activeModelId);
    }
    return this.modelRegistry.getDefaultModel();
  }

  async generateWithReferences(prompt: AIPrompt): Promise<any> {
    const model = this.getActiveModel();
    if (!model) {
      throw new Error('No active model available');
    }

    const response = await model.generateResponse(prompt);
    const references = await this.extractReferences(prompt.content, response.content);

    return {
      ...response,
      references,
    };
  }

  async debateWithModels(query: SearchQuery, modelIds: string[]): Promise<{
    responses: any[];
    consensus?: string;
    disagreements?: string[];
  }> {
    const responses: any[] = [];
    const models: AIModel[] = [];

    // Get all requested models
    for (const modelId of modelIds) {
      const model = this.modelRegistry.getModel(modelId);
      if (model) {
        models.push(model);
      }
    }

    if (models.length === 0) {
      throw new Error('No valid models found for debate');
    }

    // Generate responses from all models
    const searchPromises = models.map(async (model) => {
      const strategy = this.selectStrategy(query);
      const result = await strategy.execute(query, model);
      return {
        modelId: model.id,
        modelName: model.name,
        response: result.answer,
        confidence: result.confidence,
      };
    });

    const modelResponses = await Promise.all(searchPromises);
    responses.push(...modelResponses);

    // Analyze consensus and disagreements
    const consensus = this.analyzeConsensus(modelResponses);
    const disagreements = this.analyzeDisagreements(modelResponses);

    return {
      responses,
      consensus,
      disagreements,
    };
  }

  async *streamSearch(query: SearchQuery): AsyncGenerator<Partial<SearchResult>> {
    const model = this.getModelForQuery(query);
    if (!model) {
      throw new Error('No available AI model found');
    }

    const prompt: AIPrompt = {
      content: query.query,
      context: query.context,
      temperature: query.temperature || 0.7,
      maxTokens: query.maxTokens || 4000,
      stream: true,
    };

    let accumulatedContent = '';
    
    for await (const response of model.generateStreamingResponse!(prompt)) {
      accumulatedContent = response.content;
      
      yield {
        answer: accumulatedContent,
        modelUsed: model.id,
        confidence: this.calculateConfidence(response),
      };
    }

    // Final yield with complete result
    const references: Reference[] = query.includeReferences 
      ? await this.extractReferences(query.query, accumulatedContent)
      : [];

    yield {
      answer: accumulatedContent,
      references,
      modelUsed: model.id,
      confidence: this.calculateConfidence({ content: accumulatedContent, modelId: model.id, provider: model.provider }),
    };
  }

  async checkHealth(): Promise<{
    orchestrator: boolean;
    models: Record<string, boolean>;
    services: Record<string, boolean>;
  }> {
    const modelHealth = await this.modelRegistry.checkAllModelsHealth();
    
    return {
      orchestrator: true,
      models: modelHealth,
      services: {
        search: true,
        reasoning: true,
        streaming: true,
      },
    };
  }

  // Strategy management
  addSearchStrategy(strategy: SearchStrategy): void {
    this.searchStrategies.push(strategy);
    // Sort by priority (higher priority first)
    this.searchStrategies.sort((a, b) => b.getPriority() - a.getPriority());
  }

  private initializeStrategies(): void {
    // Add default strategies
    this.addSearchStrategy(new ReasoningSearchStrategy());
    this.addSearchStrategy(new DirectSearchStrategy());
  }

  private selectStrategy(query: SearchQuery): SearchStrategy {
    // Find the first applicable strategy
    for (const strategy of this.searchStrategies) {
      if (strategy.isApplicable(query)) {
        return strategy;
      }
    }

    // Fallback to direct search
    return new DirectSearchStrategy();
  }

  private getModelForQuery(query: SearchQuery): AIModel | undefined {
    // Use specified model if provided
    if (query.modelId) {
      return this.modelRegistry.getModel(query.modelId);
    }

    // Use active model if set
    if (this.activeModelId) {
      return this.modelRegistry.getModel(this.activeModelId);
    }

    // Use default model
    return this.modelRegistry.getDefaultModel();
  }

  private async extractReferences(query: string, content: string): Promise<Reference[]> {
    const references: Reference[] = [];
    
    // Extract URLs from content
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = content.match(urlRegex) || [];
    
    urls.forEach((url, index) => {
      references.push({
        title: `Reference ${index + 1}`,
        url,
        snippet: `Extracted from AI response`,
        relevance: 0.8,
        source: 'web',
      });
    });

    return references;
  }

  private calculateConfidence(response: any): number {
    let confidence = 0.7;
    
    if (response.metadata?.finishReason === 'stop') {
      confidence += 0.2;
    }
    
    if (response.content.length > 100) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  private analyzeConsensus(responses: any[]): string | undefined {
    if (responses.length <= 1) return undefined;
    
    const answers = responses.map(r => r.response.toLowerCase());
    const commonWords = this.findCommonWords(answers);
    
    if (commonWords.length > 0) {
      return `Models agree on: ${commonWords.join(', ')}`;
    }
    
    return undefined;
  }

  private analyzeDisagreements(responses: any[]): string[] {
    if (responses.length <= 1) return [];
    
    const disagreements: string[] = [];
    
    for (let i = 0; i < responses.length; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        const diff = this.findDifferences(responses[i].response, responses[j].response);
        if (diff.length > 0) {
          disagreements.push(`Models ${responses[i].modelName} and ${responses[j].modelName} differ on: ${diff.join(', ')}`);
        }
      }
    }
    
    return disagreements;
  }

  private findCommonWords(answers: string[]): string[] {
    const words = answers.flatMap(answer => answer.split(' '));
    const wordCount = new Map<string, number>();
    
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });
    
    return Array.from(wordCount.entries())
      .filter(([_, count]) => count > 1)
      .map(([word, _]) => word)
      .slice(0, 5);
  }

  private findDifferences(answer1: string, answer2: string): string[] {
    const words1 = new Set(answer1.toLowerCase().split(' '));
    const words2 = new Set(answer2.toLowerCase().split(' '));
    
    const unique1 = Array.from(words1).filter(word => !words2.has(word));
    const unique2 = Array.from(words2).filter(word => !words1.has(word));
    
    return [...unique1, ...unique2].slice(0, 3);
  }
} 