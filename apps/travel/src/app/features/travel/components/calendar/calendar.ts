import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Trip, ItineraryDay } from '../../interfaces/trip.interface';
import { EventChipComponent, CalendarEvent } from '../event-chip/event-chip';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule, EventChipComponent],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {
  @Input() currentTrip?: Trip;

  timeSlots = [
    'All Day',
    '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
    '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
  ];

  constructor() {}

  ngOnInit() {
    // Initialize
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  getValidItineraryDays(): ItineraryDay[] {
    if (!this.currentTrip?.itinerary) return [];
    return this.currentTrip.itinerary.filter(day => day && day.day);
  }

  getTotalDays(): number {
    return this.getValidItineraryDays().length;
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString()}`;
  }

  getTransportIcon(type: string): string {
    switch (type) {
      case 'flight': return 'flight';
      case 'train': return 'train';
      case 'bus': return 'directions_bus';
      case 'car': return 'directions_car';
      case 'bike': return 'pedal_bike';
      default: return 'directions_car';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'sightseeing': return 'explore';
      case 'adventure': return 'hiking';
      case 'cultural': return 'museum';
      case 'relaxation': return 'spa';
      case 'shopping': return 'shopping_bag';
      default: return 'explore';
    }
  }

  getDayTimelineItems(day: ItineraryDay): any[] {
    if (!day) return [];
    
    const items: any[] = [];
    
    // Add accommodation (check-in/check-out)
    if (day.accommodation) {
      if (day.accommodation.checkIn) {
        items.push({
          ...day.accommodation,
          type: 'accommodation',
          title: `Check-in: ${day.accommodation.name}`,
          startTime: day.accommodation.checkIn,
          endTime: day.accommodation.checkIn,
          isCheckIn: true
        });
      }
      if (day.accommodation.checkOut) {
        items.push({
          ...day.accommodation,
          type: 'accommodation',
          title: `Check-out: ${day.accommodation.name}`,
          startTime: day.accommodation.checkOut,
          endTime: day.accommodation.checkOut,
          isCheckOut: true
        });
      }
    }
    
    // Add transportation
    if (day.transportation) {
      day.transportation.forEach(transport => {
        if (transport.departureTime) {
          items.push({
            ...transport,
            type: 'transportation',
            title: `${transport.type} to ${transport.to}`,
            startTime: transport.departureTime,
            endTime: transport.arrivalTime || transport.departureTime
          });
        }
      });
    }
    
    // Add activities
    if (day.activities) {
      day.activities.forEach(activity => {
        if (activity.startTime) {
          items.push({
            ...activity,
            type: 'activity',
            title: activity.title,
            startTime: activity.startTime,
            endTime: activity.endTime || activity.startTime
          });
        }
      });
    }
    
    // Sort by time
    return items.sort((a, b) => this.parseTime(a.startTime) - this.parseTime(b.startTime));
  }

  parseTime(time: string): number {
    if (!time) return 0;
    
    // Handle 24-hour format (e.g., "17:30", "19:30")
    const [hours] = time.split(':').map(Number);
    return hours; // Return just the hour, not minutes
  }

  getAllDayEvents(day: ItineraryDay): CalendarEvent[] {
    if (!day) return [];
    
    const events: CalendarEvent[] = [];
    
    // Add accommodation as all-day event (only if accommodation exists and has check-in/check-out)
    if (day.accommodation && (day.accommodation.checkIn || day.accommodation.checkOut)) {
      events.push({
        title: day.accommodation.name,
        type: 'accommodation',
        isAllDay: true
      });
    }
    
    // Add long-duration activities as all-day events
    if (day.activities) {
      day.activities.forEach(activity => {
        if (activity.duration && activity.duration > 120) { // More than 2 hours
          events.push({
            title: activity.title,
            type: 'activity',
            isAllDay: true
          });
        }
      });
    }
    
    return events;
  }

  getEventsForTimeSlot(day: ItineraryDay, timeSlot: string): CalendarEvent[] {
    if (!day || timeSlot === 'All Day') return [];
    
    const events: CalendarEvent[] = [];
    const timelineItems = this.getDayTimelineItems(day);
    
    timelineItems.forEach((item, index) => {
      if (item.startTime && item.endTime) {
        const event: CalendarEvent = {
          title: item.title,
          type: item.type,
          startTime: item.startTime,
          endTime: item.endTime,
          isAllDay: false,
          index: index
        };
        
        // Check if event should be shown in this time slot
        if (this.shouldShowEventInTimeSlot(event, timeSlot)) {
          events.push(event);
        }
      }
    });
    
    return events;
  }

  shouldShowEventInTimeSlot(event: CalendarEvent, timeSlot: string): boolean {
    if (!event.startTime) return false;
    
    const eventStartHour = this.parseTime(event.startTime); // 24-hour format (0-23)
    const slotHour = this.getTimeSlotHour(timeSlot); // 24-hour format (0-23)
    
    // Direct comparison of 24-hour values
    return eventStartHour === slotHour;
  }

  getTimeSlotHour(timeSlot: string): number {
    if (timeSlot === 'All Day') return -1;
    
    const timeMap: { [key: string]: number } = {
      '12 AM': 0, '1 AM': 1, '2 AM': 2, '3 AM': 3, '4 AM': 4, '5 AM': 5,
      '6 AM': 6, '7 AM': 7, '8 AM': 8, '9 AM': 9, '10 AM': 10, '11 AM': 11,
      '12 PM': 12, '1 PM': 13, '2 PM': 14, '3 PM': 15, '4 PM': 16, '5 PM': 17,
      '6 PM': 18, '7 PM': 19, '8 PM': 20, '9 PM': 21, '10 PM': 22, '11 PM': 23
    };
    
    return timeMap[timeSlot] || 0;
  }

  // TrackBy functions for performance
  trackByDay(index: number, day: ItineraryDay): number {
    return day.day;
  }

  trackByTimeSlot(index: number, timeSlot: string): string {
    return timeSlot;
  }

  trackByEvent(index: number, event: CalendarEvent): string {
    return event.title + event.type;
  }
}
