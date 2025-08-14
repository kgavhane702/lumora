import { Injectable } from '@angular/core';
import { CalendarEvent } from '../event-chip/event-chip';

export interface GranularTimePosition {
  top: number;        // Position in pixels from top of day
  left: number;       // Position in percentage from left
  width: number;      // Width in percentage
  height: number;     // Height in pixels
  zIndex: number;     // Z-index for layering
  startMinute: number; // Start minute of the day (0-1439)
  endMinute: number;   // End minute of the day (0-1439)
}

@Injectable({
  providedIn: 'root'
})
export class GranularTimeGridService {
  private readonly MINUTES_PER_DAY = 24 * 60; // 1440 minutes
  private readonly PIXELS_PER_MINUTE = 1; // 1 pixel per minute
  private readonly DAY_HEIGHT = this.MINUTES_PER_DAY * this.PIXELS_PER_MINUTE; // 1440px

  // Convert time string to minutes since midnight
  timeToMinutes(time: string): number {
    if (!time) return 0;
    
    // Handle 24-hour format (e.g., "17:30", "19:30")
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Convert minutes to time string
  minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Calculate event position in the granular grid
  calculateEventPosition(event: CalendarEvent, dayEvents: CalendarEvent[]): GranularTimePosition {
    if (!event.startTime || !event.endTime) {
      return this.getDefaultPosition();
    }

    const startMinute = this.timeToMinutes(event.startTime);
    const endMinute = this.timeToMinutes(event.endTime);
    
    // Handle events that span across midnight
    const duration = endMinute >= startMinute ? endMinute - startMinute : (this.MINUTES_PER_DAY - startMinute) + endMinute;
    
    // Calculate overlapping events
    const overlappingEvents = this.findOverlappingEvents(event, dayEvents);
    const eventIndex = overlappingEvents.indexOf(event);
    const totalOverlapping = overlappingEvents.length;
    
    // Calculate position
    const top = startMinute * this.PIXELS_PER_MINUTE;
    const height = Math.max(30, duration * this.PIXELS_PER_MINUTE); // Minimum 30px
    const width = totalOverlapping > 1 ? (100 / totalOverlapping) - 2 : 98; // Leave 2% gap
    const left = totalOverlapping > 1 ? eventIndex * (100 / totalOverlapping) : 1;
    const zIndex = 10 + eventIndex;

    return {
      top,
      left,
      width,
      height,
      zIndex,
      startMinute,
      endMinute: startMinute + duration
    };
  }

  // Find all events that overlap with the given event
  private findOverlappingEvents(event: CalendarEvent, allEvents: CalendarEvent[]): CalendarEvent[] {
    if (!event.startTime || !event.endTime) return [event];

    const eventStart = this.timeToMinutes(event.startTime);
    const eventEnd = this.timeToMinutes(event.endTime);
    
    const overlapping: CalendarEvent[] = [];
    
    allEvents.forEach(otherEvent => {
      if (!otherEvent.startTime || !otherEvent.endTime) return;
      
      const otherStart = this.timeToMinutes(otherEvent.startTime);
      const otherEnd = this.timeToMinutes(otherEvent.endTime);
      
      // Check for overlap
      if (this.doEventsOverlap(eventStart, eventEnd, otherStart, otherEnd)) {
        overlapping.push(otherEvent);
      }
    });
    
    // Sort by start time
    return overlapping.sort((a, b) => {
      const aStart = this.timeToMinutes(a.startTime || '00:00');
      const bStart = this.timeToMinutes(b.startTime || '00:00');
      return aStart - bStart;
    });
  }

  // Check if two time ranges overlap
  private doEventsOverlap(start1: number, end1: number, start2: number, end2: number): boolean {
    // Handle events that span across midnight
    const normalizedEnd1 = end1 >= start1 ? end1 : end1 + this.MINUTES_PER_DAY;
    const normalizedEnd2 = end2 >= start2 ? end2 : end2 + this.MINUTES_PER_DAY;
    const normalizedStart2 = start2 >= start1 ? start2 : start2 + this.MINUTES_PER_DAY;
    
    return start1 < normalizedEnd2 && normalizedStart2 < normalizedEnd1;
  }

  // Get default position for events without time
  private getDefaultPosition(): GranularTimePosition {
    return {
      top: 0,
      left: 1,
      width: 98,
      height: 30,
      zIndex: 10,
      startMinute: 0,
      endMinute: 30
    };
  }

  // Get all events for a day with their positions
  getDayEventsWithPositions(dayEvents: CalendarEvent[]): Map<CalendarEvent, GranularTimePosition> {
    const positions = new Map<CalendarEvent, GranularTimePosition>();
    
    dayEvents.forEach(event => {
      const position = this.calculateEventPosition(event, dayEvents);
      positions.set(event, position);
    });
    
    return positions;
  }

  // Get time slots for display (every hour)
  getTimeSlots(): string[] {
    const slots = ['All Day'];
    
    for (let hour = 0; hour < 24; hour++) {
      const timeStr = this.minutesToTime(hour * 60);
      const displayTime = this.formatTimeForDisplay(hour);
      slots.push(displayTime);
    }
    
    return slots;
  }

  // Format time for display (12-hour format)
  private formatTimeForDisplay(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  }

  // Get day height in pixels
  getDayHeight(): number {
    return this.DAY_HEIGHT;
  }

  // Get pixels per minute ratio
  getPixelsPerMinute(): number {
    return this.PIXELS_PER_MINUTE;
  }
}
