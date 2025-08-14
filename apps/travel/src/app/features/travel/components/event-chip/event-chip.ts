import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

export interface CalendarEvent {
  title: string;
  type: 'transportation' | 'accommodation' | 'activity' | 'meal';
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  color?: string;
  icon?: string;
  index?: number;
}

@Component({
  selector: 'app-event-chip',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule],
  templateUrl: './event-chip.html',
  styleUrls: ['./event-chip.scss']
})
export class EventChipComponent {
  @Input() event!: CalendarEvent;
  @Input() isAllDay: boolean = false;
  @Input() rowSpan: number = 1;

  getEventColor(): string {
    if (this.event.color) return this.event.color;
    
    switch (this.event.type) {
      case 'transportation':
        return 'primary';
      case 'accommodation':
        return 'accent';
      case 'activity':
        return 'warn';
      case 'meal':
        return 'primary';
      default:
        return 'primary';
    }
  }

  getEventIcon(): string {
    if (this.event.icon) return this.event.icon;
    
    switch (this.event.type) {
      case 'transportation':
        return 'directions_car';
      case 'accommodation':
        return 'hotel';
      case 'activity':
        return 'explore';
      case 'meal':
        return 'restaurant';
      default:
        return 'event';
    }
  }

  getDisplayTitle(): string {
    // Truncate long titles for better fit
    if (this.event.title.length > 20) {
      return this.event.title.substring(0, 17) + '...';
    }
    return this.event.title;
  }
}
