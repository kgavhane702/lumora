// Strategy Pattern for Time Parsing
export interface TimeParserStrategy {
  parseTime(time: string): number; // Returns hour in 24-hour format (0-23)
  formatTimeForDisplay(hour: number): string; // Returns display format
}

export class TwentyFourHourTimeParser implements TimeParserStrategy {
  parseTime(time: string): number {
    if (!time) return 0;
    
    // Handle 24-hour format (e.g., "17:30", "19:30")
    const [hours, minutes] = time.split(':').map(Number);
    return hours;
  }

  formatTimeForDisplay(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  }
}

export class TwelveHourTimeParser implements TimeParserStrategy {
  parseTime(time: string): number {
    if (!time) return 0;
    
    // Handle 12-hour format (e.g., "5:30 PM", "7:30 PM")
    const [timeStr, period] = time.split(' ');
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    let hour = hours;
    if (period === 'PM' && hours !== 12) hour += 12;
    if (period === 'AM' && hours === 12) hour = 0;
    
    return hour;
  }

  formatTimeForDisplay(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  }
}

// Factory Pattern for Time Parser
export class TimeParserFactory {
  static createParser(timeFormat: '12h' | '24h' = '24h'): TimeParserStrategy {
    switch (timeFormat) {
      case '12h':
        return new TwelveHourTimeParser();
      case '24h':
      default:
        return new TwentyFourHourTimeParser();
    }
  }
}
