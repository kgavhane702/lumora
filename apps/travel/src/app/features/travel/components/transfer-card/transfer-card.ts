import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Transportation } from '../../interfaces/trip.interface';

@Component({
  selector: 'app-transfer-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './transfer-card.html',
  styleUrls: ['./transfer-card.scss']
})
export class TransferCard {
  @Input() transport!: Transportation;
  @Output() editTransfer = new EventEmitter<Transportation>();

  getTransportIcon(): string {
    switch (this.transport.type) {
      case 'car':
        return 'directions_car';
      case 'bus':
        return 'directions_bus';
      case 'train':
        return 'train';
      case 'boat':
        return 'directions_boat';
      case 'bike':
        return 'pedal_bike';
      case 'walking':
        return 'directions_walk';
      default:
        return 'directions_car';
    }
  }

  onEdit(): void {
    this.editTransfer.emit(this.transport);
  }

  copyToClipboard(): void {
    if (this.transport.bookingReference) {
      navigator.clipboard.writeText(this.transport.bookingReference);
    }
  }
}
