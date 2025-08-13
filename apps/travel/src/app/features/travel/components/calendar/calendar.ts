import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { Trip, ItineraryDay, Transportation, Activity } from '../../interfaces/trip.interface';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatGridListModule, MatChipsModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})
export class Calendar implements OnInit {
  @Input() currentTrip?: Trip;

  timeSlots = [
    'All Day',
    '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM',
    '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
    '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM',
    '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
  ];

  ngOnInit(): void {
    console.log('Calendar Component Initialized');
    console.log('Current Trip:', this.currentTrip);
    console.log('Itinerary:', this.currentTrip?.itinerary);
  }

  getValidItineraryDays(): ItineraryDay[] {
    if (!this.currentTrip?.itinerary) {
      return [];
    }
    // Filter out any undefined or null values
    return this.currentTrip.itinerary.filter(day => day && day.day);
  }

  getTotalDays(): number {
    return this.getValidItineraryDays().length;
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

  // Event processing methods
  getAllDayEvents(day: ItineraryDay): any[] {
    if (!day) return [];
    
    const events: any[] = [];
    
    // Add accommodation as all-day event
    if (day.accommodation) {
      events.push({
        type: 'accommodation',
        title: day.accommodation.name,
        data: day.accommodation
      });
    }

    // Add transportation that spans multiple days (like trains)
    if (day.transportation?.length) {
      day.transportation.forEach(transport => {
        if (transport && transport.type === 'train' || transport.duration > 120) {
          events.push({
            type: 'transportation',
            title: transport.provider,
            data: transport
          });
        }
      });
    }

    console.log(`All day events for day ${day.day}:`, events);
    return events;
  }

  getEventsForTimeSlot(day: ItineraryDay, timeSlot: string): any[] {
    if (!day) return [];
    
    const events: any[] = [];
    const targetHour = this.parseTimeSlot(timeSlot);

    // Add transportation events
    if (day.transportation?.length) {
      day.transportation.forEach(transport => {
        if (transport && transport.departureTime) {
          const startHour = this.parseTime(transport.departureTime);
          if (startHour === targetHour) {
            events.push({
              type: 'transportation',
              title: transport.provider,
              startTime: transport.departureTime,
              endTime: transport.arrivalTime,
              data: transport
            });
          }
        }
      });
    }

    // Add activity events
    if (day.activities?.length) {
      day.activities.forEach(activity => {
        if (activity && activity.startTime) {
          const startHour = this.parseTime(activity.startTime);
          if (startHour === targetHour) {
            events.push({
              type: 'activity',
              title: activity.title,
              startTime: activity.startTime,
              endTime: activity.endTime,
              data: activity
            });
          }
        }
      });
    }

    if (events.length > 0) {
      console.log(`Events for day ${day.day} at ${timeSlot}:`, events);
    }
    return events;
  }

  getEventIcon(event: any): string {
    if (event.type === 'transportation') {
      return this.getTransportIcon(event.data.type);
    } else if (event.type === 'accommodation') {
      return 'hotel';
    } else {
      return this.getActivityIcon(event.data.type);
    }
  }

  getEventColor(event: any): string {
    switch (event.type) {
      case 'transportation':
        return 'primary';
      case 'accommodation':
        return 'accent';
      case 'activity':
        return 'warn';
      case 'food':
        return 'warn';
      case 'shopping':
        return 'accent';
      case 'entertainment':
        return 'primary';
      case 'relaxation':
        return 'primary';
      default:
        return 'primary';
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

  private parseTimeSlot(timeSlot: string): number {
    if (timeSlot === 'All Day') return -1;
    
    const hour = parseInt(timeSlot.replace(' AM', '').replace(' PM', ''));
    const isPM = timeSlot.includes('PM');
    return isPM && hour !== 12 ? (hour + 12) * 60 : hour * 60;
  }
}
