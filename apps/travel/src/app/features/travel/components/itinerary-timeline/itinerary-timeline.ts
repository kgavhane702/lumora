import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ItineraryDay, Activity, Transportation } from '../../interfaces/trip.interface';
import { FlightCard } from '../flight-card/flight-card';
import { TransferCard } from '../transfer-card/transfer-card';
import { AccommodationCard } from '../accommodation-card/accommodation-card';
import { SightseeingCard } from '../sightseeing-card/sightseeing-card';

@Component({
  selector: 'app-itinerary-timeline',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule,
    FlightCard,
    TransferCard,
    AccommodationCard,
    SightseeingCard
  ],
  templateUrl: './itinerary-timeline.html',
  styleUrls: ['./itinerary-timeline.scss']
})
export class ItineraryTimeline {
  @Input() itineraryDays: ItineraryDay[] = [];
  @Output() addActivity = new EventEmitter<void>();
  @Output() editActivity = new EventEmitter<Activity>();
  @Output() viewActivity = new EventEmitter<Activity>();
  @Output() bookActivity = new EventEmitter<Activity>();
  @Output() editDay = new EventEmitter<ItineraryDay>();
  @Output() addActivityToDay = new EventEmitter<ItineraryDay>();
  @Output() exportItinerary = new EventEmitter<void>();
  @Output() editFlight = new EventEmitter<Transportation>();
  @Output() editTransfer = new EventEmitter<Transportation>();
  @Output() editAccommodation = new EventEmitter<any>();

  expandedDays = new Set<number>();

  trackByDay(index: number, day: ItineraryDay): number {
    return day.day;
  }

  trackByActivity(index: number, activity: Activity): string {
    return activity.id;
  }

  trackByTransport(index: number, transport: Transportation): string {
    return transport.id || index.toString();
  }

  getTransportIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      flight: 'flight',
      train: 'train',
      bus: 'directions_bus',
      car: 'directions_car',
      boat: 'directions_boat',
      walking: 'directions_walk'
    };
    return iconMap[type] || 'directions_car';
  }

  getActivityIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      sightseeing: 'explore',
      food: 'restaurant',
      entertainment: 'sports_esports',
      relaxation: 'spa',
      shopping: 'shopping_bag',
      transport: 'directions_car',
      accommodation: 'hotel'
    };
    return iconMap[type] || 'event';
  }

  getDayIcon(day: number): string {
    const iconMap: { [key: number]: string } = {
      1: 'flight_land',
      2: 'restaurant',
      3: 'shopping_bag',
      4: 'directions_boat',
      5: 'church',
      6: 'beach_access'
    };
    return iconMap[day] || 'event';
  }

  toggleDay(day: number): void {
    if (this.expandedDays.has(day)) {
      this.expandedDays.delete(day);
    } else {
      this.expandedDays.add(day);
    }
  }

  getFlightCount(): number {
    return this.itineraryDays.reduce((count, day) => {
      return count + (day.transportation?.filter(t => t.type === 'flight').length || 0);
    }, 0);
  }

  getLodgingCount(): number {
    return this.itineraryDays.filter(day => day.accommodation).length;
  }

  getTransferCount(): number {
    return this.itineraryDays.reduce((count, day) => {
      return count + (day.transportation?.filter(t => t.type !== 'flight').length || 0);
    }, 0);
  }

  getTotalBudget(): number {
    return this.itineraryDays.reduce((total, day) => {
      let dayTotal = 0;
      
      // Add accommodation cost
      if (day.accommodation?.cost?.amount) {
        dayTotal += day.accommodation.cost.amount;
      }
      
      // Add transportation costs
      if (day.transportation) {
        day.transportation.forEach(transport => {
          if (transport.cost?.amount) {
            dayTotal += transport.cost.amount;
          }
        });
      }
      
      // Add activity costs
      if (day.activities) {
        day.activities.forEach(activity => {
          if (activity.cost?.amount) {
            dayTotal += activity.cost.amount;
          }
        });
      }
      
      return total + dayTotal;
    }, 0);
  }

  getDayBudget(day: ItineraryDay): number {
    let dayTotal = 0;
    
    // Add accommodation cost
    if (day.accommodation?.cost?.amount) {
      dayTotal += day.accommodation.cost.amount;
    }
    
    // Add transportation costs
    if (day.transportation) {
      day.transportation.forEach(transport => {
        if (transport.cost?.amount) {
          dayTotal += transport.cost.amount;
        }
      });
    }
    
    // Add activity costs
    if (day.activities) {
      day.activities.forEach(activity => {
        if (activity.cost?.amount) {
          dayTotal += activity.cost.amount;
        }
      });
    }
    
    return dayTotal;
  }

  onAddActivity(): void {
    this.addActivity.emit();
  }

  onEditActivity(activity: Activity): void {
    this.editActivity.emit(activity);
  }

  onViewActivity(activity: Activity): void {
    this.viewActivity.emit(activity);
  }

  onBookActivity(activity: Activity): void {
    this.bookActivity.emit(activity);
  }

  onEditDay(day: ItineraryDay): void {
    this.editDay.emit(day);
  }

  onAddActivityToDay(day: ItineraryDay): void {
    this.addActivityToDay.emit(day);
  }

  onExportItinerary(): void {
    this.exportItinerary.emit();
  }

  onEditFlight(transport: Transportation): void {
    this.editFlight.emit(transport);
  }

  onEditTransfer(transport: Transportation): void {
    this.editTransfer.emit(transport);
  }

  onEditAccommodation(accommodation: any): void {
    this.editAccommodation.emit(accommodation);
  }
}
