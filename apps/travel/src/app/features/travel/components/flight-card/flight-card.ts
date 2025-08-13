import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Transportation } from '../../interfaces/trip.interface';

@Component({
  selector: 'app-flight-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './flight-card.html',
  styleUrls: ['./flight-card.scss']
})
export class FlightCard {
  @Input() transport!: Transportation;
  @Input() date!: Date;
  @Output() editFlight = new EventEmitter<Transportation>();
  @Output() checkIn = new EventEmitter<Transportation>();

  onEdit(): void {
    this.editFlight.emit(this.transport);
  }

  onCheckIn(): void {
    this.checkIn.emit(this.transport);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }
}
