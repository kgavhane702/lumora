import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

import { Trip, Activity, ItineraryDay, Transportation } from '../interfaces/trip.interface';
import { Calendar } from '../components/calendar/calendar';

@Component({
  selector: 'app-travel',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatExpansionModule, Calendar],
  templateUrl: './travel.html',
  styleUrls: ['./travel.scss']
})
export class Travel implements OnInit {

  currentTrip?: Trip;
  activeFilter: string = 'all'; // Track which filter is active
  activeTab: string = 'itinerary'; // Track which tab is active

  ngOnInit(): void {
    this.loadSampleTrip();
  }





  getTotalTransfers(): number {
    return this.currentTrip?.itinerary.reduce((total, day) => 
      total + (day.transportation?.length || 0), 0) || 0;
  }

  getTotalHotels(): number {
    return this.currentTrip?.itinerary.filter(day => day.accommodation).length || 0;
  }

  getTotalActivities(): number {
    return this.currentTrip?.itinerary.reduce((total, day) => 
      total + (day.activities?.length || 0), 0) || 0;
  }

  getTotalMeals(): number {
    return this.currentTrip?.itinerary.reduce((total, day) => 
      total + (day.activities?.filter(activity => activity.type === 'food').length || 0), 0) || 0;
  }

  getTotalDays(): number {
    return this.currentTrip?.itinerary.length || 0;
  }

  getTotalTripCost(): number {
    if (!this.currentTrip) return 0;
    
    let total = 0;
    
    // Add accommodation costs
    this.currentTrip.itinerary.forEach(day => {
      if (day.accommodation?.cost) {
        total += day.accommodation.cost.amount;
      }
    });
    
    // Add transportation costs
    this.currentTrip.itinerary.forEach(day => {
      day.transportation?.forEach(transport => {
        if (transport.cost) {
          total += transport.cost.amount;
        }
      });
    });
    
    // Add activity costs
    this.currentTrip.itinerary.forEach(day => {
      day.activities?.forEach(activity => {
        if (activity.cost) {
          total += activity.cost.amount;
        }
      });
    });
    
    return total;
  }

  getDayCost(day: ItineraryDay): number {
    let total = 0;
    
    // Add accommodation cost
    if (day.accommodation?.cost) {
      total += day.accommodation.cost.amount;
    }
    
    // Add transportation costs
    day.transportation?.forEach(transport => {
      if (transport.cost) {
        total += transport.cost.amount;
      }
    });
    
    // Add activity costs
    day.activities?.forEach(activity => {
      if (activity.cost) {
        total += activity.cost.amount;
      }
    });
    
    return total;
  }

  getBudgetRemaining(): number {
    const totalCost = this.getTotalTripCost();
    const budget = this.currentTrip?.budget?.amount || 0;
    return budget - totalCost;
  }

  getBudgetPercentage(): number {
    const totalCost = this.getTotalTripCost();
    const budget = this.currentTrip?.budget?.amount || 0;
    return budget > 0 ? (totalCost / budget) * 100 : 0;
  }

  getWeatherIcon(condition: string): string {
    switch (condition.toLowerCase()) {
      case 'sunny': return '☀️';
      case 'partly cloudy': return '⛅';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      case 'stormy': return '⛈️';
      case 'foggy': return '🌫️';
      default: return '🌤️';
    }
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
  }

