import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResult, Reference } from '../../../shared/interfaces/search-result';
import { APP_CONSTANTS } from '../../../shared/constants/app-constants';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-results.html',
  styleUrls: ['./search-results.scss']
})
export class SearchResults {
  @Input() results: SearchResult[] = [];
  @Input() isLoading: boolean = false;
  
  @Output() resultClick = new EventEmitter<SearchResult>();
  @Output() referenceClick = new EventEmitter<Reference>();
  @Output() followUpClick = new EventEmitter<string>();

  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.8) return 'high-confidence';
    if (confidence >= 0.6) return 'medium-confidence';
    return 'low-confidence';
  }

  formatAnswer(answer: string): string {
    // Convert markdown-style formatting to HTML
    return answer
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/•\s/g, '• ');
  }

  onReferenceClick(reference: Reference) {
    this.referenceClick.emit(reference);
  }

  onFollowUpClick(question: string) {
    this.followUpClick.emit(question);
  }

  trackByResult(index: number, result: SearchResult): string {
    return result.id;
  }

  trackByReference(index: number, reference: Reference): string {
    return reference.id;
  }
}
