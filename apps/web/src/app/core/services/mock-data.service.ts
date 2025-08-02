import { Injectable } from '@angular/core';
import { SearchQuery } from '../../shared/interfaces/search-query';
import { SearchResult, Reference } from '../../shared/interfaces/search-result';
import { ChatMessage, ChatSession } from '../../shared/interfaces/chat-message';
import { AIModel } from '../../shared/interfaces/ai-model';
import { APP_CONSTANTS } from '../../shared/constants/app-constants';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  // Mock AI Models
  getMockModels(): AIModel[] {
    return [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        version: '2024-05-13',
        capabilities: {
          maxTokens: 128000,
          supportsStreaming: true,
          supportsFunctionCalling: true,
          supportsVision: true,
          supportsCodeGeneration: true,
          supportsReasoning: true,
          modelType: 'multimodal',
          contextWindow: 128000,
          costPerToken: { input: 0.000005, output: 0.000015 }
        },
        isAvailable: true,
        isDefault: true,
        description: 'Most capable model for complex reasoning',
        tags: ['latest', 'multimodal', 'reasoning']
      },
      {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        version: '2024-06-20',
        capabilities: {
          maxTokens: 200000,
          supportsStreaming: true,
          supportsFunctionCalling: true,
          supportsVision: true,
          supportsCodeGeneration: true,
          supportsReasoning: true,
          modelType: 'multimodal',
          contextWindow: 200000,
          costPerToken: { input: 0.000003, output: 0.000015 }
        },
        isAvailable: true,
        description: 'Fast and efficient for most tasks',
        tags: ['fast', 'efficient', 'multimodal']
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'Google',
        version: '2024-02-15',
        capabilities: {
          maxTokens: 1000000,
          supportsStreaming: true,
          supportsFunctionCalling: true,
          supportsVision: true,
          supportsCodeGeneration: true,
          supportsReasoning: true,
          modelType: 'multimodal',
          contextWindow: 1000000,
          costPerToken: { input: 0.00000375, output: 0.000015 }
        },
        isAvailable: true,
        description: 'Ultra-long context window',
        tags: ['long-context', 'multimodal', 'google']
      }
    ];
  }

  // Mock Search Results
  getMockSearchResults(): SearchResult[] {
    return [
      {
        id: '1',
        answer: 'The latest iPhone 15 Pro features a 6.1-inch Super Retina XDR display with ProMotion technology, A17 Pro chip, and a 48MP main camera. It was released in September 2023 and starts at $999.',
        references: [
          {
            id: 'ref1',
            title: 'iPhone 15 Pro - Apple',
            url: 'https://www.apple.com/iphone-15-pro/',
            snippet: 'iPhone 15 Pro features a 6.1-inch Super Retina XDR display with ProMotion technology...',
            relevance: 0.95,
            source: 'web',
            domain: 'apple.com',
            publishedDate: new Date('2023-09-12')
          },
          {
            id: 'ref2',
            title: 'iPhone 15 Pro Review - TechCrunch',
            url: 'https://techcrunch.com/iphone-15-pro-review',
            snippet: 'The iPhone 15 Pro represents Apple\'s most advanced smartphone yet...',
            relevance: 0.88,
            source: 'web',
            domain: 'techcrunch.com',
            publishedDate: new Date('2023-09-15')
          }
        ],
        modelUsed: 'gpt-4o',
        confidence: 0.92,
        searchTime: 2.3,
        tokenUsage: { prompt: 150, completion: 89, total: 239 },
        followUpQuestions: [
          'What are the differences between iPhone 15 Pro and iPhone 15 Pro Max?',
          'How does the A17 Pro chip compare to previous generations?',
          'What are the new camera features in iPhone 15 Pro?'
        ],
        relatedTopics: ['iPhone 15', 'A17 Pro chip', 'ProMotion', '48MP camera'],
        timestamp: new Date(),
        query: 'iPhone 15 Pro specifications and features'
      }
    ];
  }

  // Mock Chat Messages
  getMockChatMessages(): ChatMessage[] {
    return [
      {
        id: '1',
        content: 'What are the latest features of iPhone 15 Pro?',
        role: 'user',
        timestamp: new Date(Date.now() - 300000),
        modelUsed: 'gpt-4o'
      },
      {
        id: '2',
        content: 'The iPhone 15 Pro features several notable improvements:\n\n• **A17 Pro chip** - First 3nm chip with 6-core GPU\n• **48MP main camera** - Enhanced low-light performance\n• **Titanium design** - Lighter and more durable\n• **Action button** - Customizable for quick actions\n• **USB-C port** - Faster data transfer\n• **ProMotion display** - Up to 120Hz refresh rate\n\nThe phone starts at $999 and was released in September 2023.',
        role: 'assistant',
        timestamp: new Date(Date.now() - 240000),
        modelUsed: 'gpt-4o',
        confidence: 0.94,
        references: [
          {
            id: 'ref1',
            title: 'iPhone 15 Pro - Apple',
            url: 'https://www.apple.com/iphone-15-pro/',
            snippet: 'iPhone 15 Pro features a 6.1-inch Super Retina XDR display...',
            relevance: 0.95,
            source: 'web',
            domain: 'apple.com'
          }
        ],
        metadata: {
          searchTime: 2.1,
          tokenUsage: { prompt: 120, completion: 156, total: 276 },
          followUpQuestions: [
            'How does the A17 Pro chip compare to A16?',
            'What are the camera improvements?',
            'Is the titanium design worth the upgrade?'
          ]
        }
      }
    ];
  }

  // Mock Chat Sessions
  getMockChatSessions(): ChatSession[] {
    return [
      {
        id: '1',
        title: 'iPhone 15 Pro Discussion',
        messages: this.getMockChatMessages(),
        createdAt: new Date(Date.now() - 600000),
        updatedAt: new Date(Date.now() - 240000),
        modelUsed: 'gpt-4o',
        isActive: true
      },
      {
        id: '2',
        title: 'AI Technology Trends',
        messages: [],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
        modelUsed: 'claude-3-5-sonnet',
        isActive: false
      }
    ];
  }

  // Mock Search Query
  getMockSearchQuery(): SearchQuery {
    return {
      query: 'iPhone 15 Pro specifications and features',
      context: 'Looking for detailed information about the latest iPhone model',
      modelId: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000,
      includeReferences: true,
      searchMode: 'both',
      focus: 'detailed',
      language: 'en',
      timestamp: new Date()
    };
  }
} 