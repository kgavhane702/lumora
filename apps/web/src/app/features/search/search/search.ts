import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBar } from '../../../components/search/search-bar/search-bar';
import { SearchResults } from '../../../components/search/search-results/search-results';
import { SearchQuery } from '../../../shared/interfaces/search-query';
import { SearchResult, Reference } from '../../../shared/interfaces/search-result';
import { AIModel } from '../../../shared/interfaces/ai-model';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, SearchBar, SearchResults],
  templateUrl: './search.html',
  styleUrls: ['./search.scss']
})
export class Search implements OnInit {
  searchResults: SearchResult[] = [];
  isLoading: boolean = false;
  availableModels: AIModel[] = [];
  selectedModel: AIModel | null = null;

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    this.availableModels = this.mockDataService.getMockModels();
    this.selectedModel = this.availableModels[0];
  }

  onSearch(query: string) {
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.searchResults = this.mockDataService.getMockSearchResults();
      this.isLoading = false;
    }, 2000);
  }

  onModelChange(model: AIModel) {
    this.selectedModel = model;
  }

  onTrendingClick(topic: string) {
    // Trigger search with trending topic
    this.onSearch(topic);
  }

  onResultClick(result: SearchResult) {
    console.log('Result clicked:', result);
  }

  onReferenceClick(reference: Reference) {
    console.log('Reference clicked:', reference);
    window.open(reference.url, '_blank');
  }

  onFollowUpClick(question: string) {
    this.onSearch(question);
  }
}
