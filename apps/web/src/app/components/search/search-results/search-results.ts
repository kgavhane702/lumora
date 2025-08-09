import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResult, Reference } from '../../../shared/interfaces/search-result';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TabContainer } from '../../../shared/components/ui/tabs/tab-container/tab-container';
import { TabPanel } from '../../../shared/components/ui/tabs/tab-panel/tab-panel';
import { Tab, TabChangeEvent } from '../../../shared/interfaces/tab';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, TabContainer, TabPanel],
  templateUrl: './search-results.html',
  styleUrls: ['./search-results.scss']
})
export class SearchResults {
  @Input() results: SearchResult[] = [];
  @Input() isLoading: boolean = false;
  
  @Output() resultClick = new EventEmitter<SearchResult>();
  @Output() referenceClick = new EventEmitter<Reference>();
  @Output() followUpClick = new EventEmitter<string>();
  @Output() continueSearch = new EventEmitter<SearchResult>();

  activeTab: string = 'answer';

  trackByResult(index: number, result: SearchResult): string {
    return result.id || index.toString();
  }

  trackByReference(index: number, reference: Reference): string {
    return reference.url || index.toString();
  }

  getTabsForResult(result: SearchResult): Tab[] {
    const tabs: Tab[] = [
      {
        id: 'answer',
        label: 'Answer',
        icon: 'chat'
      }
    ];

    if (result.references && result.references.length > 0) {
      tabs.push({
        id: 'sources',
        label: 'Sources',
        icon: 'link',
        badge: result.references.length.toString()
      });
    }

    return tabs;
  }

  onTabChange(event: TabChangeEvent) {
    this.activeTab = event.activeTab;
  }

  formatAnswer(answer: string): string {
    // Convert markdown-style formatting to HTML
    return answer
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/•\s*(.*?)(?=\n|$)/g, '<li>$1</li>') // Bullet points
      .replace(/\n\n/g, '</p><p>') // Paragraphs
      .replace(/^(.*?)$/gm, '<p>$1</p>') // Wrap lines in paragraphs
      .replace(/<p><\/p>/g, '') // Remove empty paragraphs
      .replace(/<p><li>/g, '<ul><li>') // Start lists
      .replace(/<\/li><\/p>/g, '</li></ul>') // End lists
      .replace(/<\/li><p>/g, '</li></ul><p>'); // End lists before paragraphs
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

  onContinueSearch(result: SearchResult) {
    this.continueSearch.emit(result);
  }

  onReferenceClick(reference: Reference) {
    this.referenceClick.emit(reference);
    window.open(reference.url, '_blank');
  }

  onFollowUpClick(question: string) {
    this.followUpClick.emit(question);
  }

  getDomainFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return url;
    }
  }

  getDomainIcon(domain: string): string {
    // Return first letter of domain for icon
    return domain.charAt(0).toUpperCase();
  }
}
