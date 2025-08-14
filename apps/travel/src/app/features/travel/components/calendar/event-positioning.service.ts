import { Injectable } from '@angular/core';
import { CalendarEvent } from '../event-chip/event-chip';
import { TimeParserFactory, TimeParserStrategy } from './time-parser.strategy';

// Observer Pattern for Event Positioning
export interface EventPositionObserver {
  updatePosition(event: CalendarEvent, position: EventPosition): void;
}

export interface EventPosition {
  top: number;
  left: number;
  width: number;
  height: number;
  zIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventPositioningService {
  private timeParser: TimeParserStrategy;
  private observers: EventPositionObserver[] = [];

  constructor() {
    this.timeParser = TimeParserFactory.createParser('24h');
  }

  // Observer Pattern methods
  addObserver(observer: EventPositionObserver): void {
    this.observers.push(observer);
  }

  removeObserver(observer: EventPositionObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  private notifyObservers(event: CalendarEvent, position: EventPosition): void {
    this.observers.forEach(observer => observer.updatePosition(event, position));
  }

  // Parse time to minutes for precise positioning
  parseTimeToMinutes(time: string): number {
    if (!time) return 0;
    
    // Handle 24-hour format (e.g., "17:30", "19:30")
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Calculate event duration in minutes
  calculateEventDuration(event: CalendarEvent): number {
    if (!event.startTime || !event.endTime) return 60;
    
    const startMinutes = this.parseTimeToMinutes(event.startTime);
    const endMinutes = this.parseTimeToMinutes(event.endTime);
    
    // Handle events that span across midnight
    const duration = endMinutes >= startMinutes ? endMinutes - startMinutes : (24 * 60 - startMinutes) + endMinutes;
    return Math.max(60, duration);
  }

  // Calculate event row span (how many time slots it occupies)
  calculateEventRowSpan(event: CalendarEvent): number {
    const durationMinutes = this.calculateEventDuration(event);
    return Math.ceil(durationMinutes / 60); // Convert minutes to hours, round up
  }

  // Check if two events overlap in time
  doEventsOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
    if (!event1.startTime || !event1.endTime || !event2.startTime || !event2.endTime) {
      return false;
    }

    const start1 = this.timeParser.parseTime(event1.startTime);
    const end1 = this.timeParser.parseTime(event1.endTime);
    const start2 = this.timeParser.parseTime(event2.startTime);
    const end2 = this.timeParser.parseTime(event2.endTime);

    // Handle events that span across midnight
    const normalizedEnd1 = end1 >= start1 ? end1 : end1 + 24;
    const normalizedEnd2 = end2 >= start2 ? end2 : end2 + 24;
    const normalizedStart2 = start2 >= start1 ? start2 : start2 + 24;

    return start1 < normalizedEnd2 && normalizedStart2 < normalizedEnd1;
  }

  // Calculate optimal positions for overlapping events
  calculateEventPositions(events: CalendarEvent[], timeSlot: string): Map<CalendarEvent, EventPosition> {
    const positions = new Map<CalendarEvent, EventPosition>();
    const overlappingGroups: CalendarEvent[][] = [];

    // Group overlapping events
    events.forEach(event => {
      let addedToGroup = false;
      
      for (const group of overlappingGroups) {
        const overlapsWithGroup = group.some(groupEvent => this.doEventsOverlap(event, groupEvent));
        if (overlapsWithGroup) {
          group.push(event);
          addedToGroup = true;
          break;
        }
      }
      
      if (!addedToGroup) {
        overlappingGroups.push([event]);
      }
    });

    // Calculate positions for each group
    overlappingGroups.forEach(group => {
      const groupWidth = 100 / group.length; // Divide width equally
      
      group.forEach((event, index) => {
        const positionInSlot = this.getEventPositionInTimeSlot(event, timeSlot);
        const position: EventPosition = {
          top: positionInSlot, // Position based on minutes within the time slot
          left: index * groupWidth,
          width: groupWidth - 2, // Leave 2px gap
          height: this.getEventHeight(event), // Use precise height calculation
          zIndex: 10 + index
        };
        
        positions.set(event, position);
        this.notifyObservers(event, position);
      });
    });

    return positions;
  }

  // Get time slot hour for display
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

  // Check if event should be shown in this time slot
  shouldShowEventInTimeSlot(event: CalendarEvent, timeSlot: string): boolean {
    if (!event.startTime) return false;
    
    const eventStartHour = this.timeParser.parseTime(event.startTime);
    const slotHour = this.getTimeSlotHour(timeSlot);
    
    // Only show event in its starting time slot
    return eventStartHour === slotHour;
  }

  // Calculate the exact position within a time slot (0-60 minutes)
  getEventPositionInTimeSlot(event: CalendarEvent, timeSlot: string): number {
    if (!event.startTime) return 0;
    
    const eventStartMinutes = this.parseTimeToMinutes(event.startTime);
    const slotHour = this.getTimeSlotHour(timeSlot);
    const slotStartMinutes = slotHour * 60;
    
    // Calculate how many minutes into this time slot the event starts
    return eventStartMinutes - slotStartMinutes;
  }

  // Calculate event height in pixels
  getEventHeight(event: CalendarEvent): number {
    const durationMinutes = this.calculateEventDuration(event);
    const heightPerMinute = 1; // 1px per minute
    return Math.max(30, durationMinutes * heightPerMinute); // Minimum 30px height
  }
}
