import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SearchInputComponent } from '../search-input/search-input';
import { SearchSuggestionsComponent } from '../search-suggestions/search-suggestions';
import { FileAttachmentComponent, AttachedFile } from '../../../shared/components/file-attachment/file-attachment';
import { FileUploadService } from '../../../shared/services/file-upload.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatIconModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    SearchInputComponent, 
    SearchSuggestionsComponent, 
    FileAttachmentComponent
  ],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.scss']
})
export class SearchBar implements OnInit, OnDestroy {
  @Input() placeholder: string = 'Ask anything...';
  @Input() showModelSelector: boolean = false;
  @Input() showAdvancedOptions: boolean = false;
  @Input() autoFocus: boolean = false;
  @Input() maxLength: number = 1000;
  @Input() availableModels: any[] = [];
  @Input() selectedModel: any = null;
  @Input() isSearching: boolean = false;
  @Input() showAutoSuggestions: boolean = true;
  
  @Output() search = new EventEmitter<string>();
  @Output() stopSearch = new EventEmitter<void>();
  @Output() modelChange = new EventEmitter<any>();
  @Output() filterChange = new EventEmitter<any>();
  @Output() fileUpload = new EventEmitter<File[]>();
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  searchQuery: string = '';
  showModelDropdown: boolean = false;
  advancedOptionsVisible: boolean = false;
  searchMode: string = 'both';
  includeReferences: boolean = true;
  isFocused: boolean = false;
  isRecording: boolean = false;
  showSuggestions: boolean = false;
  suggestions: string[] = [];
  selectedSuggestionIndex: number = -1;
  acceptedFileTypes: string = '.pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png';
  attachedFiles: AttachedFile[] = [];
  
  // Debounced input subject
  private inputSubject = new Subject<string>();

  constructor(
    private fileUploadService: FileUploadService,
    private notificationService: NotificationService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    // Set up debounced input for auto-suggestions
    this.inputSubject.pipe(
      debounceTime(300), // Wait 300ms after user stops typing
      distinctUntilChanged() // Only emit if value changed
    ).subscribe(query => {
      this.searchQuery = query;
      if (this.showAutoSuggestions && this.isFocused) {
        this.showSuggestions = true;
        this.generateSuggestions();
      }
    });
  }

  ngOnDestroy() {
    this.inputSubject.complete();
  }

  onSearch(query: string) {
    if (this.isSearching) return;
    
    if (query.trim()) {
      this.search.emit(query);
      this.searchQuery = '';
      this.showSuggestions = false;
    }
  }

  onStopSearch() {
    this.stopSearch.emit();
  }

  onInputChange(query: string) {
    console.log('SearchBar onInputChange called with:', query);
    
    // Use debounced input for better performance
    this.inputSubject.next(query);
  }

  onFocus() {
    this.isFocused = true;
    if (this.showAutoSuggestions) {
      this.showSuggestions = true;
      this.generateSuggestions();
    }
  }

  onBlur() {
    this.isFocused = false;
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSearch(this.searchQuery);
    } else if (event.key === 'Escape') {
      this.showSuggestions = false;
      this.selectedSuggestionIndex = -1;
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedSuggestionIndex = Math.min(this.selectedSuggestionIndex + 1, this.suggestions.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, -1);
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.selectedSuggestionIndex = -1;
    
    // If focused, show trending suggestions, otherwise hide
    if (this.isFocused && this.showAutoSuggestions) {
      this.generateSuggestions();
      this.showSuggestions = true;
    } else {
      this.showSuggestions = false;
    }
  }

  onQuickAction(query: string) {
    this.searchQuery = query;
    this.onSearch(query);
  }

  startVoiceInput() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      this.isRecording = true;
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.searchQuery = transcript;
        this.onSearch(transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isRecording = false;
      };
      
      recognition.onend = () => {
        this.isRecording = false;
      };
      
