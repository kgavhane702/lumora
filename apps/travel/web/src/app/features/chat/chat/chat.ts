import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatService } from '../../../core/services/chat';
import { NotificationService } from '../../../shared/services/notification.service';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { ChatMessage, ChatSession } from '../../../shared/interfaces/chat-message';
import { catchError, finalize } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.scss'
})
export class Chat implements OnInit, OnDestroy {
  currentSession: ChatSession | null = null;
  sessions: ChatSession[] = [];
  messageInput: string = '';
  isTyping: boolean = false;
  isLoading: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private notificationService: NotificationService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    this.loadChatSessions();
    this.subscribeToTypingStatus();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadChatSessions() {
    this.chatService.getChatState().subscribe(state => {
      this.sessions = state.sessions;
      this.currentSession = state.currentSession;
    });
  }

  private subscribeToTypingStatus() {
    this.chatService.getTypingStatus().subscribe(isTyping => {
      this.isTyping = isTyping;
    });
  }

  onNewChat() {
    const session = this.chatService.createNewSession();
    this.currentSession = session;
    this.notificationService.showSuccess('New chat session created');
  }

  onSelectSession(sessionId: string) {
    this.chatService.selectSession(sessionId);
    // Get the updated state
    this.chatService.getCurrentSession().subscribe(session => {
      this.currentSession = session;
      this.notificationService.showInfo('Switched to chat session');
    });
  }

  onSendMessage() {
    if (!this.messageInput.trim() || !this.currentSession) return;

    this.isLoading = true;
    this.chatService.sendMessage(this.messageInput.trim(), this.currentSession.id).pipe(
      catchError(error => {
        this.errorHandler.handleChatError(error, {
          component: 'ChatComponent',
          action: 'onSendMessage',
          data: { message: this.messageInput.trim() }
        });
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(response => {
      if (response) {
        this.messageInput = '';
        this.notificationService.showSuccess('Message sent successfully');
      }
    });
  }

  onDeleteSession(sessionId: string) {
    this.chatService.deleteSession(sessionId);
    this.notificationService.showSuccess('Chat session deleted');
    if (this.currentSession?.id === sessionId) {
      this.currentSession = null;
    }
  }

  onExportChat(sessionId: string) {
    this.chatService.exportChat(sessionId).subscribe(data => {
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-export-${sessionId}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      this.notificationService.showSuccess('Chat exported successfully');
    });
  }

  onUpdateSessionTitle(sessionId: string, newTitle: string) {
    this.chatService.updateSessionTitle(sessionId, newTitle);
    this.notificationService.showSuccess('Chat title updated');
  }

  formatTimestamp(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  trackBySession(index: number, session: ChatSession): string {
    return session.id;
  }

  trackByMessage(index: number, message: ChatMessage): string {
    return message.id;
  }
}
