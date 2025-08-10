import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  isActive: boolean;
}

interface User {
  name: string;
  email: string;
  avatar?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent implements OnInit {
  @Input() isMobileOpen: boolean = false;
  @Input() user: User | null = null;
  @Input() chatSessions: ChatSession[] = [];
  
  @Output() newChat = new EventEmitter<void>();
  @Output() chatSelect = new EventEmitter<string>();
  @Output() mobileClose = new EventEmitter<void>();

  // Hover state for red sidebar
  isRedSidebarVisible = false;
  hoverTimeout: any;
  isMobile = false;

  onNewChat() {
    this.newChat.emit();
  }

  onChatSelect(chatId: string) {
    this.chatSelect.emit(chatId);
  }

  onMobileClose() {
    this.mobileClose.emit();
  }

  formatTimestamp(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  }

  trackByChat(index: number, chat: ChatSession): string {
    return chat.id;
  }

  // Check if device is mobile
  ngOnInit() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 1024;
  }

  // Hover methods for red sidebar
  onIconHover() {
    if (this.isMobile) return; // Only show on non-responsive mode
    
    clearTimeout(this.hoverTimeout);
    this.isRedSidebarVisible = true;
  }

  onIconLeave() {
    if (this.isMobile) return; // Only hide on non-responsive mode
    
    this.hoverTimeout = setTimeout(() => {
      this.isRedSidebarVisible = false;
    }, 300); // Small delay to prevent flickering
  }

  onRedSidebarHover() {
    if (this.isMobile) return;
    
    clearTimeout(this.hoverTimeout);
    this.isRedSidebarVisible = true;
  }

  onRedSidebarLeave() {
    if (this.isMobile) return;
    
    this.hoverTimeout = setTimeout(() => {
      this.isRedSidebarVisible = false;
    }, 300);
  }
}
