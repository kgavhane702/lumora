export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoSave: boolean;
  searchHistory: boolean;
  chatHistory: boolean;
}

export interface UserSettings {
  searchMode: 'web' | 'documents' | 'both';
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  includeReferences: boolean;
  focus: 'concise' | 'detailed' | 'creative';
  language: string;
}

export interface Subscription {
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  features: string[];
  expiresAt: Date;
  isActive: boolean;
  usage: {
    searches: number;
    chats: number;
    uploads: number;
    exports: number;
  };
  limits: {
    searches: number;
    chats: number;
    uploads: number;
    exports: number;
    storage: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  settings: UserSettings;
  subscription: Subscription;
  roles: string[];
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  isVerified: boolean;
}
