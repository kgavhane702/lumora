import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  query: string;
}

@Component({
  selector: 'app-quick-action-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './quick-action-card.html',
  styleUrls: ['./quick-action-card.scss']
})
export class QuickActionCardComponent {
  @Input() action!: QuickAction;
  @Input() disabled: boolean = false;
  
  @Output() actionClick = new EventEmitter<string>();

  onActionClick() {
    if (!this.disabled) {
      this.actionClick.emit(this.action.query);
    }
  }
}