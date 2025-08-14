export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  coverImage?: string;
  budget?: {
    currency: string;
    amount: number;
  };
  status: 'planning' | 'booked' | 'ongoing' | 'completed';
  itinerary: ItineraryDay[];
  travelers: Traveler[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ItineraryDay {
  day: number;
  date: Date;
  title: string;
  description?: string;
  location: string;
  weather?: {
    condition: string;
    temperature: number;
    icon: string;
  };
  activities: Activity[];
  accommodation?: Accommodation | null; // null when no accommodation events (middle days)
  transportation?: Transportation[];
}

export interface Activity {
  id: string;
  type: 'sightseeing' | 'food' | 'shopping' | 'entertainment' | 'relaxation' | 'transport' | 'accommodation';
  title: string;
  description?: string;
  location: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  cost?: {
    currency: string;
    amount: number;
  };
  bookingReference?: string;
  status: 'planned' | 'booked' | 'confirmed' | 'completed';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  images?: string[];
  notes?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Accommodation {
  id: string;
  name: string;
  type: 'hotel' | 'hostel' | 'apartment' | 'resort' | 'bnb';
  address: string;
  checkIn: string | null; // null when already checked in from previous day
  checkOut: string | null; // null when no checkout (e.g., first day or ongoing stay)
  roomType?: string;
  confirmationNumber?: string;
  cost?: {
    currency: string;
    amount: number;
  };
  amenities?: string[];
  images?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Transportation {
  id: string;
  type: 'flight' | 'train' | 'bus' | 'car' | 'boat' | 'walking' | 'bike';
  provider: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: number; // in minutes
  confirmationNumber?: string;
  cost?: {
    currency: string;
    amount: number;
  };
  status: 'booked' | 'confirmed' | 'completed';
  details?: {
    flightNumber?: string;
    trainNumber?: string;
    platform?: string;
    gate?: string;
    seat?: string;
    terminal?: string;
    arrivalTerminal?: string;
    arrivalGate?: string;
  };
  bookingReference?: string;
}

export interface Traveler {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passportNumber?: string;
  preferences?: {
    dietary?: string[];
    accessibility?: string[];
    interests?: string[];
  };
}

export interface TripStats {
  totalDays: number;
  totalActivities: number;
  totalCost: number;
  bookedActivities: number;
  pendingActivities: number;
  completedActivities: number;
}
