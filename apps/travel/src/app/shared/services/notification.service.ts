import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
  timestamp: Date;
  isDismissible?: boolean;
}

export interface AlertDialog {
  id: string;
  title: string;
  message: string;
  type: 'confirm' | 'alert' | 'prompt';
  confirmText?: string;
  cancelText?: string;
  placeholder?: string;
  defaultValue?: string;
}

export interface ProgressIndicator {
  id: string;
  title: string;
  progress: number; // 0-100
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new Subject<Notification>();
  private alerts = new Subject<AlertDialog>();
  private progressIndicators = new Subject<ProgressIndicator>();
  private dismissNotifications = new Subject<string>();

  // Notification streams
  getNotifications(): Observable<Notification> {
    return this.notifications.asObservable();
  }

  getAlerts(): Observable<AlertDialog> {
    return this.alerts.asObservable();
  }

  getProgressIndicators(): Observable<ProgressIndicator> {
    return this.progressIndicators.asObservable();
  }

  getDismissNotifications(): Observable<string> {
    return this.dismissNotifications.asObservable();
  }

  // Success notifications
  success(title: string, message: string, duration: number = 5000): string {
    const notification: Notification = {
      id: this.generateId(),
      type: 'success',
      title,
      message,
      duration,
      timestamp: new Date(),
      isDismissible: true
    };

    this.notifications.next(notification);
    return notification.id;
  }

  // Error notifications
  error(title: string, message: string, duration: number = 7000): string {
    const notification: Notification = {
      id: this.generateId(),
      type: 'error',
      title,
      message,
      duration,
      timestamp: new Date(),
      isDismissible: true
    };

    this.notifications.next(notification);
    return notification.id;
  }

  // Warning notifications
  warning(title: string, message: string, duration: number = 6000): string {
    const notification: Notification = {
      id: this.generateId(),
      type: 'warning',
      title,
      message,
      duration,
      timestamp: new Date(),
      isDismissible: true
    };

    this.notifications.next(notification);
    return notification.id;
  }

  // Info notifications
  info(title: string, message: string, duration: number = 4000): string {
    const notification: Notification = {
      id: this.generateId(),
      type: 'info',
      title,
      message,
      duration,
      timestamp: new Date(),
      isDismissible: true
    };

    this.notifications.next(notification);
    return notification.id;
  }

  // Loading notifications
  loading(title: string, message: string): string {
    const notification: Notification = {
      id: this.generateId(),
      type: 'loading',
      title,
      message,
      timestamp: new Date(),
      isDismissible: false
    };

    this.notifications.next(notification);
    return notification.id;
  }

  // Dismiss notification
  dismiss(notificationId: string): void {
    this.dismissNotifications.next(notificationId);
  }

  // Alert dialogs
  confirm(title: string, message: string, confirmText: string = 'Confirm', cancelText: string = 'Cancel'): Observable<boolean> {
    return new Observable(observer => {
      const alert: AlertDialog = {
        id: this.generateId(),
        title,
        message,
        type: 'confirm',
        confirmText,
        cancelText
      };

      this.alerts.next(alert);

      // Mock response (in real implementation, this would be handled by the alert component)
      setTimeout(() => {
        observer.next(true);
        observer.complete();
      }, 100);
    });
  }

  alert(title: string, message: string, confirmText: string = 'OK'): Observable<void> {
    return new Observable(observer => {
      const alert: AlertDialog = {
        id: this.generateId(),
        title,
        message,
        type: 'alert',
        confirmText
      };

      this.alerts.next(alert);

      // Mock response
      setTimeout(() => {
        observer.next();
        observer.complete();
      }, 100);
    });
  }

  prompt(title: string, message: string, placeholder: string = '', defaultValue: string = ''): Observable<string | null> {
    return new Observable(observer => {
      const alert: AlertDialog = {
        id: this.generateId(),
        title,
        message,
        type: 'prompt',
        confirmText: 'OK',
        cancelText: 'Cancel',
        placeholder,
        defaultValue
      };

      this.alerts.next(alert);

      // Mock response
      setTimeout(() => {
        observer.next(defaultValue);
        observer.complete();
      }, 100);
    });
  }

  // Progress indicators
  startProgress(title: string, message?: string): string {
    const progress: ProgressIndicator = {
      id: this.generateId(),
      title,
      message,
      progress: 0,
      status: 'pending'
    };

    this.progressIndicators.next(progress);
    return progress.id;
  }

  updateProgress(id: string, progress: number, message?: string): void {
    const progressIndicator: ProgressIndicator = {
      id,
      title: '', // Will be updated by component
      message,
      progress: Math.min(100, Math.max(0, progress)),
      status: 'running'
    };

    this.progressIndicators.next(progressIndicator);
  }

  completeProgress(id: string, message?: string): void {
    const progressIndicator: ProgressIndicator = {
      id,
      title: '', // Will be updated by component
      message,
      progress: 100,
      status: 'completed'
    };

    this.progressIndicators.next(progressIndicator);
  }

  errorProgress(id: string, message?: string): void {
    const progressIndicator: ProgressIndicator = {
      id,
      title: '', // Will be updated by component
      message,
      progress: 0,
      status: 'error'
    };

    this.progressIndicators.next(progressIndicator);
  }

  // Quick notification methods
  showSuccess(message: string): string {
    return this.success('Success', message);
  }

  showError(message: string): string {
    return this.error('Error', message);
  }

  showWarning(message: string): string {
    return this.warning('Warning', message);
  }

  showInfo(message: string): string {
    return this.info('Info', message);
  }

  // API response notifications
  showApiSuccess(response: any): string {
    const message = response.message || 'Operation completed successfully';
    return this.success('Success', message);
  }

  showApiError(error: any): string {
    const message = error.message || 'An error occurred';
    return this.error('Error', message);
  }

  // Search-specific notifications
  showSearchStarted(): string {
    return this.loading('Searching', 'Looking for answers...');
  }

  showSearchCompleted(): void {
    // Dismiss loading notification
    this.dismiss('search-loading');
    this.success('Search Complete', 'Found relevant results');
  }

  showSearchError(error: string): string {
    return this.error('Search Error', error);
  }

  // File upload notifications
  showFileUploadStarted(filename: string): string {
    return this.loading('Uploading', `Uploading ${filename}...`);
  }

  showFileUploadProgress(filename: string, progress: number): void {
    this.updateProgress('file-upload', progress, `Uploading ${filename}...`);
  }

  showFileUploadCompleted(filename: string): void {
    this.completeProgress('file-upload');
    this.success('Upload Complete', `${filename} uploaded successfully`);
  }

  showFileUploadError(filename: string, error: string): void {
    this.errorProgress('file-upload');
    this.error('Upload Failed', `Failed to upload ${filename}: ${error}`);
  }

  // Chat notifications
  showChatMessageSent(): string {
    return this.info('Message Sent', 'Your message has been sent');
  }

  showChatError(error: string): string {
    return this.error('Chat Error', error);
  }

  // Authentication notifications
  showLoginSuccess(): string {
    return this.success('Welcome Back', 'Successfully logged in');
  }

  showLoginError(error: string): string {
    return this.error('Login Failed', error);
  }

  showLogoutSuccess(): string {
    return this.info('Logged Out', 'You have been logged out successfully');
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Clear all notifications
  clearAll(): void {
    // This would be handled by the notification component
    // For now, we'll just log it
    console.log('Clear all notifications');
  }
}
