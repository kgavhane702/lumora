import { SearchStrategy } from './search-strategy.interface';
import { SearchQuery, SearchResult, Reference, ReasoningStep } from '../interfaces/search.interface';
import { AIModel, AIPrompt } from '../interfaces/ai-model.interface';

export class ReasoningSearchStrategy implements SearchStrategy {
  name = 'Reasoning Search';
  description = 'Multi-step reasoning approach with detailed analysis';

  async execute(query: SearchQuery, model: AIModel): Promise<SearchResult & { reasoningSteps: ReasoningStep[] }> {
    const startTime = Date.now();
    const reasoningSteps: ReasoningStep[] = [];

    // Step 1: Analyze the query
    reasoningSteps.push({
      step: 1,
      action: 'query_analysis',
      reasoning: 'Analyzing the search query to understand intent and requirements',
      modelId: model.id,
    });

    // Step 2: Generate search strategy
    const strategyPrompt: AIPrompt = {
      content: `Analyze this search query and provide a search strategy: "${query.query}"`,
      systemPrompt: 'You are a search strategy expert. Provide a clear, step-by-step approach for answering this query.',
      temperature: 0.3,
    };

    const strategyResponse = await model.generateResponse(strategyPrompt);
    reasoningSteps.push({
      step: 2,
      action: 'strategy_generation',
      reasoning: strategyResponse.content,
      result: strategyResponse,
      modelId: model.id,
    });

    // Step 3: Execute the search
    const searchPrompt: AIPrompt = {
      content: query.query,
      context: query.context,
      systemPrompt: 'You are a helpful AI assistant. Provide accurate, well-reasoned answers with clear explanations.',
      temperature: query.temperature || 0.7,
      maxTokens: query.maxTokens || 4000,
    };

    const response = await model.generateResponse(searchPrompt);
    reasoningSteps.push({
      step: 3,
      action: 'response_generation',
      reasoning: 'Generated comprehensive answer based on the search strategy',
      result: response,
      modelId: model.id,
    });

    // Step 4: Extract references
    const references: Reference[] = query.includeReferences 
      ? await this.extractReferences(query.query, response.content)
      : [];

    reasoningSteps.push({
      step: 4,
      action: 'reference_extraction',
      reasoning: `Extracted ${references.length} relevant references`,
      result: references,
    });

    const searchTime = Date.now() - startTime;

    return {
      answer: response.content,
      references,
      modelUsed: model.id,
      confidence: this.calculateConfidence(response),
      searchTime,
      tokenUsage: response.usage ? {
        prompt: response.usage.promptTokens,
        completion: response.usage.completionTokens,
        total: response.usage.totalTokens,
      } : undefined,
      reasoningSteps,
    };
  }

  isApplicable(query: SearchQuery): boolean {
    // Reasoning search is best for complex queries
    return query.query.length > 50 || query.query.includes('why') || query.query.includes('how');
  }

  getPriority(): number {
    return 2; // Higher priority for complex queries
  }

  private async extractReferences(query: string, content: string): Promise<Reference[]> {
    const references: Reference[] = [];
    
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
    let confidence = 0.8; // Higher base confidence for reasoning approach
    
    if (response.metadata?.finishReason === 'stop') {
      confidence += 0.15;
    }
    
    if (response.content.length > 200) {
      confidence += 0.05;
    }
    
    return Math.min(confidence, 1.0);
  }
} 