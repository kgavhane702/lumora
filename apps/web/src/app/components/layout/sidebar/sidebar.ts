import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

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
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent {
  @Input() isMobileOpen: boolean = false;
  @Input() user: User = { name: 'John Doe', email: 'john@example.com' };
  @Input() chatSessions: ChatSession[] = [];
  
  @Output() newChat = new EventEmitter<void>();
  @Output() chatSelect = new EventEmitter<string>();
  @Output() mobileClose = new EventEmitter<void>();

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
}
