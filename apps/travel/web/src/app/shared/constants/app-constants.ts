export const APP_CONSTANTS = {
  APP_NAME: 'Lumora',
  APP_TAGLINE: 'AI-Powered Search & Reasoning',
  APP_VERSION: '1.0.0',
  
  // Search Modes
  SEARCH_MODES: {
    WEB: 'web',
    DOCUMENTS: 'documents',
    BOTH: 'both'
  } as const,
  
  // Focus Types
  FOCUS_TYPES: {
    CONCISE: 'concise',
    DETAILED: 'detailed',
    CREATIVE: 'creative'
  } as const,
  
  // Model Types
  MODEL_TYPES: {
    CHAT: 'chat',
    COMPLETION: 'completion',
    MULTIMODAL: 'multimodal'
  } as const,
  
  // Confidence Levels
  CONFIDENCE_LEVELS: {
    HIGH: { min: 0.8, label: 'High', color: '#10B981' },
    MEDIUM: { min: 0.6, label: 'Medium', color: '#F59E0B' },
    LOW: { min: 0, label: 'Low', color: '#EF4444' }
  },
  
  // UI Constants
  UI: {
    MAX_SEARCH_LENGTH: 2000,
    MIN_SEARCH_LENGTH: 3,
    DEBOUNCE_DELAY: 300,
    STREAMING_DELAY: 50,
    ANIMATION_DURATION: 200
  },
  
  // Default Values
  DEFAULTS: {
    TEMPERATURE: 0.7,
    MAX_TOKENS: 4000,
    INCLUDE_REFERENCES: true,
    SEARCH_MODE: 'both',
    FOCUS: 'concise',
    LANGUAGE: 'en'
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    SEARCH_HISTORY: 'lumora_search_history',
    CHAT_SESSIONS: 'lumora_chat_sessions',
    SELECTED_MODEL: 'lumora_selected_model',
    USER_PREFERENCES: 'lumora_user_preferences'
  },
  
  // API Endpoints (for future use)
  API: {
    BASE_URL: '/api',
    SEARCH: '/search',
    CHAT: '/chat',
    MODELS: '/models'
  }
} as const;

export type SearchMode = typeof APP_CONSTANTS.SEARCH_MODES[keyof typeof APP_CONSTANTS.SEARCH_MODES];
export type FocusType = typeof APP_CONSTANTS.FOCUS_TYPES[keyof typeof APP_CONSTANTS.FOCUS_TYPES];
export type ModelType = typeof APP_CONSTANTS.MODEL_TYPES[keyof typeof APP_CONSTANTS.MODEL_TYPES];
