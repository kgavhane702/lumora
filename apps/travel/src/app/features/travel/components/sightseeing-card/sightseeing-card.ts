import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Activity } from '../../interfaces/trip.interface';

@Component({
  selector: 'app-sightseeing-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './sightseeing-card.html',
  styleUrls: ['./sightseeing-card.scss']
})
export class SightseeingCard {
  @Input() activity!: Activity;
  @Output() editActivity = new EventEmitter<Activity>();
  @Output() viewActivity = new EventEmitter<Activity>();
  @Output() bookActivity = new EventEmitter<Activity>();

  onEdit(): void {
    this.editActivity.emit(this.activity);
  }

  onView(): void {
    this.viewActivity.emit(this.activity);
  }

  onBook(): void {
    this.bookActivity.emit(this.activity);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }
}
