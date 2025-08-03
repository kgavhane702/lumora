import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResult, Reference } from '../../../shared/interfaces/search-result';
import { Icon } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, Icon],
  templateUrl: './search-results.html',
  styleUrls: ['./search-results.scss']
})
export class SearchResults {
  @Input() results: SearchResult[] = [];
  @Input() isLoading: boolean = false;
  
  @Output() resultClick = new EventEmitter<SearchResult>();
  @Output() referenceClick = new EventEmitter<Reference>();
  @Output() followUpClick = new EventEmitter<string>();

  trackByResult(index: number, result: SearchResult): string {
    return result.id || index.toString();
  }

  trackByReference(index: number, reference: Reference): string {
    return reference.url || index.toString();
  }

  onCopyAnswer(result: SearchResult) {
    navigator.clipboard.writeText(result.answer).then(() => {
      // Could add a toast notification here
      console.log('Answer copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy answer:', err);
    });
  }

  onShareAnswer(result: SearchResult) {
    if (navigator.share) {
      navigator.share({
        title: 'Search Result from Lumora',
        text: result.answer,
        url: window.location.href
      }).catch(err => {
        console.error('Failed to share:', err);
      });
    } else {
      // Fallback to copying to clipboard
      this.onCopyAnswer(result);
    }
  }

  onReferenceClick(reference: Reference) {
    this.referenceClick.emit(reference);
    window.open(reference.url, '_blank');
  }

  onFollowUpClick(question: string) {
    this.followUpClick.emit(question);
  }
}
