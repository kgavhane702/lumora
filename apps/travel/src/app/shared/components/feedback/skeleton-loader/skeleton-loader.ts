import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.html',
  styleUrl: './skeleton-loader.scss'
})
export class SkeletonLoader {
  @Input() type: 'search-result' | 'card' | 'list-item' | 'custom' = 'search-result';
  @Input() count: number = 3;
  @Input() showHeader: boolean = true;
  @Input() showActions: boolean = true;
  @Input() showReferences: boolean = true;
  @Input() lines: number = 3;
}
