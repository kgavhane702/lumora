import { Component, ViewChild, OnInit, HostListener, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { SidebarComponent } from './components/layout/sidebar/sidebar';
import { Header } from './components/layout/header/header';
import { AuthService } from './core/services/auth';
import { NotificationService } from './shared/services/notification.service';
import { ErrorHandlerService } from './shared/services/error-handler.service';
import { User } from './shared/interfaces/user';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  isActive: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
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
export class AppComponent implements OnInit, OnDestroy {
  title = 'lumora';
  isMobileMenuOpen = false;
  isMobile = false;
  isSearchResultsPage = false;
  isAuthenticated = false;
  user: User | null = null;
  
  @ViewChild('drawer') drawer!: MatSidenav;
  
  chatSessions: ChatSession[] = [
    {
      id: '1',
      title: 'How to implement authentication...',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isActive: false
    },
    {
      id: '2',
      title: 'Best practices for Angular...',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isActive: false
    },
    {
      id: '3',
      title: 'Understanding TypeScript...',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isActive: false
    }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    this.checkScreenSize();
    this.setupRouteDetection();
    this.loadUserData();
    
    // Ensure proper initial state
    if (!this.isMobile) {
      this.isMobileMenuOpen = true;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadUserData() {
    // Subscribe to auth state changes
    this.subscriptions.push(
      this.authService.getAuthState().subscribe(state => {
        this.isAuthenticated = state.isAuthenticated;
        this.user = state.user;
        
        if (this.isAuthenticated && this.user) {
          this.notificationService.showSuccess(`Welcome back, ${this.user.name}!`);
        }
      })
    );
  }

  private setupRouteDetection() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isSearchResultsPage = event.url.includes('/results') || 
                                 (event.url.includes('/search') && event.url !== '/search');
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 1024;
    
    if (this.drawer) {
      this.drawer.mode = this.isMobile ? 'over' : 'side';
      
      if (this.isMobile) {
        // On mobile, ensure sidebar is closed initially
        this.drawer.close();
        this.isMobileMenuOpen = false;
      } else {
        // On desktop, ensure sidebar is always open and visible
        this.drawer.open();
        this.isMobileMenuOpen = true;
        // Force the drawer to stay open on desktop
        setTimeout(() => {
          if (this.drawer && !this.isMobile) {
            this.drawer.open();
          }
        }, 100);
      }
    }
  }

  onSidenavOpenedChange(opened: boolean) {
    // Only sync state on mobile devices
    if (this.isMobile) {
      this.isMobileMenuOpen = opened;
    }
    // On desktop, always keep sidebar open
    else {
      this.isMobileMenuOpen = true;
    }
  }

  toggleMobileMenu() {
    if (this.isMobile) {
      // Toggle the state first
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      
      // Then tell the sidenav to open/close based on our state
      if (this.drawer) {
        if (this.isMobileMenuOpen) {
          this.drawer.open();
        } else {
          this.drawer.close();
        }
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
    this.notificationService.showInfo('Creating new chat session...');
  }

  onChatSelect(chatId: string) {
    console.log('Chat selected:', chatId);
    this.notificationService.showInfo('Switching to chat session');
  }

  onShareResults() {
    console.log('Share results');
    this.notificationService.showInfo('Sharing results...');
  }

  onBookmarkResults() {
    console.log('Bookmark results');
    this.notificationService.showSuccess('Results bookmarked');
  }

  onChildMobileMenuToggle() {
    this.toggleMobileMenu();
  }

  updateSearchResultsPage(isSearchResults: boolean) {
    this.isSearchResultsPage = isSearchResults;
  }

  onLogout() {
    this.authService.logout();
    this.notificationService.showSuccess('Logged out successfully');
    this.router.navigate(['/login']);
  }

  onProfileUpdate() {
    if (this.user) {
      this.notificationService.showInfo('Opening profile settings...');
    }
  }
}
