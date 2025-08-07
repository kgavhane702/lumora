import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SidebarComponent } from './components/layout/sidebar/sidebar';

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
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, MatButtonModule, SidebarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  title = 'lumora';
  isMobileMenuOpen = false;
  
  user: User = {
    name: 'John Doe',
    email: 'john@example.com'
  };
  
  chatSessions: ChatSession[] = [
    {
      id: '1',
      title: 'How to implement authentication...',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isActive: false
    },
    {
      id: '2',
      title: 'Best practices for Angular...',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isActive: false
    },
    {
      id: '3',
      title: 'Understanding TypeScript...',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isActive: false
    }
  ];

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  onNewChat() {
    console.log('New chat requested');
    // TODO: Implement new chat functionality
  }

  onChatSelect(chatId: string) {
    console.log('Chat selected:', chatId);
    // TODO: Implement chat selection functionality
  }
}
