import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  @Input() isSearchResultsPage = false;
  @Output() mobileMenuToggle = new EventEmitter<void>();
  @Output() shareResults = new EventEmitter<void>();
  @Output() bookmarkResults = new EventEmitter<void>();

  toggleMobileMenu() {
    this.mobileMenuToggle.emit();
  }

  onShare() {
    this.shareResults.emit();
  }

  onBookmark() {
    this.bookmarkResults.emit();
  }
}
