import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Icon } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-search-suggestions',
  standalone: true,
  imports: [CommonModule, Icon],
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
    return this.searchQuery.trim() ? 'search' : 'trending-up';
  }

  getIconColor(): string {
    return this.searchQuery.trim() ? '#6b7280' : '#3b82f6';
  }
} 