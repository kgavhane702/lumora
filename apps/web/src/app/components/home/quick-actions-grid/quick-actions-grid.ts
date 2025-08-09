import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickActionCardComponent, QuickAction } from '../../../shared/components/ui/quick-action-card/quick-action-card';

@Component({
  selector: 'app-quick-actions-grid',
  standalone: true,
  imports: [CommonModule, QuickActionCardComponent],
  templateUrl: './quick-actions-grid.html',
  styleUrls: ['./quick-actions-grid.scss']
})
export class QuickActionsGridComponent {
  @Output() actionClick = new EventEmitter<string>();

  quickActions: QuickAction[] = [
    {
      id: 'ai-news',
      title: 'Latest AI News',
      description: 'Stay updated with the latest developments',
      icon: 'trending_up',
      query: 'What is the latest news about AI?'
    },
    {
      id: 'learn-typescript',
      title: 'Learn TypeScript',
      description: 'Master TypeScript programming',
      icon: 'folder',
      query: 'How to learn TypeScript?'
    },
    {
      id: 'weather',
      title: 'Weather Today',
      description: 'Check current weather conditions',
      icon: 'explore',
      query: 'What is the weather today?'
    },
    {
      id: 'restaurants',
      title: 'Find Restaurants',
      description: 'Discover great places to eat',
      icon: 'home',
      query: 'Best restaurants near me'
    }
  ];

  onActionClick(query: string) {
    this.actionClick.emit(query);
  }

  trackByAction(index: number, action: QuickAction): string {
    return action.id;
  }
}