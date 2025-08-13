import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Trip, ItineraryDay, Transportation, Activity } from '../../interfaces/trip.interface';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})
export class Calendar {
  @Input() currentTrip?: Trip;

  getTotalDays(): number {
    return this.currentTrip?.itinerary.length || 0;
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  getTransportIcon(type: string): string {
    switch (type) {
      case 'flight': return 'flight';
      case 'car': return 'directions_car';
      case 'bus': return 'directions_bus';
      case 'train': return 'train';
      case 'boat': return 'directions_boat';
      case 'bike': return 'pedal_bike';
      case 'walking': return 'directions_walk';
      default: return 'directions_car';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'sightseeing': return 'explore';
      case 'food': return 'restaurant';
      case 'shopping': return 'shopping_bag';
      case 'entertainment': return 'sports_esports';
      case 'relaxation': return 'spa';
      case 'accommodation': return 'hotel';
      default: return 'event';
    }
  }

  getDayTimelineItems(day: ItineraryDay): any[] {
    const items: any[] = [];

    // Add transportation items
    if (day.transportation?.length) {
      day.transportation.forEach(transport => {
        items.push({
          type: 'transportation',
          data: transport,
          trackId: `transport-${transport.id}`,
          time: transport.departureTime
        });
      });
    }

    // Add accommodation item
    if (day.accommodation) {
      items.push({
        type: 'accommodation',
        data: day.accommodation,
        trackId: `accommodation-${day.accommodation.id}`,
        time: day.accommodation.checkIn || '00:00'
      });
    }

    // Add activity items
    if (day.activities?.length) {
      day.activities.forEach(activity => {
        items.push({
          type: 'activity',
          data: activity,
          trackId: `activity-${activity.id}`,
          time: activity.startTime
        });
      });
    }

    // Sort by time
    const sortedItems = items.sort((a, b) => {
      const timeA = this.parseTime(a.time);
      const timeB = this.parseTime(b.time);
      return timeA - timeB;
    });

    return sortedItems;
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
