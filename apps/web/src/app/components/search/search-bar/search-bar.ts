import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
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
export class SearchBar implements OnInit {
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

  constructor(
    private fileUploadService: FileUploadService,
    private notificationService: NotificationService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    // Initialize component
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
    this.searchQuery = query;
    this.generateSuggestions();
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
    this.showSuggestions = false;
    this.selectedSuggestionIndex = -1;
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
      this.suggestions = [
        'How to implement authentication in Angular?',
        'Best practices for TypeScript development',
        'Understanding dependency injection',
        'Angular performance optimization tips',
        'Modern CSS techniques for responsive design'
      ];
    } else {
      // Generate suggestions based on current input
      const query = this.searchQuery.toLowerCase();
      this.suggestions = [
        'How to implement authentication in Angular?',
        'Best practices for TypeScript development',
        'Understanding dependency injection',
        'Angular performance optimization tips',
        'Modern CSS techniques for responsive design'
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(query)
      );
    }
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
