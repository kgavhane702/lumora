import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss'
})
export class EmptyState {
  @Input() icon: string = 'search';
  @Input() title: string = 'No results found';
  @Input() message: string = 'Try adjusting your search terms or ask a different question.';
  @Input() actionText?: string;
  @Input() showAction: boolean = false;
  @Input() type: 'search' | 'data' | 'error' | 'custom' = 'search';
  
  @Output() actionClick = new EventEmitter<void>();

  get defaultIcon(): string {
    switch (this.type) {
      case 'search': return 'search';
      case 'data': return 'inbox';
      case 'error': return 'error';
      default: return this.icon;
    }
  }

  onActionClick() {
    this.actionClick.emit();
  }
}
