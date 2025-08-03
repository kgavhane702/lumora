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
  
  @Output() search = new EventEmitter<string>();
  @Output() stopSearch = new EventEmitter<void>(); // New event for stopping search
  @Output() modelChange = new EventEmitter<any>();
  @Output() filterChange = new EventEmitter<any>();
  
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  
  searchQuery: string = '';
  showModelDropdown: boolean = false;
  advancedOptionsVisible: boolean = false;
  searchMode: string = 'both';
  focus: string = 'concise';
  includeReferences: boolean = true;
  isFocused: boolean = false;

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
    // Handle input changes if needed
  }

  onFocus() {
    this.isFocused = true;
  }

  onBlur() {
    this.isFocused = false;
  }

  clearSearch() {
    this.searchQuery = '';
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  onQuickAction(query: string) {
    this.searchQuery = query;
    this.onSearch();
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
      focus: this.focus,
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
}
