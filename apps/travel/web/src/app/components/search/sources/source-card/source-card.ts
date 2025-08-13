import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reference } from '../../../../shared/interfaces/search-result';

@Component({
  selector: 'app-source-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './source-card.html',
  styleUrl: './source-card.scss'
})
export class SourceCard {
  @Input() source!: Reference;
  @Input() index?: number;
  @Input() variant: 'compact' | 'detailed' = 'compact';
  
  @Output() sourceClick = new EventEmitter<Reference>();

  onClick() {
    this.sourceClick.emit(this.source);
  }

  getDomainFromUrl(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  getDomainIcon(domain: string): string {
    // Return first letter of domain for now
    return domain.charAt(0).toUpperCase();
  }
}
