import { Component, OnInit, AfterViewInit, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBar } from '../../../components/search/search-bar/search-bar';
import { SearchResults } from '../../../components/search/search-results/search-results';
import { SearchResult, Reference } from '../../../shared/interfaces/search-result';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Icon } from '../../../shared/components/icon/icon';

interface SearchSession {
  id: string;
  query: string;
  timestamp: Date;
  results: SearchResult[];
  isLoading: boolean;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, SearchBar, SearchResults, Icon],
  templateUrl: './search.html',
  styleUrls: ['./search.scss']
})
export class Search implements OnInit, AfterViewInit {
  searchSessions: SearchSession[] = [];
  currentSession: SearchSession | null = null;
  isSearching: boolean = false; // Track search state
  private searchTimeout: any = null; // For stopping search

  @ViewChildren('currentSessionElem', { read: ElementRef }) sessionElems!: QueryList<ElementRef>;

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    // Initialize component
  }

  ngAfterViewInit() {
    this.sessionElems.changes.subscribe(() => {
      this.scrollToCurrentSession();
    });
  }

  private scrollToCurrentSession() {
    if (this.sessionElems && this.sessionElems.length > 0) {
      const lastElem = this.sessionElems.last;
      if (lastElem && lastElem.nativeElement) {
        lastElem.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  onSearch(query: string) {
    if (!query.trim() || this.isSearching) return; // Prevent multiple requests
    
    // Set searching state
    this.isSearching = true;
    
    // Create new search session
    const newSession: SearchSession = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: new Date(),
      results: [],
      isLoading: true
    };
    
    // Add to sessions list
    this.searchSessions.push(newSession);
    this.currentSession = newSession;
    
    // Simulate API call with timeout for stopping
    this.searchTimeout = setTimeout(() => {
      if (this.isSearching) { // Only complete if still searching
        newSession.results = this.mockDataService.getMockSearchResults();
        newSession.isLoading = false;
        this.isSearching = false;
      }
    }, 2000);
    setTimeout(() => this.scrollToCurrentSession(), 0); // Ensure scroll after DOM update
  }

  onStopSearch() {
    if (this.isSearching) {
      this.isSearching = false;
      
      // Clear the timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = null;
      }
      
      // Mark current session as stopped and complete it
      if (this.currentSession) {
        this.currentSession.isLoading = false;
        // If no results yet, add some results when stopped
        if (this.currentSession.results.length === 0) {
          this.currentSession.results = this.mockDataService.getMockSearchResults();
        }
      }
    }
  }

  onQuickAction(query: string) {
    this.onSearch(query);
  }

  onTrendingClick(topic: string) {
    this.onSearch(topic);
  }

  onResultClick(result: SearchResult) {
    console.log('Result clicked:', result);
  }

  onReferenceClick(reference: Reference) {
    console.log('Reference clicked:', reference);
    window.open(reference.url, '_blank');
  }

  onFollowUpClick(question: string) {
    this.onSearch(question);
  }

  onContinueSearch(result: SearchResult) {
    // Continue searching with the same query but different focus
    const followUpQuery = `Continue searching about: ${result.query}`;
    this.onSearch(followUpQuery);
  }

  onFileUpload(file: File) {
    console.log('File uploaded:', file.name);
    // Handle file upload - could trigger document analysis
    // For now, just simulate a search with the file
    this.onSearch(`Analyze this document: ${file.name}`);
  }

  formatTimestamp(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  get hasActiveSessions(): boolean {
    return this.searchSessions.length > 0;
  }

  get isFirstSearch(): boolean {
    return this.searchSessions.length === 0;
  }

  trackBySession(index: number, session: SearchSession): string {
    return session.id;
  }
}
