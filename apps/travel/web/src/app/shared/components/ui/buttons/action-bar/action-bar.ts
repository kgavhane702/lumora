import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface ActionBarButton {
  id: string;
  icon: string;
  label: string;
  visible?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './action-bar.html',
  styleUrls: ['./action-bar.scss']
})
export class ActionBarComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() showTitle: boolean = false;
  @Input() actions: ActionBarButton[] = [];
  @Input() position: 'left' | 'right' | 'center' = 'right';
  @Input() variant: 'default' | 'minimal' | 'elevated' = 'default';
  
  @Output() actionClick = new EventEmitter<string>();

  // Default actions for common use cases
  @Input() showShare: boolean = true;
  @Input() showBookmark: boolean = true;
  @Input() showExport: boolean = true;
  
  // Event emitters for specific actions
  @Output() share = new EventEmitter<void>();
  @Output() bookmark = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();

  ngOnInit() {
    // Set default actions if no custom actions provided
    if (this.actions.length === 0) {
      this.actions = this.getDefaultActions();
    }
  }

  private getDefaultActions(): ActionBarButton[] {
    const defaultActions: ActionBarButton[] = [];

    if (this.showShare) {
      defaultActions.push({
        id: 'share',
        icon: 'share',
        label: 'Share'
      });
    }

    if (this.showBookmark) {
      defaultActions.push({
        id: 'bookmark',
        icon: 'bookmark_border',
        label: 'Bookmark'
      });
    }

    if (this.showExport) {
      defaultActions.push({
        id: 'export',
        icon: 'download',
        label: 'Export'
      });
    }

    return defaultActions;
  }

  onActionClick(action: ActionBarButton) {
    if (action.disabled) return;

    // Emit generic action event
    this.actionClick.emit(action.id);

    // Emit specific events for default actions
    switch (action.id) {
      case 'share':
        this.share.emit();
        break;
      case 'bookmark':
        this.bookmark.emit();
        break;
      case 'export':
        this.export.emit();
        break;
    }
  }

  trackByAction(index: number, action: ActionBarButton): string {
    return action.id;
  }
}