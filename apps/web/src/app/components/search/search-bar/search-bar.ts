import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, Icon],
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
  @Input() isSearching: boolean = false; // External search state
  @Input() showAutoSuggestions: boolean = true; // Control auto-suggestions
  
  @Output() search = new EventEmitter<string>();
  @Output() stopSearch = new EventEmitter<void>(); // New event for stopping search
  @Output() modelChange = new EventEmitter<any>();
  @Output() filterChange = new EventEmitter<any>();
  @Output() fileUpload = new EventEmitter<File>();
  
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLTextAreaElement>;
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
    if (this.autoFocus && this.searchInput) {
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 100);
    }
  }

  onSearch() {
    if (this.isSearching) return; // Prevent multiple rapid searches
    
    const query = this.searchQuery.trim();
    if (query) {
      this.search.emit(query);
      this.clearSearch(); // Clear the search input after submitting
    }
  }

  onStopSearch() {
    this.stopSearch.emit();
  }

  onInputChange() {
    console.log('Input changed:', this.searchQuery); // Debug
    this.generateSuggestions();
    this.autoResize();
  }

  autoResize() {
    if (this.searchInput) {
      const textarea = this.searchInput.nativeElement;
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set the height to scrollHeight, but cap it at max height
      const newHeight = Math.min(textarea.scrollHeight, 120); // 120px = 5 lines
      textarea.style.height = newHeight + 'px';
    }
  }

  onFocus() {
    this.isFocused = true;
    console.log('Search input focused, showAutoSuggestions:', this.showAutoSuggestions); // Debug
    if (this.showAutoSuggestions) {
      this.showSuggestions = true;
      // Generate suggestions when focused (trending if empty, search-related if has text)
      this.generateSuggestions();
    }
  }

  onBlur() {
    this.isFocused = false;
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  onKeyDown(event: KeyboardEvent) {
    if (this.suggestions.length > 0) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          this.selectedSuggestionIndex = Math.min(this.selectedSuggestionIndex + 1, this.suggestions.length - 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, -1);
          break;
        case 'Enter':
          if (this.selectedSuggestionIndex >= 0) {
            event.preventDefault();
            this.selectSuggestion(this.suggestions[this.selectedSuggestionIndex]);
          }
          break;
        case 'Escape':
          this.showSuggestions = false;
          this.selectedSuggestionIndex = -1;
          break;
      }
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.showSuggestions = false;
    this.selectedSuggestionIndex = -1;
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  onQuickAction(query: string) {
    this.searchQuery = query;
    this.onSearch();
  }

  startVoiceInput() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      this.isRecording = true;
      // Voice recognition implementation would go here
      // For now, just simulate
      setTimeout(() => {
        this.isRecording = false;
        this.searchQuery = 'Voice input simulation';
      }, 2000);
    } else {
      console.log('Speech recognition not supported');
    }
  }

  openFileUpload() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileUpload.emit(file);
      // Reset file input
      event.target.value = '';
    }
  }

  generateSuggestions() {
    if (!this.showAutoSuggestions) {
      this.suggestions = [];
      return;
    }

    const query = this.searchQuery.trim();
    
    if (!query) {
      // Show trending topics when search is empty
      this.suggestions = [
        'ChatGPT conversations Google search exposed',
        'Lightning mystery solved after 273 years',
        'Andy Jassy AI jobs pivot after backlash',
        'Meta jury verdict menstrual data Flo',
        'Latest iPhone 15 Pro reviews',
        'Best AI tools for developers'
      ];
      this.showSuggestions = true;
      return;
    }

    // Generate search-related suggestions when there's text
    const baseSuggestions = [
      `${query} latest news`,
      `${query} tutorial`,
      `${query} examples`,
      `${query} best practices`,
      `${query} comparison`,
      `${query} guide`
    ];

    // Filter suggestions that contain the query and limit to 6
    this.suggestions = baseSuggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 6); // Limit to 6 suggestions

    // Show suggestions if we have any
    this.showSuggestions = this.suggestions.length > 0;
    
    console.log('Suggestions generated:', this.suggestions); // Debug
  }

  selectSuggestion(suggestion: string) {
    this.searchQuery = suggestion;
    this.showSuggestions = false;
    this.selectedSuggestionIndex = -1;
    this.onSearch();
  }

  trackBySuggestion(index: number, suggestion: string): string {
    return suggestion;
  }

  toggleModelDropdown() {
    this.showModelDropdown = !this.showModelDropdown;
  }

  selectModel(model: any) {
    this.selectedModel = model;
    this.showModelDropdown = false;
    this.modelChange.emit(model);
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
    // Close dropdowns when clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('.model-selector')) {
      this.showModelDropdown = false;
    }
  }

  focusSearch() {
    if (this.searchInput && !this.isSearching) {
      this.searchInput.nativeElement.focus();
    }
  }

  onEnterKey(event: any) {
    if (event.shiftKey) {
      // Shift+Enter: Add new line (default behavior)
      return;
    } else {
      // Enter: Submit search
      event.preventDefault();
      this.onSearch();
    }
  }
}
