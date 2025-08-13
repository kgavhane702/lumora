import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap, delay } from 'rxjs/operators';
import { ChatMessage, ChatSession } from '../../shared/interfaces/chat-message';
import { SearchResult } from '../../shared/interfaces/search-result';
import { APP_CONSTANTS } from '../../shared/constants/app-constants';

export interface ChatState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isLoading: boolean;
  isTyping: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chatState = new BehaviorSubject<ChatState>({
    currentSession: null,
    sessions: [],
    isLoading: false,
    isTyping: false
  });

  constructor() {
    this.loadChatSessions();
  }

  // Chat session management
  getChatState(): Observable<ChatState> {
    return this.chatState.asObservable();
  }

  getCurrentSession(): Observable<ChatSession | null> {
    return this.chatState.pipe(map(state => state.currentSession));
  }

  getSessions(): Observable<ChatSession[]> {
    return this.chatState.pipe(map(state => state.sessions));
  }

  createNewSession(title?: string): ChatSession {
    const session: ChatSession = {
      id: Date.now().toString(),
      title: title || 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    const currentState = this.chatState.value;
    const updatedSessions = [session, ...currentState.sessions];
    
    this.chatState.next({
      ...currentState,
      currentSession: session,
      sessions: updatedSessions
    });

    this.saveChatSessions();
    return session;
  }

  selectSession(sessionId: string): void {
    const currentState = this.chatState.value;
    const session = currentState.sessions.find(s => s.id === sessionId);
    
    if (session) {
      // Deactivate all sessions
      const updatedSessions = currentState.sessions.map(s => ({
        ...s,
        isActive: s.id === sessionId
      }));

      this.chatState.next({
        ...currentState,
        currentSession: session,
        sessions: updatedSessions
      });
    }
  }

  updateSessionTitle(sessionId: string, title: string): void {
    const currentState = this.chatState.value;
    const updatedSessions = currentState.sessions.map(session => 
      session.id === sessionId 
        ? { ...session, title, updatedAt: new Date() }
        : session
    );

    this.chatState.next({
      ...currentState,
      sessions: updatedSessions,
      currentSession: currentState.currentSession?.id === sessionId 
        ? { ...currentState.currentSession, title, updatedAt: new Date() }
        : currentState.currentSession
    });

    this.saveChatSessions();
  }

  deleteSession(sessionId: string): void {
    const currentState = this.chatState.value;
    const updatedSessions = currentState.sessions.filter(s => s.id !== sessionId);
    
    this.chatState.next({
      ...currentState,
      sessions: updatedSessions,
      currentSession: currentState.currentSession?.id === sessionId 
        ? (updatedSessions[0] || null)
        : currentState.currentSession
    });

    this.saveChatSessions();
  }

  // Message handling
  sendMessage(content: string, sessionId?: string): Observable<ChatMessage> {
    const currentState = this.chatState.value;
    const targetSessionId = sessionId || currentState.currentSession?.id;
    
    if (!targetSessionId) {
      return throwError(() => new Error('No active session'));
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    this.addMessageToSession(targetSessionId, userMessage);
    this.setTyping(true);

    // Simulate AI response
    return this.generateAIResponse(content).pipe(
      tap(aiMessage => {
        this.addMessageToSession(targetSessionId, aiMessage);
        this.setTyping(false);
      }),
      catchError(error => {
        this.setTyping(false);
        return throwError(() => error);
      })
    );
  }

  addMessageToSession(sessionId: string, message: ChatMessage): void {
    const currentState = this.chatState.value;
    const updatedSessions = currentState.sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          messages: [...session.messages, message],
          updatedAt: new Date()
        };
      }
      return session;
    });

    this.chatState.next({
      ...currentState,
      sessions: updatedSessions,
      currentSession: currentState.currentSession?.id === sessionId 
        ? { ...currentState.currentSession, messages: [...currentState.currentSession.messages, message], updatedAt: new Date() }
        : currentState.currentSession
    });

    this.saveChatSessions();
  }

  // Search integration
  addSearchResult(sessionId: string, searchResult: SearchResult): void {
    const message: ChatMessage = {
      id: Date.now().toString(),
      content: searchResult.answer,
      role: 'assistant',
      timestamp: new Date(),
      searchResult,
      references: searchResult.references,
      modelUsed: searchResult.modelUsed,
      confidence: searchResult.confidence,
      metadata: {
        searchTime: searchResult.searchTime,
        tokenUsage: searchResult.tokenUsage,
        followUpQuestions: searchResult.followUpQuestions
      }
    };

    this.addMessageToSession(sessionId, message);
  }

  // Typing indicators
  getTypingStatus(): Observable<boolean> {
    return this.chatState.pipe(map(state => state.isTyping));
  }

  private setTyping(isTyping: boolean): void {
    const currentState = this.chatState.value;
    this.chatState.next({
      ...currentState,
      isTyping
    });
  }

  // Chat analytics
  getChatAnalytics(): Observable<any> {
    const currentState = this.chatState.value;
    const sessions = currentState.sessions;
    
    const totalSessions = sessions.length;
    const totalMessages = sessions.reduce((sum, session) => sum + session.messages.length, 0);
    const averageMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;
    const activeSession = sessions.find(s => s.isActive);

    return of({
      totalSessions,
      totalMessages,
      averageMessagesPerSession,
      activeSession,
      recentSessions: sessions.slice(0, 5)
    });
  }

  // Export chat
  exportChat(sessionId: string, format: 'json' | 'txt' | 'md' = 'json'): Observable<string> {
    const currentState = this.chatState.value;
    const session = currentState.sessions.find(s => s.id === sessionId);
    
    if (!session) {
      return throwError(() => new Error('Session not found'));
    }

    let exportData: string;

    switch (format) {
      case 'json':
        exportData = JSON.stringify(session, null, 2);
        break;
      case 'txt':
        exportData = this.formatChatAsText(session);
        break;
      case 'md':
        exportData = this.formatChatAsMarkdown(session);
        break;
      default:
        return throwError(() => new Error('Unsupported format'));
    }

    return of(exportData);
  }

  // Private methods
  private loadChatSessions(): void {
    try {
      const saved = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.CHAT_SESSIONS);
      if (saved) {
        const sessions = JSON.parse(saved);
        const currentState = this.chatState.value;
        this.chatState.next({
          ...currentState,
          sessions,
          currentSession: sessions.find((s: ChatSession) => s.isActive) || null
        });
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  }

  private saveChatSessions(): void {
    try {
      const currentState = this.chatState.value;
      localStorage.setItem(
        APP_CONSTANTS.STORAGE_KEYS.CHAT_SESSIONS,
        JSON.stringify(currentState.sessions)
      );
    } catch (error) {
      console.error('Error saving chat sessions:', error);
    }
  }

  private generateAIResponse(userMessage: string): Observable<ChatMessage> {
    // Mock AI response (replace with actual API call)
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: `This is a mock AI response to: "${userMessage}". In a real implementation, this would be generated by the AI model based on the conversation context and search results.`,
      role: 'assistant',
      timestamp: new Date(),
      modelUsed: 'gpt-4o',
      confidence: 0.85
    };

    return of(aiMessage).pipe(delay(1500)); // Simulate processing time
  }

  private formatChatAsText(session: ChatSession): string {
    let text = `Chat: ${session.title}\n`;
    text += `Created: ${session.createdAt.toLocaleString()}\n`;
    text += `Updated: ${session.updatedAt.toLocaleString()}\n\n`;
    
    session.messages.forEach(message => {
      text += `${message.role.toUpperCase()}: ${message.content}\n\n`;
    });
    
    return text;
  }

  private formatChatAsMarkdown(session: ChatSession): string {
    let md = `# ${session.title}\n\n`;
    md += `**Created:** ${session.createdAt.toLocaleString()}\n`;
    md += `**Updated:** ${session.updatedAt.toLocaleString()}\n\n`;
    
    session.messages.forEach(message => {
      md += `## ${message.role === 'user' ? '👤 User' : '🤖 Assistant'}\n\n`;
      md += `${message.content}\n\n`;
      
      if (message.searchResult) {
        md += `### Sources\n\n`;
        message.searchResult.references.forEach(ref => {
          md += `- [${ref.title}](${ref.url})\n`;
        });
        md += `\n`;
      }
    });
    
    return md;
  }
}
