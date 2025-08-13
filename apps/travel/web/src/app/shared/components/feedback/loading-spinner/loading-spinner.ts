import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.scss'
})
export class LoadingSpinner {
  @Input() message: string = 'Loading...';
  @Input() subMessage?: string;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() variant: 'dots' | 'circle' | 'bars' = 'dots';
  @Input() centered: boolean = true;
}
