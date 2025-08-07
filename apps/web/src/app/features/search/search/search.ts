import { Component, OnInit, AfterViewInit, QueryList, ViewChildren, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBar } from '../../../components/search/search-bar/search-bar';
import { SearchResults } from '../../../components/search/search-results/search-results';
import { SearchResult, Reference } from '../../../shared/interfaces/search-result';
import { MockDataService } from '../../../core/services/mock-data.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

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
  imports: [CommonModule, SearchBar, SearchResults, MatIconModule, MatButtonModule],
  templateUrl: './search.html',
  styleUrls: ['./search.scss']
})
export class Search implements OnInit, AfterViewInit {
  searchSessions: SearchSession[] = [];
  currentSession: SearchSession | null = null;
  isSearching: boolean = false; // Track search state
  private searchTimeout: any = null; // For stopping search
  showDragOverlay: boolean = false; // Track drag overlay state
  private dragCounter: number = 0; // Track drag enter/leave events

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
      event.stopPropagation();
      this.dragCounter++;
      this.showDragOverlay = true;
    });

    document.addEventListener('dragleave', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.dragCounter--;
      if (this.dragCounter <= 0) {
        this.showDragOverlay = false;
        this.dragCounter = 0;
      }
    });

    document.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.showDragOverlay = false;
      this.dragCounter = 0;
    });

    document.addEventListener('dragend', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.showDragOverlay = false;
      this.dragCounter = 0;
    });

    // Prevent default drag behavior on the entire document
    document.addEventListener('dragover', (event) => {
      event.preventDefault();
      event.stopPropagation();
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
    
    this.dragCounter++;
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
    
    this.dragCounter--;
    if (this.dragCounter <= 0) {
      this.showDragOverlay = false;
      this.dragCounter = 0;
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    // Hide drag overlay
    this.showDragOverlay = false;
    this.dragCounter = 0;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const fileArray: File[] = [];
      for (let i = 0; i < files.length; i++) {
        fileArray.push(files[i]);
      }
      
      // Pass files to the appropriate search bar component
      if (this.hasActiveSessions && this.searchBarChat) {
        // If we have active sessions, use the chat search bar
        this.searchBarChat.handleExternalFileUpload(fileArray);
      } else if (this.searchBar) {
        // Otherwise use the initial search bar
        this.searchBar.handleExternalFileUpload(fileArray);
      }
    }
    
    return false; // Prevent default browser behavior
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    // Hide overlay when drag ends
    this.showDragOverlay = false;
    this.dragCounter = 0;
  }

  @HostListener('keydown.escape', ['$event'])
  onEscapeKey(event: Event) {
    // Hide overlay when Escape is pressed
    this.showDragOverlay = false;
    this.dragCounter = 0;
  }

  // Additional handlers for the chat layout specifically
  @HostListener('window:dragenter', ['$event'])
  onWindowDragEnter(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    this.dragCounter++;
    this.showDragOverlay = true;
  }

  @HostListener('window:dragleave', ['$event'])
  onWindowDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    this.dragCounter--;
    if (this.dragCounter <= 0) {
      this.showDragOverlay = false;
      this.dragCounter = 0;
    }
  }

  @HostListener('window:drop', ['$event'])
  onWindowDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    // Hide drag overlay
    this.showDragOverlay = false;
    this.dragCounter = 0;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const fileArray: File[] = [];
      for (let i = 0; i < files.length; i++) {
        fileArray.push(files[i]);
      }
      
      // Pass files to the appropriate search bar component
      if (this.hasActiveSessions && this.searchBarChat) {
        // If we have active sessions, use the chat search bar
        this.searchBarChat.handleExternalFileUpload(fileArray);
      } else if (this.searchBar) {
        // Otherwise use the initial search bar
        this.searchBar.handleExternalFileUpload(fileArray);
      }
    }
    
    return false; // Prevent default browser behavior
  }

  @HostListener('window:dragend', ['$event'])
  onWindowDragEnd(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    // Hide overlay when drag ends
    this.showDragOverlay = false;
    this.dragCounter = 0;
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
