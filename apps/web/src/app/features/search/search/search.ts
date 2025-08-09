import { Component, OnInit, AfterViewInit, QueryList, ViewChildren, ElementRef, HostListener, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBar } from '../../../components/search/search-bar/search-bar';
import { SearchResults } from '../../../components/search/search-results/search-results';
import { ActionBarComponent } from '../../../shared/components/ui/action-bar/action-bar';
import { BrandHeaderComponent } from '../../../shared/components/ui/brand-header/brand-header';
import { QuickActionsGridComponent } from '../../../components/home/quick-actions-grid/quick-actions-grid';
import { FeaturesShowcaseComponent } from '../../../components/home/features-showcase/features-showcase';
import { SearchResult, Reference } from '../../../shared/interfaces/search-result';
import { SearchQuery } from '../../../shared/interfaces/search-query';
import { SearchService } from '../../../core/services/search';
import { NotificationService } from '../../../shared/services/notification.service';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { FileUploadService } from '../../../shared/services/file-upload.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

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
  imports: [CommonModule, SearchBar, SearchResults, ActionBarComponent, BrandHeaderComponent, QuickActionsGridComponent, FeaturesShowcaseComponent, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './search.html',
  styleUrls: ['./search.scss']
})
export class Search implements OnInit, AfterViewInit {
  @Output() mobileMenuToggle = new EventEmitter<void>();
  
  searchSessions: SearchSession[] = [];
  currentSession: SearchSession | null = null;
  isSearching: boolean = false;
  private searchTimeout: any = null;
  showDragOverlay: boolean = false;
  private dragCounter: number = 0;

  @ViewChildren('currentSessionElem', { read: ElementRef }) sessionElems!: QueryList<ElementRef>;
  @ViewChild('searchBar') searchBar!: SearchBar;
  @ViewChild('searchBarChat') searchBarChat!: SearchBar;

  constructor(
    private searchService: SearchService,
    private notificationService: NotificationService,
    private errorHandler: ErrorHandlerService,
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit() {
    this.setupGlobalDragListeners();
    this.loadSearchHistory();
  }

  private loadSearchHistory() {
    // Load search history from the service
    this.searchService.getSearchHistory().subscribe(history => {
      console.log('Loaded search history:', history);
    });
  }

  private setupGlobalDragListeners() {
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

  // Global drag & drop handlers
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
    
    this.showDragOverlay = false;
    this.dragCounter = 0;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const fileArray: File[] = [];
      for (let i = 0; i < files.length; i++) {
        fileArray.push(files[i]);
      }
      
      this.handleFileUpload(fileArray);
    }
    
    return false;
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.showDragOverlay = false;
    this.dragCounter = 0;
  }

  @HostListener('keydown.escape', ['$event'])
  onEscapeKey(event: Event) {
    this.showDragOverlay = false;
    this.dragCounter = 0;
  }

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
    
    this.showDragOverlay = false;
    this.dragCounter = 0;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const fileArray: File[] = [];
      for (let i = 0; i < files.length; i++) {
        fileArray.push(files[i]);
      }
      
      this.handleFileUpload(fileArray);
    }
    
    return false;
  }

  @HostListener('window:dragend', ['$event'])
  onWindowDragEnd(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
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
    if (!query.trim() || this.isSearching) return;
    
    this.isSearching = true;
    this.notificationService.showSearchStarted();
    
    // Create search query object
    const searchQuery: SearchQuery = {
      query: query.trim(),
      timestamp: new Date(),
      searchMode: 'both',
      includeReferences: true,
      focus: 'concise'
    };
    
    // Create new search session
    const newSession: SearchSession = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: new Date(),
      results: [],
      isLoading: true
    };
    
    this.searchSessions.push(newSession);
    this.currentSession = newSession;
    
    // Use SearchService to execute search
    this.searchService.executeSearch(searchQuery).pipe(
      catchError(error => {
        this.errorHandler.handleSearchError(error, {
          component: 'SearchComponent',
          action: 'onSearch',
          data: { query: query.trim() }
        });
        return of(null);
      }),
      finalize(() => {
        this.isSearching = false;
        this.notificationService.showSearchCompleted();
      })
    ).subscribe(result => {
      if (result) {
        newSession.results = [result];
        newSession.isLoading = false;
        this.notificationService.showSuccess(`Found results for "${query.trim()}"`);
      } else {
        newSession.isLoading = false;
        newSession.results = [];
      }
    });
    
    setTimeout(() => this.scrollToCurrentSession(), 0);
  }

  onStopSearch() {
    if (this.isSearching) {
      this.isSearching = false;
      
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = null;
      }
      
      if (this.currentSession) {
        this.currentSession.isLoading = false;
        if (this.currentSession.results.length === 0) {
          // Add mock results when stopped
          this.currentSession.results = [{
            id: Date.now().toString(),
            answer: 'Search was stopped by user.',
            references: [],
            modelUsed: 'gpt-4o',
            confidence: 0.5,
            searchTime: 0,
            timestamp: new Date(),
            query: this.currentSession.query
          }];
        }
      }
      
      this.notificationService.showInfo('Search stopped');
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
    this.notificationService.showInfo('Result clicked');
  }

  onReferenceClick(reference: Reference) {
    console.log('Reference clicked:', reference);
    window.open(reference.url, '_blank');
    this.notificationService.showInfo('Opening reference in new tab');
  }

  onFollowUpClick(question: string) {
    this.onSearch(question);
  }

  onContinueSearch(result: SearchResult) {
    const followUpQuery = `Continue searching about: ${result.query}`;
    this.onSearch(followUpQuery);
  }

  onFileUpload(files: File[]) {
    console.log('Files uploaded:', files.map(f => f.name));
    
    // Validate files using FileUploadService
    const { valid, invalid } = this.fileUploadService.validateFiles(files);
    
    if (invalid.length > 0) {
      const errorMessage = `Invalid files: ${invalid.map(item => item.file.name).join(', ')}`;
      this.notificationService.error('Upload Error', errorMessage);
    }
    
    if (valid.length > 0) {
      this.notificationService.showInfo(`Attached ${valid.length} file(s) to search`);
      
      // Upload files using FileUploadService
      this.fileUploadService.uploadFiles(valid).subscribe(results => {
        console.log('Files uploaded successfully:', results);
      });
    }
  }

  private handleFileUpload(files: File[]) {
    this.onFileUpload(files);
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

  // Navigation Menu Methods
  onNewSearch() {
    console.log('New search requested');
    this.searchSessions = [];
    this.currentSession = null;
    this.notificationService.showInfo('Started new search session');
  }

  onClearHistory() {
    console.log('Clear history requested');
    this.searchService.clearSearchHistory();
    this.searchSessions = [];
    this.currentSession = null;
    this.notificationService.showSuccess('Search history cleared');
  }

  onShareResults() {
    console.log('Share results requested');
    this.notificationService.showInfo('Sharing results...');
    // TODO: Implement share functionality
  }

  onBookmarkResults() {
    console.log('Bookmark results requested');
    this.notificationService.showSuccess('Results bookmarked');
    // TODO: Implement bookmark functionality
  }

  onExportResults() {
    console.log('Export results requested');
    this.notificationService.showInfo('Exporting results...');
    // TODO: Implement export functionality
  }
}
