import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface StorageItem<T = any> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PREFIX = 'lumora_';
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

  // Local Storage Methods
  setItem<T>(key: string, value: T, ttl?: number): void {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expiresAt: ttl ? Date.now() + ttl : undefined
      };
      
      localStorage.setItem(this.getPrefixedKey(key), JSON.stringify(item));
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getPrefixedKey(key));
      if (!item) return null;

      const storageItem: StorageItem<T> = JSON.parse(item);
      
      // Check if item has expired
      if (storageItem.expiresAt && Date.now() > storageItem.expiresAt) {
        this.removeItem(key);
        return null;
      }

      return storageItem.value;
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.getPrefixedKey(key));
    } catch (error) {
      console.error('Error removing localStorage item:', error);
    }
  }

  // Session Storage Methods
  setSessionItem<T>(key: string, value: T, ttl?: number): void {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expiresAt: ttl ? Date.now() + ttl : undefined
      };
      
      sessionStorage.setItem(this.getPrefixedKey(key), JSON.stringify(item));
    } catch (error) {
      console.error('Error setting sessionStorage item:', error);
    }
  }

  getSessionItem<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(this.getPrefixedKey(key));
      if (!item) return null;

      const storageItem: StorageItem<T> = JSON.parse(item);
      
      // Check if item has expired
      if (storageItem.expiresAt && Date.now() > storageItem.expiresAt) {
        this.removeSessionItem(key);
        return null;
      }

      return storageItem.value;
    } catch (error) {
      console.error('Error getting sessionStorage item:', error);
      return null;
    }
  }

  removeSessionItem(key: string): void {
    try {
      sessionStorage.removeItem(this.getPrefixedKey(key));
    } catch (error) {
      console.error('Error removing sessionStorage item:', error);
    }
  }

  // Cache Methods
  setCache<T>(key: string, value: T, ttl: number = this.DEFAULT_TTL): void {
    this.setItem(key, value, ttl);
  }

  getCache<T>(key: string): T | null {
    return this.getItem<T>(key);
  }

  clearCache(): void {
    this.clearByPrefix(this.PREFIX);
  }

  // User Preferences
  setUserPreference<T>(key: string, value: T): void {
    this.setItem(`user_pref_${key}`, value);
  }

  getUserPreference<T>(key: string, defaultValue?: T): T | null {
    const value = this.getItem<T>(`user_pref_${key}`);
    return value !== null ? value : defaultValue || null;
  }

  // App Settings
  setAppSetting<T>(key: string, value: T): void {
    this.setItem(`app_setting_${key}`, value);
  }

  getAppSetting<T>(key: string, defaultValue?: T): T | null {
    const value = this.getItem<T>(`app_setting_${key}`);
    return value !== null ? value : defaultValue || null;
  }

  // Search History
  addSearchHistory(query: string): void {
    const history = this.getSearchHistory();
    const newHistory = [query, ...history.filter(q => q !== query)].slice(0, 50);
    this.setItem('search_history', newHistory);
  }

  getSearchHistory(): string[] {
    return this.getItem<string[]>('search_history') || [];
  }

  clearSearchHistory(): void {
    this.removeItem('search_history');
  }

  // Chat Sessions
  saveChatSessions(sessions: any[]): void {
    this.setItem('chat_sessions', sessions);
  }

  getChatSessions(): any[] {
    return this.getItem<any[]>('chat_sessions') || [];
  }

  // Clear all app data
  clearAll(): void {
    this.clearByPrefix(this.PREFIX);
  }

  // Utility Methods
  private getPrefixedKey(key: string): string {
    return `${this.PREFIX}${key}`;
  }

  private clearByPrefix(prefix: string): void {
    try {
      // Clear localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing storage by prefix:', error);
    }
  }

  // Storage Info
  getStorageInfo(): Observable<any> {
    try {
      const localStorageSize = this.getStorageSize(localStorage);
      const sessionStorageSize = this.getStorageSize(sessionStorage);
      const totalSize = localStorageSize + sessionStorageSize;

      return of({
        localStorage: {
          size: localStorageSize,
          items: Object.keys(localStorage).filter(key => key.startsWith(this.PREFIX)).length
        },
        sessionStorage: {
          size: sessionStorageSize,
          items: Object.keys(sessionStorage).filter(key => key.startsWith(this.PREFIX)).length
        },
        total: {
          size: totalSize,
          items: Object.keys(localStorage).filter(key => key.startsWith(this.PREFIX)).length +
                 Object.keys(sessionStorage).filter(key => key.startsWith(this.PREFIX)).length
        }
      });
    } catch (error) {
      console.error('Error getting storage info:', error);
      return of({ error: 'Failed to get storage info' });
    }
  }

  private getStorageSize(storage: Storage): number {
    let size = 0;
    try {
      for (let key in storage) {
        if (storage.hasOwnProperty(key)) {
          size += storage[key].length + key.length;
        }
      }
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }
    return size;
  }

  // Check if storage is available
  isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
}
