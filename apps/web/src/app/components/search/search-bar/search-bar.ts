import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../../shared/components/icon/icon';
import { SearchInputComponent } from '../search-input/search-input';
import { SearchSuggestionsComponent } from '../search-suggestions/search-suggestions';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, Icon, SearchInputComponent, SearchSuggestionsComponent],
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
  @Output() fileUpload = new EventEmitter<File>();
  
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
    if (!this.isRecording) {
      this.isRecording = true;
      // TODO: Implement voice input functionality
      console.log('Starting voice input...');
      
      // Simulate voice input for demo
      setTimeout(() => {
        this.isRecording = false;
        this.searchQuery = 'Voice input demo query';
        this.onSearch(this.searchQuery);
      }, 2000);
    }
  }

  openFileUpload() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileUpload.emit(file);
      // Reset the input
      event.target.value = '';
    }
  }

  generateSuggestions() {
    const query = this.searchQuery.trim().toLowerCase();
    
    if (!query) {
      // Show trending suggestions when no query
      this.suggestions = [
        'How to implement authentication in Angular?',
        'Best practices for TypeScript development',
        'Understanding dependency injection',
        'Angular performance optimization tips',
        'Modern CSS techniques for responsive design'
      ];
    } else {
      // Show search-related suggestions
      this.suggestions = [
        `${query} in Angular`,
        `${query} best practices`,
        `${query} tutorial`,
        `${query} examples`,
        `${query} documentation`
      ];
    }
    
    this.selectedSuggestionIndex = -1;
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

  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-bar') && !target.closest('.search-suggestions')) {
      this.showSuggestions = false;
      this.selectedSuggestionIndex = -1;
    }
  }

  focusSearch() {
    // This will be handled by SearchInputComponent
  }

  onEnterKey(event: any) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSearch(this.searchQuery);
    }
  }
}
