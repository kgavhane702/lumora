import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AIModel } from '../../../shared/interfaces/ai-model';
import { SearchQuery } from '../../../shared/interfaces/search-query';
import { APP_CONSTANTS } from '../../../shared/constants/app-constants';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.scss']
})
export class SearchBar implements OnInit {
  @Input() placeholder: string = 'Ask anything...';
  @Input() showModelSelector: boolean = true;
  @Input() showAdvancedOptions: boolean = true;
  @Input() autoFocus: boolean = false;
  @Input() maxLength: number = APP_CONSTANTS.UI.MAX_SEARCH_LENGTH;
  @Input() availableModels: AIModel[] = [];
  @Input() selectedModel: AIModel | null = null;
  
  @Output() search = new EventEmitter<string>();
  @Output() modelChange = new EventEmitter<AIModel>();
  @Output() filterChange = new EventEmitter<any>();
  
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchQuery: string = '';
  showModelDropdown: boolean = false;
  advancedOptionsVisible: boolean = false;
  
  // Advanced options
  searchMode: 'web' | 'documents' | 'both' = 'both';
  focus: 'concise' | 'detailed' | 'creative' = 'concise';
  includeReferences: boolean = true;

  ngOnInit() {
    if (this.autoFocus && this.searchInput) {
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 100);
    }
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.search.emit(this.searchQuery.trim());
    }
  }

  onInputChange() {
    // Handle input changes if needed
  }

  clearSearch() {
    this.searchQuery = '';
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  toggleModelDropdown() {
    this.showModelDropdown = !this.showModelDropdown;
  }

  selectModel(model: AIModel) {
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

  // Close dropdowns when clicking outside
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.model-selector')) {
      this.showModelDropdown = false;
    }
  }
}
