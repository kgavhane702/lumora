import { SearchStrategy } from './search-strategy.interface';
import { SearchQuery, SearchResult, Reference } from '../interfaces/search.interface';
import { AIModel, AIPrompt } from '../interfaces/ai-model.interface';

export class DirectSearchStrategy implements SearchStrategy {
  name = 'Direct Search';
  description = 'Direct AI model query without additional processing';

  async execute(query: SearchQuery, model: AIModel): Promise<SearchResult> {
    const startTime = Date.now();

    const prompt: AIPrompt = {
      content: query.query,
      context: query.context,
      temperature: query.temperature || 0.7,
      maxTokens: query.maxTokens || 4000,
    };

    const response = await model.generateResponse(prompt);
    
    const references: Reference[] = query.includeReferences 
      ? await this.extractReferences(query.query, response.content)
      : [];

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
    };
  }

  isApplicable(query: SearchQuery): boolean {
    // Direct search is applicable for most queries
    return true;
  }

  getPriority(): number {
    return 1; // Medium priority
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
} 