import { SearchResult, Reference } from './search-result';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  searchResult?: SearchResult;
  references?: Reference[];
  modelUsed?: string;
  confidence?: number;
  isStreaming?: boolean;
  metadata?: {
    searchTime?: number;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    followUpQuestions?: string[];
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  modelUsed?: string;
  isActive: boolean;
}

export interface ChatMessageBuilder {
  setContent(content: string): ChatMessageBuilder;
  setRole(role: 'user' | 'assistant' | 'system'): ChatMessageBuilder;
  setSearchResult(result: SearchResult): ChatMessageBuilder;
  setReferences(references: Reference[]): ChatMessageBuilder;
  setModelUsed(model: string): ChatMessageBuilder;
  setConfidence(confidence: number): ChatMessageBuilder;
  setStreaming(isStreaming: boolean): ChatMessageBuilder;
  setMetadata(metadata: any): ChatMessageBuilder;
  build(): ChatMessage;
}
