import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-feature-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './feature-card.html',
  styleUrls: ['./feature-card.scss']
})
export class FeatureCardComponent {
  @Input() feature!: Feature;
}