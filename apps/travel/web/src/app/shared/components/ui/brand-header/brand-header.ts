import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-brand-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brand-header.html',
  styleUrls: ['./brand-header.scss']
})
export class BrandHeaderComponent {
  @Input() title: string = 'Lumora';
  @Input() subtitle: string = 'AI-powered search and reasoning engine';
  @Input() centered: boolean = true;
}