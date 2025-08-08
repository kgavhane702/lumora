import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap, delay } from 'rxjs/operators';
import { SearchQuery } from '../../shared/interfaces/search-query';
import { SearchResult } from '../../shared/interfaces/search-result';
import { APP_CONSTANTS } from '../../shared/constants/app-constants';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchHistory = new BehaviorSubject<SearchQuery[]>([]);
  private currentSearch = new BehaviorSubject<SearchQuery | null>(null);
  private isSearching = new BehaviorSubject<boolean>(false);

  constructor() {
    this.loadSearchHistory();
  }

  // Search execution
  executeSearch(query: SearchQuery): Observable<SearchResult> {
    this.setSearching(true);
    this.currentSearch.next(query);
    
    // Add to history
    this.addToHistory(query);

    // Simulate API call (replace with actual API call)
    return this.mockSearchAPI(query).pipe(
      tap(() => this.setSearching(false)),
      catchError(error => {
        this.setSearching(false);
        return throwError(() => error);
      })
    );
  }

  // Search history management
  getSearchHistory(): Observable<SearchQuery[]> {
    return this.searchHistory.asObservable();
  }

  addToHistory(query: SearchQuery): void {
    const currentHistory = this.searchHistory.value;
    const newHistory = [query, ...currentHistory.filter(q => q.query !== query.query)];
    this.searchHistory.next(newHistory.slice(0, 50)); // Keep last 50 searches
    this.saveSearchHistory();
  }

  clearSearchHistory(): void {
    this.searchHistory.next([]);
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.SEARCH_HISTORY);
  }

  // Current search state
  getCurrentSearch(): Observable<SearchQuery | null> {
    return this.currentSearch.asObservable();
  }

  getIsSearching(): Observable<boolean> {
    return this.isSearching.asObservable();
  }

  // Search suggestions
  getSearchSuggestions(query: string): Observable<string[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    const history = this.searchHistory.value;
    const suggestions = history
      .filter(item => item.query.toLowerCase().includes(query.toLowerCase()))
      .map(item => item.query)
      .slice(0, 5);

    return of(suggestions);
  }

  // Search analytics
  getSearchAnalytics(): Observable<any> {
    const history = this.searchHistory.value;
    const totalSearches = history.length;
    const uniqueQueries = new Set(history.map(h => h.query)).size;
    const averageQueryLength = history.reduce((sum, h) => sum + h.query.length, 0) / totalSearches || 0;

    return of({
      totalSearches,
      uniqueQueries,
      averageQueryLength,
      recentSearches: history.slice(0, 10)
    });
  }

  // Private methods
  private setSearching(searching: boolean): void {
    this.isSearching.next(searching);
  }

  private loadSearchHistory(): void {
    try {
      const saved = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.SEARCH_HISTORY);
      if (saved) {
        const history = JSON.parse(saved);
        this.searchHistory.next(history);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }

  private saveSearchHistory(): void {
    try {
      localStorage.setItem(
        APP_CONSTANTS.STORAGE_KEYS.SEARCH_HISTORY,
        JSON.stringify(this.searchHistory.value)
      );
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  // Mock API call (replace with actual API)
  private mockSearchAPI(query: SearchQuery): Observable<SearchResult> {
    return of({
      id: Date.now().toString(),
      answer: `This is a mock response for: "${query.query}". In a real implementation, this would be the AI-generated answer based on web search results and reasoning.`,
      references: [
        {
          id: '1',
          title: 'Sample Reference 1',
          url: 'https://example.com/1',
          snippet: 'This is a sample reference that would be returned from the search.',
          relevance: 95,
          source: 'web' as const,
          domain: 'example.com'
        },
        {
          id: '2',
          title: 'Sample Reference 2',
          url: 'https://example.com/2',
          snippet: 'Another sample reference with relevant information.',
          relevance: 87,
          source: 'web' as const,
          domain: 'example.com'
        }
      ],
      modelUsed: 'gpt-4o',
      confidence: 0.92,
      searchTime: 2.5,
      tokenUsage: {
        prompt: 150,
        completion: 300,
        total: 450
      },
      followUpQuestions: [
        'Can you provide more details about this topic?',
        'What are the latest developments in this area?',
        'How does this compare to similar technologies?'
      ],
      relatedTopics: ['AI', 'Machine Learning', 'Technology'],
      timestamp: new Date(),
      query: query.query
    }).pipe(delay(2000)); // Simulate network delay
  }
}
