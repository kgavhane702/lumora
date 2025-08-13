import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Activity } from '../../interfaces/trip.interface';

@Component({
  selector: 'app-timeline-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './timeline-item.html',
  styleUrls: ['./timeline-item.scss']
})
export class TimelineItem {
  @Input() activity!: Activity;
  @Output() edit = new EventEmitter<Activity>();
  @Output() view = new EventEmitter<Activity>();
  @Output() book = new EventEmitter<Activity>();

  getActivityIcon(): string {
    const iconMap: { [key: string]: string } = {
      sightseeing: 'explore',
      food: 'restaurant',
      shopping: 'shopping_bag',
      entertainment: 'theater_comedy',
      relaxation: 'spa',
      transport: 'directions_car',
      accommodation: 'hotel'
    };
    return iconMap[this.activity.type] || 'event';
  }

  onEdit(): void {
    this.edit.emit(this.activity);
  }

  onView(): void {
    this.view.emit(this.activity);
  }

  onBook(): void {
    this.book.emit(this.activity);
  }
}