      recognition.start();
    } else {
      console.warn('Speech recognition not supported');
    }
  }

  openFileUpload() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.handleFileUpload(files);
  }

  handleFileUpload(files: File[]) {
    // Use FileUploadService for validation
    const { valid, invalid } = this.fileUploadService.validateFiles(files);

    if (invalid.length > 0) {
      const errorMessage = `Invalid files: ${invalid.map(item => item.file.name).join(', ')}`;
      this.notificationService.error('Upload Error', errorMessage);
      this.errorHandler.handleFileError(new Error(errorMessage));
    }

    if (valid.length > 0) {
      this.onFileUpload(valid);
    }
  }

  public handleExternalFileUpload(files: File[]) {
    this.handleFileUpload(files);
  }

  onFileUpload(files: File[]) {
    const newAttachedFiles: AttachedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      uploadProgress: 0,
      uploadStatus: 'pending'
    }));

    this.attachedFiles = [...this.attachedFiles, ...newAttachedFiles];
    
    // Use FileUploadService for actual upload
    this.fileUploadService.uploadFiles(files).subscribe(results => {
      results.forEach((result, index) => {
        const attachedFile = newAttachedFiles[index];
        if (result.success) {
          attachedFile.uploadStatus = 'completed';
          attachedFile.uploadProgress = 100;
          this.notificationService.showSuccess(`File ${attachedFile.name} uploaded successfully`);
        } else {
          attachedFile.uploadStatus = 'error';
          this.notificationService.error('Upload Failed', `Failed to upload ${attachedFile.name}`);
        }
      });
    });

    this.fileUpload.emit(files);
  }

  onFileRemove(file: AttachedFile) {
    this.attachedFiles = this.attachedFiles.filter(f => f.id !== file.id);
    this.notificationService.showInfo(`Removed ${file.name}`);
  }

  onFileError(error: { file: File; error: string }) {
    console.error('File upload error:', error);
    this.notificationService.error('File Error', error.error);
    this.errorHandler.handleFileError(new Error(error.error));
  }

  generateSuggestions() {
    if (!this.searchQuery.trim()) {
      // Show trending/popular suggestions when empty
      this.suggestions = [
        'What is artificial intelligence?',
        'How to learn programming?',
        'Best programming languages 2024',
        'Machine learning for beginners',
        'What is cloud computing?',
        'How to build a website?',
        'Python vs JavaScript comparison',
        'Data science career path'
      ];
    } else {
      // Generate real auto-completion suggestions based on what user is typing
      const query = this.searchQuery.toLowerCase().trim();
      this.suggestions = this.getAutoCompleteSuggestions(query);
    }
  }

  private getAutoCompleteSuggestions(query: string): string[] {
    const suggestions: string[] = [];
    
    // Auto-completion database - these complete what the user is typing
    const autoCompleteDatabase = [
      // Programming languages
      'JavaScript tutorial',
      'JavaScript fundamentals',
      'JavaScript best practices',
      'JavaScript vs TypeScript',
      'Python tutorial',
      'Python for beginners',
      'Python data science',
      'Python web development',
      'Angular tutorial',
      'Angular vs React',
      'Angular components',
      'Angular services',
      'React hooks',
      'React tutorial',
      'React components',
      'React vs Vue',
      'TypeScript tutorial',
      'TypeScript benefits',
      'HTML5 features',
      'HTML best practices',
      'CSS Grid tutorial',
      'CSS Flexbox guide',
      'CSS animations',
      
      // Programming concepts
      'How to learn programming',
      'How to become a developer',
      'How to build a website',
      'How to deploy applications',
      'How to use git',
      'How to write clean code',
      'What is API',
      'What is REST API',
      'What is GraphQL',
      'What is microservices',
      'What is cloud computing',
      'What is Docker',
      'What is Kubernetes',
      'What is DevOps',
      
      // AI and ML
      'What is artificial intelligence',
      'What is machine learning',
      'What is deep learning',
      'What is neural network',
      'AI vs machine learning',
      'Machine learning algorithms',
      'Machine learning tutorial',
      
      // Web development
      'Web development roadmap',
      'Web development tools',
      'Frontend vs backend',
      'Frontend development',
      'Backend development',
      'Full stack development',
      'Database design',
      'Database management',
      
      // Career and learning
      'Programming career path',
      'Software engineer salary',
      'Best programming languages 2024',
      'Learn to code online',
      'Coding bootcamp vs degree',
      
      // Questions starters
      'Why use',
      'Why learn',
      'Why choose',
      'When to use',
      'When to learn',
      'Where to learn',
      'Where to start',
      'How much does',
      'How long to learn',
      'How to get started with'
    ];

    // Find suggestions that start with or contain the query
    const matchingSuggestions = autoCompleteDatabase.filter(suggestion => {
      const suggestionLower = suggestion.toLowerCase();
      return suggestionLower.startsWith(query) || suggestionLower.includes(query);
    });

    // Prioritize suggestions that start with the query
    const startsWith = matchingSuggestions.filter(s => s.toLowerCase().startsWith(query));
    const contains = matchingSuggestions.filter(s => s.toLowerCase().includes(query) && !s.toLowerCase().startsWith(query));

    // Smart completion for common patterns
    if (query.length >= 2) {
      // Complete common question patterns
      if (query.startsWith('how ') || query.startsWith('how')) {
        suggestions.push(
          `${query} to learn programming`,
          `${query} to build a website`,
          `${query} to get started`,
          `${query} to become a developer`,
          `${query} does it work`
        );
      }
      
      if (query.startsWith('what ') || query.startsWith('what')) {
        suggestions.push(
          `${query} is artificial intelligence`,
          `${query} is machine learning`,
          `${query} is the best programming language`,
          `${query} are the benefits`,
          `${query} is the difference between`
        );
      }
      
      if (query.startsWith('why ') || query.startsWith('why')) {
        suggestions.push(
          `${query} use TypeScript`,
          `${query} learn programming`,
          `${query} choose React`,
          `${query} is it important`
        );
      }
      
      if (query.startsWith('best ') || query.startsWith('best')) {
        suggestions.push(
          `${query} programming languages`,
          `${query} web development tools`,
          `${query} practices for`,
          `${query} way to learn`
        );
      }
    }

    // Combine all suggestions and limit results
    const allSuggestions = [...new Set([...startsWith, ...contains, ...suggestions])];
    
    return allSuggestions
      .filter(s => s.toLowerCase() !== query.toLowerCase() && s.length > query.length)
      .slice(0, 8);
  }

  selectSuggestion(suggestion: string) {
    this.searchQuery = suggestion;
    this.onSearch(suggestion);
  }

  onSuggestionHover(index: number) {
    this.selectedSuggestionIndex = index;
  }

  trackBySuggestion(index: number, suggestion: string): string {
    return suggestion;
  }

  toggleModelDropdown() {
    this.showModelDropdown = !this.showModelDropdown;
  }

  selectModel(model: any) {
    this.selectedModel = model;
    this.modelChange.emit(model);
    this.showModelDropdown = false;
  }

  toggleAdvancedOptions() {
    this.advancedOptionsVisible = !this.advancedOptionsVisible;
  }

  onFilterChange() {
    this.filterChange.emit({
      searchMode: this.searchMode,
      includeReferences: this.includeReferences
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-bar-container')) {
      this.showSuggestions = false;
      this.selectedSuggestionIndex = -1;
    }
  }

  focusSearch() {
    // Focus the search input
  }

  onEnterKey(event: any) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSearch(this.searchQuery);
    }
  }

  private simulateUploadProgress(files: AttachedFile[]) {
    files.forEach(file => {
      const interval = setInterval(() => {
        if (file.uploadProgress !== undefined) {
          file.uploadProgress += Math.random() * 20;
          if (file.uploadProgress >= 100) {
            file.uploadProgress = 100;
            file.uploadStatus = 'completed';
            clearInterval(interval);
          }
        }
      }, 200);
    });
  }
}
