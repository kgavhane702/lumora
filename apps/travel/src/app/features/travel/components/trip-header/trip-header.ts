import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Trip } from '../../interfaces/trip.interface';

@Component({
  selector: 'app-trip-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './trip-header.html',
  styleUrls: ['./trip-header.scss']
})
export class TripHeader {
  @Input() trip?: Trip;
  @Output() editTrip = new EventEmitter<void>();
  @Output() shareTrip = new EventEmitter<void>();
  @Output() exportTrip = new EventEmitter<void>();

  defaultCoverImage = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80';

  getTripDuration(): number {
    if (!this.trip?.startDate || !this.trip?.endDate) return 0;
    const start = new Date(this.trip.startDate);
    const end = new Date(this.trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  getTotalActivities(): number {
    if (!this.trip?.itinerary) return 0;
    return this.trip.itinerary.reduce((total, day) => total + day.activities.length, 0);
  }

  getTotalCost(): number {
    if (!this.trip?.itinerary) return 0;
    let total = 0;
    
    // Add accommodation costs
    this.trip.itinerary.forEach(day => {
      if (day.accommodation?.cost) {
        total += day.accommodation.cost.amount;
      }
    });

    // Add transportation costs
    this.trip.itinerary.forEach(day => {
      day.transportation?.forEach(transport => {
        if (transport.cost) {
          total += transport.cost.amount;
        }
      });
    });

    // Add activity costs
    this.trip.itinerary.forEach(day => {
      day.activities.forEach(activity => {
        if (activity.cost) {
          total += activity.cost.amount;
        }
      });
    });

    return total;
  }

  onEditTrip(): void {
    this.editTrip.emit();
  }

  onShareTrip(): void {
    this.shareTrip.emit();
  }

  onExportTrip(): void {
    this.exportTrip.emit();
  }
}
