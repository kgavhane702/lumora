import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Accommodation } from '../../interfaces/trip.interface';

@Component({
  selector: 'app-accommodation-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './accommodation-card.html',
  styleUrls: ['./accommodation-card.scss']
})
export class AccommodationCard {
  @Input() accommodation!: Accommodation;
  @Output() editAccommodation = new EventEmitter<Accommodation>();

  onEdit(): void {
    this.editAccommodation.emit(this.accommodation);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }
}
