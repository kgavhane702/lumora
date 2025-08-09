import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-search-suggestions',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './search-suggestions.html',
  styleUrls: ['./search-suggestions.scss']
})
export class SearchSuggestionsComponent {
  @Input() suggestions: string[] = [];
  @Input() selectedIndex: number = -1;
  @Input() showSuggestions: boolean = false;
  @Input() searchQuery: string = '';
  
  @Output() suggestionSelect = new EventEmitter<string>();
  @Output() suggestionHover = new EventEmitter<number>();

  onSuggestionClick(suggestion: string) {
    this.suggestionSelect.emit(suggestion);
  }

  onSuggestionHover(index: number) {
    this.suggestionHover.emit(index);
  }

  trackBySuggestion(index: number, suggestion: string): string {
    return suggestion;
  }

  getIconName(): string {
    // Show trending icon for trending suggestions when search is empty
    if (!this.searchQuery.trim()) {
      return 'trending_up';
    }
    
    // Show search icon for search-based suggestions
    return 'search';
  }
} 