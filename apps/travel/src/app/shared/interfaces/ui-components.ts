import { SearchResult, Reference } from './search-result';
import { ChatMessage } from './chat-message';

export interface SearchBarConfig {
  placeholder?: string;
  showModelSelector?: boolean;
  showAdvancedOptions?: boolean;
  autoFocus?: boolean;
  onSearch: (query: string) => void;
  onModelChange?: (modelId: string) => void;
}

export interface SearchFiltersConfig {
  searchMode: 'web' | 'documents' | 'both';
  focus: 'concise' | 'detailed' | 'creative';
  includeReferences: boolean;
  onFilterChange: (filters: any) => void;
}

export interface SearchResultsConfig {
  results: SearchResult[];
  isLoading?: boolean;
  onResultClick?: (result: SearchResult) => void;
  onReferenceClick?: (reference: Reference) => void;
  onFollowUpClick?: (question: string) => void;
}

export interface ChatInterfaceConfig {
  messages: ChatMessage[];
  isStreaming?: boolean;
  onSendMessage: (message: string) => void;
  onNewChat: () => void;
  onClearChat: () => void;
}

export interface ReferenceCardConfig {
  reference: Reference;
  onReferenceClick?: (reference: Reference) => void;
  showRelevance?: boolean;
  showDomain?: boolean;
}

export interface ConfidenceIndicatorConfig {
  confidence: number;
  size?: 'small' | 'medium' | 'large';
  showPercentage?: boolean;
}

export interface LoadingSpinnerConfig {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export interface ErrorMessageConfig {
  message: string;
  type?: 'error' | 'warning' | 'info';
  showRetry?: boolean;
  onRetry?: () => void;
} 