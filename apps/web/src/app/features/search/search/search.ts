import { Component, OnInit, AfterViewInit, QueryList, ViewChildren, ElementRef, HostListener, ViewChild } from '@angular/core';
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
  showDragOverlay: boolean = false; // Track drag overlay state

  @ViewChildren('currentSessionElem', { read: ElementRef }) sessionElems!: QueryList<ElementRef>;
  @ViewChild('searchBar') searchBar!: SearchBar;
  @ViewChild('searchBarChat') searchBarChat!: SearchBar;

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    // Initialize component
    this.setupGlobalDragListeners();
  }

  private setupGlobalDragListeners() {
    // Add global drag event listeners to handle window boundaries
    document.addEventListener('dragenter', (event) => {
      event.preventDefault();
      this.showDragOverlay = true;
    });

    document.addEventListener('dragleave', (event) => {
      event.preventDefault();
      // Only hide if we're leaving the document completely
      if (event.clientX <= 0 || event.clientY <= 0 || 
          event.clientX >= window.innerWidth || event.clientY >= window.innerHeight) {
        this.showDragOverlay = false;
      }
    });

    document.addEventListener('drop', (event) => {
      event.preventDefault();
      this.showDragOverlay = false;
    });

    document.addEventListener('dragend', (event) => {
      event.preventDefault();
      this.showDragOverlay = false;
    });
  }

  ngAfterViewInit() {
    this.sessionElems.changes.subscribe(() => {
      this.scrollToCurrentSession();
    });
  }

  // Global drag & drop handlers for the entire search page
  @HostListener('dragenter', ['$event'])
  onDragEnter(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    // Show drag overlay
    this.showDragOverlay = true;
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    // Keep overlay visible while dragging over
    this.showDragOverlay = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    // Check if we're leaving the page completely
    if (event.clientX <= 0 || event.clientY <= 0 || 
        event.clientX >= window.innerWidth || event.clientY >= window.innerHeight) {
      this.showDragOverlay = false;
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    // Hide drag overlay
    this.showDragOverlay = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const fileArray: File[] = [];
      for (let i = 0; i < files.length; i++) {
        fileArray.push(files[i]);
      }
      // Pass files to the appropriate search bar component
      if (this.hasActiveSessions && this.searchBarChat) {
        // If we have active sessions, use the chat search bar
        this.searchBarChat.handleFileUpload(fileArray);
      } else if (this.searchBar) {
        // Otherwise use the initial search bar
        this.searchBar.handleFileUpload(fileArray);
      }
    }
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    // Hide overlay when drag ends
    this.showDragOverlay = false;
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

  onFileUpload(files: File[]) {
    console.log('Files uploaded:', files.map(f => f.name));
    // Handle file upload - just log for now, don't auto-search
    // The files will be visible in the search bar attachment area
    console.log(`Attached ${files.length} file(s) to the search bar`);
    
    // Pass files to the search bar component
    // We need to find the search bar component and pass the files
    // For now, we'll emit an event that the parent can handle
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
