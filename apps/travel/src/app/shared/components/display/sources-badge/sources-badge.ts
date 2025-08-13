import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sources-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './sources-badge.html',
  styleUrl: './sources-badge.scss'
})
export class SourcesBadge {
  @Input() count: number = 0;
  @Input() icon: string = 'link';
  @Input() text?: string;
  @Input() variant: 'default' | 'compact' | 'pill' = 'default';

  get displayText(): string {
    if (this.text) return this.text;
    const plural = this.count > 1 ? 's' : '';
    return `Based on ${this.count} source${plural}`;
  }
}
