import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap, delay } from 'rxjs/operators';
import { User } from '../../shared/interfaces/user';
import { APP_CONSTANTS } from '../../shared/constants/app-constants';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    token: null
  });

  constructor() {
    this.loadAuthState();
  }

  // Auth state management
  getAuthState(): Observable<AuthState> {
    return this.authState.asObservable();
  }

  getCurrentUser(): Observable<User | null> {
    return this.authState.pipe(map(state => state.user));
  }

  isAuthenticated(): Observable<boolean> {
    return this.authState.pipe(map(state => state.isAuthenticated));
  }

  getToken(): Observable<string | null> {
    return this.authState.pipe(map(state => state.token));
  }

  // Authentication methods
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.setLoading(true);

    // Mock login (replace with actual API call)
    return this.mockLoginAPI(credentials).pipe(
      tap(response => {
        this.setAuthState(response);
        this.setLoading(false);
      }),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterData): Observable<AuthResponse> {
    this.setLoading(true);

    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      this.setLoading(false);
      return throwError(() => new Error('Passwords do not match'));
    }

    // Mock registration (replace with actual API call)
    return this.mockRegisterAPI(data).pipe(
      tap(response => {
        this.setAuthState(response);
        this.setLoading(false);
      }),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.clearAuthState();
  }

  refreshToken(): Observable<AuthResponse> {
    const currentState = this.authState.value;
    
    if (!currentState.token) {
      return throwError(() => new Error('No token to refresh'));
    }

    // Mock token refresh (replace with actual API call)
    return this.mockRefreshTokenAPI(currentState.token).pipe(
      tap(response => {
        this.setAuthState(response);
      }),
      catchError(error => {
        this.clearAuthState();
        return throwError(() => error);
      })
    );
  }

  // Password reset
  forgotPassword(email: string): Observable<any> {
    this.setLoading(true);

    return this.mockForgotPasswordAPI(email).pipe(
      tap(() => this.setLoading(false)),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    this.setLoading(true);

    return this.mockResetPasswordAPI(token, newPassword).pipe(
      tap(() => this.setLoading(false)),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  // User profile management
  updateProfile(updates: Partial<User>): Observable<User> {
    const currentState = this.authState.value;
    
    if (!currentState.user) {
      return throwError(() => new Error('No authenticated user'));
    }

    this.setLoading(true);

    return this.mockUpdateProfileAPI(updates).pipe(
      tap(updatedUser => {
        this.authState.next({
          ...currentState,
          user: updatedUser
        });
        this.setLoading(false);
      }),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    this.setLoading(true);

    return this.mockChangePasswordAPI(currentPassword, newPassword).pipe(
      tap(() => this.setLoading(false)),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  // Permission checking
  hasPermission(permission: string): boolean {
    const currentState = this.authState.value;
    return currentState.isAuthenticated && currentState.user?.permissions?.includes(permission) || false;
  }

  hasRole(role: string): boolean {
    const currentState = this.authState.value;
    return currentState.isAuthenticated && currentState.user?.roles?.includes(role) || false;
  }

  // Token management
  isTokenExpired(): boolean {
    const currentState = this.authState.value;
    if (!currentState.token) return true;

    try {
      const tokenData = this.parseJwt(currentState.token);
      return tokenData.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  // Private methods
  private setAuthState(response: AuthResponse): void {
    this.authState.next({
      user: response.user,
      isAuthenticated: true,
      isLoading: false,
      token: response.token
    });

    this.saveAuthState();
  }

  private clearAuthState(): void {
    this.authState.next({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null
    });

    this.clearSavedAuthState();
  }

  private setLoading(loading: boolean): void {
    const currentState = this.authState.value;
    this.authState.next({
      ...currentState,
      isLoading: loading
    });
  }

  private loadAuthState(): void {
    try {
      const saved = localStorage.getItem('auth_state');
      if (saved) {
        const authState = JSON.parse(saved);
        
        // Check if token is still valid
        if (authState.token && !this.isTokenExpired()) {
          this.authState.next(authState);
        } else {
          this.clearAuthState();
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      this.clearAuthState();
    }
  }

  private saveAuthState(): void {
    try {
      const currentState = this.authState.value;
      localStorage.setItem('auth_state', JSON.stringify(currentState));
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  }

  private clearSavedAuthState(): void {
    localStorage.removeItem('auth_state');
  }

  private parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  // Mock API methods (replace with actual API calls)
  private mockLoginAPI(credentials: LoginCredentials): Observable<AuthResponse> {
    if (credentials.email === 'test@example.com' && credentials.password === 'password') {
      const response: AuthResponse = {
        user: {
          id: '1',
          name: 'John Doe',
          email: credentials.email,
          avatar: 'https://via.placeholder.com/150',
          preferences: {
            theme: 'light',
            language: 'en',
            notifications: true,
            emailNotifications: true,
            pushNotifications: false,
            autoSave: true,
            searchHistory: true,
            chatHistory: true
          },
          settings: {
            searchMode: 'both',
            defaultModel: 'gpt-4o',
            temperature: 0.7,
            maxTokens: 4000,
            includeReferences: true,
            focus: 'concise',
            language: 'en'
          },
          subscription: {
            plan: 'free',
            features: ['basic_search', 'chat'],
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            isActive: true,
            usage: {
              searches: 0,
              chats: 0,
              uploads: 0,
              exports: 0
            },
            limits: {
              searches: 100,
              chats: 50,
              uploads: 10,
              exports: 5,
              storage: 100 * 1024 * 1024 // 100MB
            }
          },
          roles: ['user'],
          permissions: ['search', 'chat', 'export'],
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          isVerified: true
        },
        token: 'mock-jwt-token-' + Date.now(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      return of(response).pipe(delay(1000));
    } else {
      return throwError(() => new Error('Invalid credentials'));
    }
  }

  private mockRegisterAPI(data: RegisterData): Observable<AuthResponse> {
    const response: AuthResponse = {
      user: {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        avatar: 'https://via.placeholder.com/150',
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: true,
          emailNotifications: true,
          pushNotifications: false,
          autoSave: true,
          searchHistory: true,
          chatHistory: true
        },
        settings: {
          searchMode: 'both',
          defaultModel: 'gpt-4o',
          temperature: 0.7,
          maxTokens: 4000,
          includeReferences: true,
          focus: 'concise',
          language: 'en'
        },
        subscription: {
          plan: 'free',
          features: ['basic_search', 'chat'],
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
          usage: {
            searches: 0,
            chats: 0,
            uploads: 0,
            exports: 0
          },
          limits: {
            searches: 100,
            chats: 50,
            uploads: 10,
            exports: 5,
            storage: 100 * 1024 * 1024 // 100MB
          }
        },
        roles: ['user'],
        permissions: ['search', 'chat', 'export'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        isVerified: false
      },
      token: 'mock-jwt-token-' + Date.now(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    return of(response).pipe(delay(1000));
  }

  private mockRefreshTokenAPI(token: string): Observable<AuthResponse> {
    const response: AuthResponse = {
      user: this.authState.value.user!,
      token: 'new-mock-jwt-token-' + Date.now(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    return of(response).pipe(delay(500));
  }

  private mockForgotPasswordAPI(email: string): Observable<any> {
    return of({ message: 'Password reset email sent' }).pipe(delay(1000));
  }

  private mockResetPasswordAPI(token: string, newPassword: string): Observable<any> {
    return of({ message: 'Password reset successfully' }).pipe(delay(1000));
  }

  private mockUpdateProfileAPI(updates: Partial<User>): Observable<User> {
    const currentUser = this.authState.value.user!;
    const updatedUser = { ...currentUser, ...updates };
    
    return of(updatedUser).pipe(delay(500));
  }

  private mockChangePasswordAPI(currentPassword: string, newPassword: string): Observable<any> {
    return of({ message: 'Password changed successfully' }).pipe(delay(1000));
  }
}
