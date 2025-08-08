import { Component, ViewChild, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { SidebarComponent } from './components/layout/sidebar/sidebar';
import { Header } from './components/layout/header/header';
import { filter } from 'rxjs/operators';

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
  imports: [
    RouterOutlet, 
    DatePipe,
    CommonModule,
    MatIconModule, 
    MatButtonModule, 
    MatSidenavModule,
    SidebarComponent,
    Header
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  title = 'lumora';
  isMobileMenuOpen = false;
  isMobile = false;
  isSearchResultsPage = false;
  
  @ViewChild('drawer') drawer!: MatSidenav;
  
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

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkScreenSize();
    this.setupRouteDetection();
  }

  private setupRouteDetection() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Check if we're on a search results page (more specific)
      this.isSearchResultsPage = event.url.includes('/results') || 
                                 (event.url.includes('/search') && event.url !== '/search');
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 1024;
    if (this.drawer) {
      this.drawer.mode = this.isMobile ? 'over' : 'side';
      this.drawer.opened = !this.isMobile;
      
      // Ensure sidebar is closed on mobile by default
      if (this.isMobile && this.drawer.opened) {
        this.drawer.close();
      }
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.drawer) {
      if (this.isMobile) {
        this.drawer.toggle();
      }
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    if (this.drawer && this.isMobile) {
      this.drawer.close();
    }
  }

  onNewChat() {
    console.log('New chat requested');
    // TODO: Implement new chat functionality
  }

  onChatSelect(chatId: string) {
    console.log('Chat selected:', chatId);
    // TODO: Implement chat selection functionality
  }

  onShareResults() {
    console.log('Share results');
    // TODO: Implement share functionality
  }

  onBookmarkResults() {
    console.log('Bookmark results');
    // TODO: Implement bookmark functionality
  }

  // Handle mobile menu toggle from child components (like search)
  onChildMobileMenuToggle() {
    this.toggleMobileMenu();
  }

  // Update search results page detection
  updateSearchResultsPage(isSearchResults: boolean) {
    this.isSearchResultsPage = isSearchResults;
  }
}