  isFilterActive(filter: string): boolean {
    return this.activeFilter === filter;
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  isTabActive(tab: string): boolean {
    return this.activeTab === tab;
  }

  getDayIncludes(day: ItineraryDay): string {
    const includes = [];
    if (day.transportation?.length) includes.push(`${day.transportation.length} Transfer`);
    if (day.accommodation) includes.push('1 Hotel');
    if (day.activities?.length) includes.push(`${day.activities.length} Activity`);
    return includes.join(' ');
  }

  getTransferDescription(transportation: Transportation[] | undefined): string {
    if (!transportation || transportation.length === 0) return 'No transfers';
    if (transportation.length === 1) {
      return `${transportation[0].from} to ${transportation[0].to}`;
    }
    return `${transportation.length} transfers`;
  }

  getAccommodationNights(accommodation: any): string {
    return '3 Nights'; // This would be calculated based on check-in/check-out dates
  }

  getCheckoutDate(day: ItineraryDay): Date {
    // This would be calculated based on accommodation check-out date
    return new Date(day.date.getTime() + 3 * 24 * 60 * 60 * 1000);
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

    // Apply filter if not showing all
    if (this.activeFilter !== 'all') {
      return sortedItems.filter(item => {
        switch (this.activeFilter) {
          case 'transfers':
            return item.type === 'transportation';
          case 'hotels':
            return item.type === 'accommodation';
          case 'activities':
            return item.type === 'activity';
          case 'meals':
            return item.type === 'activity' && item.data.type === 'food';
          default:
            return true;
        }
      });
    }

    return sortedItems;
  }

  private loadSampleTrip(): void {
    this.currentTrip = {
      id: '1',
      title: 'Romantic Goa Family Getaway',
      destination: 'North Goa, India',
      startDate: new Date('2024-12-15'),
      endDate: new Date('2024-12-20'),
      description: 'A perfect family vacation with romantic moments, local cuisine, and relaxation in beautiful North Goa',
      coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      budget: {
        currency: 'INR',
        amount: 70000
      },
      status: 'planning',
      itinerary: [
        {
          day: 1,
          date: new Date('2024-12-15'),
          title: 'Arrival & Beach Welcome',
          location: 'Candolim, North Goa',
          weather: {
            condition: 'sunny',
            temperature: 28,
            icon: '☀️'
          },
          transportation: [
            {
              id: '1',
              type: 'flight',
              provider: 'Air India',
              from: 'MUM',
              to: 'GOI',
              departureTime: '10:00',
              arrivalTime: '11:30',
              duration: 90,
              status: 'booked',
              cost: {
                currency: 'INR',
                amount: 12000
              },
              bookingReference: 'AI123456',
              details: {
                flightNumber: 'AI 123',
                terminal: 'T1',
                gate: 'A12',
                arrivalTerminal: 'T1',
                arrivalGate: 'B8'
              }
            },
            {
              id: '2',
              type: 'car',
              provider: 'Goa Taxi Services',
              from: 'Goa International Airport',
              to: 'Candolim Beach Resort',
              departureTime: '12:00',
              arrivalTime: '12:45',
              duration: 45,
              status: 'booked',
              cost: {
                currency: 'INR',
                amount: 800
              },
              bookingReference: 'GTS789',
              details: {
                platform: 'Arrival Gate'
              }
            }
          ],
          activities: [
            {
              id: '3',
              type: 'relaxation',
              title: 'Beach Welcome & Sunset',
              description: 'Welcome drink on the beach, baby-friendly area, romantic sunset viewing',
              location: 'Candolim Beach',
              startTime: '17:00',
              endTime: '19:00',
              duration: 120,
              status: 'planned',
              priority: 'medium',
              tags: ['beach', 'sunset', 'romantic', 'family'],
              cost: {
                currency: 'INR',
                amount: 1500
              }
            }
          ],
          accommodation: {
            id: '1',
            name: 'Candolim Beach Resort & Spa',
            type: 'resort',
            address: 'Candolim Beach Road, North Goa',
            checkIn: '14:00',
            checkOut: '11:00',
            roomType: 'Deluxe Sea View Room',
            confirmationNumber: 'CBR241215',
            cost: {
              currency: 'INR',
              amount: 8500
            },
            amenities: ['Beachfront', 'Swimming Pool', 'Kids Play Area', 'Spa', 'Restaurant'],
            images: [
              'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80',
              'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
              'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
            ]
          }
        },
        {
          day: 2,
          date: new Date('2024-12-16'),
          title: 'Local Cuisine & Fort Aguada',
          location: 'Candolim & Fort Aguada, North Goa',
          weather: {
            condition: 'partly cloudy',
            temperature: 27,
            icon: '⛅'
          },
          transportation: [
            {
              id: '3',
              type: 'car',
              provider: 'Resort Shuttle',
              from: 'Candolim Beach Resort',
              to: 'Fort Aguada',
              departureTime: '09:30',
              arrivalTime: '09:45',
              duration: 15,
              status: 'booked',
              cost: {
                currency: 'INR',
                amount: 0
              },
              bookingReference: 'RSH001',
              details: {
                platform: 'Resort Lobby'
              }
            },
            {
              id: '4',
              type: 'car',
              provider: 'Resort Shuttle',
              from: 'Fort Aguada',
              to: 'Fisherman\'s Wharf',
              departureTime: '12:30',
              arrivalTime: '12:45',
              duration: 15,
              status: 'booked',
              cost: {
                currency: 'INR',
                amount: 0
              },
              bookingReference: 'RSH002',
              details: {
                platform: 'Fort Parking'
              }
            }
          ],
          activities: [
            {
              id: '5',
              type: 'food',
              title: 'Traditional Goan Breakfast',
              description: 'Local breakfast with poi, fish curry, and fresh coconut water',
              location: 'Resort Restaurant',
              startTime: '08:00',
              endTime: '09:30',
              duration: 90,
              status: 'planned',
              priority: 'medium',
              tags: ['breakfast', 'local', 'goan'],
              cost: {
                currency: 'INR',
                amount: 800
              }
            },
            {
              id: '6',
              type: 'sightseeing',
              title: 'Fort Aguada Visit',
              description: 'Historic Portuguese fort with stunning sea views, family-friendly exploration',
              location: 'Fort Aguada',
              startTime: '10:00',
              endTime: '12:00',
              duration: 120,
              status: 'planned',
              priority: 'high',
              tags: ['fort', 'history', 'views', 'family'],
              cost: {
                currency: 'INR',
                amount: 200
              }
            },
            {
              id: '7',
              type: 'food',
              title: 'Local Seafood Lunch',
              description: 'Fresh seafood at popular local restaurant - prawns, fish curry, and rice',
              location: 'Fisherman\'s Wharf',
              startTime: '13:00',
              endTime: '14:30',
              duration: 90,
              status: 'planned',
              priority: 'high',
              tags: ['lunch', 'seafood', 'local', 'goan'],
              cost: {
                currency: 'INR',
                amount: 1200
              }
            },
            {
              id: '8',
              type: 'relaxation',
              title: 'Resort Pool Time',
              description: 'Family pool time, baby splash area, romantic poolside cocktails',
              location: 'Resort Pool',
              startTime: '15:00',
              endTime: '17:00',
              duration: 120,
              status: 'planned',
              priority: 'medium',
              tags: ['pool', 'family', 'relaxation'],
              cost: {
                currency: 'INR',
                amount: 500
              }
            }
          ]
        },
        {
          day: 3,
          date: new Date('2024-12-17'),
          title: 'Anjuna Beach & Local Market',
          location: 'Anjuna, North Goa',
          weather: {
            condition: 'sunny',
            temperature: 29,
            icon: '☀️'
          },
          transportation: [
            {
              id: '5',
              type: 'car',
              provider: 'Goa Taxi Services',
              from: 'Candolim Beach Resort',
              to: 'Anjuna Beach',
              departureTime: '08:30',
              arrivalTime: '09:00',
              duration: 30,
              status: 'booked',
              cost: {
                currency: 'INR',
                amount: 600
              },
              bookingReference: 'GTS456',
              details: {
                platform: 'Resort Lobby'
              }
            },
            {
              id: '6',
              type: 'car',
              provider: 'Goa Taxi Services',
              from: 'Anjuna Flea Market',
              to: 'Candolim Beach Resort',
              departureTime: '16:00',
              arrivalTime: '16:30',
              duration: 30,
              status: 'booked',
              cost: {
                currency: 'INR',
                amount: 600
              },
              bookingReference: 'GTS789',
              details: {
                platform: 'Market Parking'
              }
            }
          ],
          activities: [
            {
              id: '9',
              type: 'sightseeing',
              title: 'Anjuna Beach Visit',
              description: 'Famous Anjuna Beach, family-friendly area, scenic views',
              location: 'Anjuna Beach',
              startTime: '09:00',
              endTime: '11:00',
              duration: 120,
              status: 'planned',
              priority: 'high',
              tags: ['beach', 'anjuna', 'scenic', 'family'],
              cost: {
                currency: 'INR',
                amount: 0
              }
            },
            {
              id: '10',
              type: 'shopping',
              title: 'Anjuna Flea Market',
              description: 'Local handicrafts, souvenirs, baby clothes, and jewelry',
              location: 'Anjuna Flea Market',
              startTime: '11:30',
              endTime: '13:00',
              duration: 90,
              status: 'planned',
              priority: 'medium',
              tags: ['shopping', 'local', 'souvenirs'],
              cost: {
                currency: 'INR',
                amount: 2000
              }
            },
            {
              id: '11',
              type: 'food',
              title: 'Local Thali Lunch',
              description: 'Traditional Goan thali with multiple curries, rice, and breads',
              location: 'Anjuna Local Restaurant',
              startTime: '13:30',
              endTime: '15:00',
              duration: 90,
              status: 'planned',
              priority: 'high',
              tags: ['lunch', 'thali', 'traditional', 'goan'],
              cost: {
                currency: 'INR',
                amount: 600
              }
            },
            {
              id: '12',
              type: 'relaxation',
              title: 'Couple Spa Session',
              description: 'Romantic couple spa with traditional Goan massage',
              location: 'Resort Spa',
              startTime: '16:00',
              endTime: '18:00',
              duration: 120,
              status: 'planned',
              priority: 'high',
              tags: ['spa', 'romantic', 'couple', 'massage'],
              cost: {
                currency: 'INR',
                amount: 3500
              }
            }
          ]
        },
        {
          day: 4,
          date: new Date('2024-12-18'),
          title: 'Baga Beach & Water Sports',
          location: 'Baga, North Goa',
          weather: {
            condition: 'sunny',
            temperature: 28,
            icon: '☀️'
          },
          transportation: [
            {
              id: '7',
              type: 'car',
              provider: 'Goa Taxi Services',
              from: 'Candolim Beach Resort',
              to: 'Baga Beach',
              departureTime: '08:30',
              arrivalTime: '09:00',
              duration: 30,
              status: 'booked',
              cost: {
                currency: 'INR',
                amount: 500
              },
              bookingReference: 'GTS101',
              details: {
                platform: 'Resort Lobby'
              }
            },
            {
              id: '8',
              type: 'boat',
              provider: 'Mandovi River Cruises',
              from: 'Baga Beach Jetty',
              to: 'Mandovi River Cruise Point',
              departureTime: '17:00',
              arrivalTime: '17:15',
              duration: 15,
              status: 'booked',
              cost: {
                currency: 'INR',
                amount: 200
              },
              bookingReference: 'MRC001',
              details: {
                platform: 'Baga Jetty'
              }
            },
            {
              id: '9',
              type: 'car',
              provider: 'Goa Taxi Services',
              from: 'Mandovi River Cruise Point',
              to: 'Candolim Beach Resort',
              departureTime: '19:45',
              arrivalTime: '20:15',
              duration: 30,
              status: 'booked',
              cost: {
                currency: 'INR',
                amount: 500
              },
              bookingReference: 'GTS102',
              details: {
                platform: 'Cruise Terminal'
              }
            }
          ],
          activities: [
            {
              id: '13',
              type: 'entertainment',
              title: 'Baga Beach Water Sports',
              description: 'Family-friendly water sports - banana boat, jet ski (adults only)',
              location: 'Baga Beach',
              startTime: '09:00',
              endTime: '11:00',
              duration: 120,
              status: 'planned',
              priority: 'high',
              tags: ['watersports', 'beach', 'family', 'adventure'],
              cost: {
                currency: 'INR',
                amount: 2500
              }
            },
            {
              id: '14',
              type: 'food',
              title: 'Beachside Seafood Lunch',
              description: 'Fresh grilled fish, prawns, and local specialties by the beach',
              location: 'Baga Beach Restaurant',
              startTime: '12:00',
              endTime: '13:30',
              duration: 90,
              status: 'planned',
              priority: 'high',
              tags: ['lunch', 'seafood', 'beachside', 'grilled'],
              cost: {
                currency: 'INR',
                amount: 1500
              }
            },
            {
              id: '15',
              type: 'relaxation',
              title: 'Beach Relaxation',
              description: 'Sunbathing, beach games, baby sand play, romantic beach walk',
              location: 'Baga Beach',
              startTime: '14:00',
              endTime: '17:00',
              duration: 180,
              status: 'planned',
              priority: 'medium',
              tags: ['beach', 'relaxation', 'family', 'romantic'],
              cost: {
                currency: 'INR',
                amount: 300
              }
            },
            {
              id: '16',
              type: 'entertainment',
              title: 'Sunset Cruise',
              description: 'Romantic sunset cruise along the Goan coastline',
              location: 'Mandovi River',
              startTime: '17:30',
              endTime: '19:30',
              duration: 120,
              status: 'planned',
              priority: 'high',
              tags: ['cruise', 'sunset', 'romantic', 'river'],
              cost: {
                currency: 'INR',
                amount: 2000
              }
            }
          ]
        },
        {
          day: 5,
          date: new Date('2024-12-19'),
          title: 'Old Goa Churches & Panjim',
          location: 'Old Goa & Panjim, North Goa',
          weather: {
            condition: 'partly cloudy',
            temperature: 26,
            icon: '⛅'
          },
          transportation: [
            {
              id: '10',
              type: 'car',
              provider: 'Goa Taxi Services',
              from: 'Candolim Beach Resort',
              to: 'Basilica of Bom Jesus',
              departureTime: '08:30',
              arrivalTime: '09:00',
              duration: 30,
              status: 'booked',
              cost: {
                currency: 'INR',
                amount: 700
              },
              bookingReference: 'GTS201',
              details: {
                platform: 'Resort Lobby'
              }
            },
            {
              id: '11',
              type: 'car',
              provider: 'Goa Taxi Services',
              from: 'Se Cathedral',
              to: 'Panjim City',
              departureTime: '12:15',
              arrivalTime: '12:30',
              duration: 15,
              status: 'booked',
              cost: {
                currency: 'INR',
                amount: 300
              },
              bookingReference: 'GTS202',
              details: {
                platform: 'Cathedral Parking'
              }
            },
            {
              id: '12',
              type: 'car',
              provider: 'Goa Taxi Services',
              from: 'Panjim Market',
              to: 'Candolim Beach Resort',
              departureTime: '16:15',
              arrivalTime: '16:45',
              duration: 30,
              status: 'booked',
              cost: {
                currency: 'INR',
                amount: 700
              },
              bookingReference: 'GTS203',
              details: {
                platform: 'Market Parking'
              }
            }
          ],
          activities: [
            {
              id: '17',
              type: 'sightseeing',
              title: 'Basilica of Bom Jesus',
              description: 'UNESCO World Heritage site, historic church with beautiful architecture',
              location: 'Old Goa',
              startTime: '09:00',
              endTime: '10:30',
              duration: 90,
              status: 'planned',
              priority: 'high',
              tags: ['church', 'history', 'unesco', 'architecture'],
              cost: {
                currency: 'INR',
                amount: 100
              }
            },
            {
              id: '18',
              type: 'sightseeing',
              title: 'Se Cathedral Visit',
              description: 'Largest church in Asia, stunning Portuguese architecture',
              location: 'Old Goa',
              startTime: '11:00',
              endTime: '12:00',
              duration: 60,
              status: 'planned',
              priority: 'medium',
              tags: ['church', 'cathedral', 'architecture'],
              cost: {
                currency: 'INR',
                amount: 50
              }
            },
            {
              id: '19',
              type: 'food',
              title: 'Panjim Local Lunch',
              description: 'Traditional Goan lunch at popular local restaurant',
              location: 'Panjim City',
              startTime: '12:30',
              endTime: '14:00',
              duration: 90,
              status: 'planned',
              priority: 'high',
              tags: ['lunch', 'local', 'panjim', 'traditional'],
              cost: {
                currency: 'INR',
                amount: 800
              }
            },
            {
              id: '20',
              type: 'shopping',
              title: 'Panjim Market Shopping',
              description: 'Local spices, cashews, souvenirs, and traditional items',
              location: 'Panjim Market',
              startTime: '14:30',
              endTime: '16:00',
              duration: 90,
              status: 'planned',
              priority: 'medium',
              tags: ['shopping', 'market', 'spices', 'souvenirs'],
              cost: {
                currency: 'INR',
                amount: 1500
              }
            }
          ]
        },
        {
          day: 6,
          date: new Date('2024-12-20'),
          title: 'Departure Day',
          location: 'Candolim, North Goa',
          weather: {
            condition: 'sunny',
            temperature: 27,
            icon: '☀️'
          },
          transportation: [
            {
              id: '13',
              type: 'car',
              provider: 'Goa Taxi Services',
              from: 'Candolim Beach Resort',
              to: 'Goa International Airport',
              departureTime: '12:00',
              arrivalTime: '12:45',
              duration: 45,
              status: 'booked',
              cost: {
                currency: 'INR',
                amount: 800
              },
              bookingReference: 'GTS301',
              details: {
                platform: 'Resort Lobby'
              }
            },
            {
              id: '14',
              type: 'flight',
              provider: 'Air India',
              from: 'GOI',
              to: 'MUM',
              departureTime: '15:00',
              arrivalTime: '16:30',
              duration: 90,
              status: 'booked',
              cost: {
                currency: 'INR',
                amount: 12000
              },
              bookingReference: 'AI789012',
              details: {
                flightNumber: 'AI 456',
                terminal: 'T1',
                gate: 'C15',
                arrivalTerminal: 'T1',
                arrivalGate: 'A8'
              }
            }
          ],
          activities: [
            {
              id: '21',
              type: 'relaxation',
              title: 'Final Beach Morning',
              description: 'Last morning at the beach, family photos, breakfast by the sea',
              location: 'Candolim Beach',
              startTime: '07:00',
              endTime: '09:00',
              duration: 120,
              status: 'planned',
              priority: 'high',
              tags: ['beach', 'morning', 'family', 'photos'],
              cost: {
                currency: 'INR',
                amount: 500
              }
            },
            {
              id: '22',
              type: 'accommodation',
              title: 'Hotel Check-out',
              description: 'Check-out from Candolim Beach Resort',
              location: 'Candolim Beach Resort',
              startTime: '11:00',
              endTime: '11:30',
              duration: 30,
              status: 'planned',
              priority: 'high',
              tags: ['checkout', 'hotel'],
              cost: {
                currency: 'INR',
                amount: 0
              }
            }
          ]
        }
      ],
      travelers: [
        {
          id: '1',
          name: 'Husband',
          email: 'husband@example.com',
          preferences: {
            dietary: ['non-vegetarian'],
            interests: ['beach', 'romance', 'local cuisine', 'relaxation']
          }
        },
        {
          id: '2',
          name: 'Wife',
          email: 'wife@example.com',
          preferences: {
            dietary: ['non-vegetarian'],
            interests: ['romance', 'spa', 'shopping', 'family time']
          }
        },
        {
          id: '3',
          name: 'Baby (1.8 years)',
          email: '',
          preferences: {
            dietary: ['baby food', 'mild food'],
            interests: ['beach play', 'pool', 'family activities']
          }
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  onEditTrip(): void {
    console.log('Edit trip clicked');
    // TODO: Implement trip editing
  }

  onShareTrip(): void {
    console.log('Share trip clicked');
    // TODO: Implement trip sharing
  }

  onExportTrip(): void {
    console.log('Export trip clicked');
    // TODO: Implement trip export
  }

  onAddActivity(): void {
    console.log('Add activity clicked');
    // TODO: Implement activity addition
  }

  onEditActivity(activity: Activity): void {
    console.log('Edit activity clicked', activity);
    // TODO: Implement activity editing
  }

  onViewActivity(activity: Activity): void {
    console.log('View activity clicked', activity);
    // TODO: Implement activity viewing
  }

  onBookActivity(activity: Activity): void {
    console.log('Book activity clicked', activity);
    // TODO: Implement activity booking
  }

  onEditDay(day: ItineraryDay): void {
    console.log('Edit day clicked', day);
    // TODO: Implement day editing
  }

  onAddActivityToDay(day: ItineraryDay): void {
    console.log('Add activity to day clicked', day);
    // TODO: Implement adding activity to specific day
  }

  onExportItinerary(): void {
    console.log('Export itinerary clicked');
    // TODO: Implement itinerary export
  }



  getDayTransportationItems(day: ItineraryDay): any[] {
    if (!day.transportation?.length) return [];
    
    return day.transportation.map(transport => ({
      type: 'transportation',
      data: transport,
      trackId: `transport-${transport.id}`,
      time: transport.departureTime
    })).sort((a, b) => {
      const timeA = this.parseTime(a.time);
      const timeB = this.parseTime(b.time);
      return timeA - timeB;
    });
  }

  getDayAccommodationItems(day: ItineraryDay): any[] {
    if (!day.accommodation) return [];
    
    return [{
      type: 'accommodation',
      data: day.accommodation,
      trackId: `accommodation-${day.accommodation.id}`,
      time: day.accommodation.checkIn || '00:00'
    }];
  }

  getDayActivityItems(day: ItineraryDay): any[] {
    if (!day.activities?.length) return [];
    
    return day.activities.map(activity => ({
      type: 'activity',
      data: activity,
      trackId: `activity-${activity.id}`,
      time: activity.startTime
    })).sort((a, b) => {
      const timeA = this.parseTime(a.time);
      const timeB = this.parseTime(b.time);
      return timeA - timeB;
    });
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
