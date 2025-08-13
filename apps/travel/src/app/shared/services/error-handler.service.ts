import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { NotificationService } from './notification.service';

export interface AppError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  category: 'api' | 'validation' | 'network' | 'auth' | 'file' | 'search' | 'chat' | 'general';
  code?: string;
  details?: any;
  timestamp: Date;
  userFriendlyMessage: string;
  shouldLog: boolean;
  shouldNotify: boolean;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  data?: any;
  userId?: string;
  sessionId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private errors: AppError[] = [];
  private readonly MAX_ERRORS = 100;

  constructor(private notificationService: NotificationService) {}

  // Handle different types of errors
  handleError(error: any, context?: ErrorContext): Observable<never> {
    const appError = this.createAppError(error, context);
    
    this.logError(appError);
    this.addError(appError);
    
    if (appError.shouldNotify) {
      this.notificationService.error('Error', appError.userFriendlyMessage);
    }

    return throwError(() => appError);
  }

  // API Errors
  handleApiError(error: any, context?: ErrorContext): Observable<never> {
    const appError = this.createApiError(error, context);
    return this.handleError(appError, context);
  }

  // Validation Errors
  handleValidationError(errors: any, context?: ErrorContext): Observable<never> {
    const appError = this.createValidationError(errors, context);
    return this.handleError(appError, context);
  }

  // Network Errors
  handleNetworkError(error: any, context?: ErrorContext): Observable<never> {
    const appError = this.createNetworkError(error, context);
    return this.handleError(appError, context);
  }

  // Authentication Errors
  handleAuthError(error: any, context?: ErrorContext): Observable<never> {
    const appError = this.createAuthError(error, context);
    return this.handleError(appError, context);
  }

  // File Upload Errors
  handleFileError(error: any, context?: ErrorContext): Observable<never> {
    const appError = this.createFileError(error, context);
    return this.handleError(appError, context);
  }

  // Search Errors
  handleSearchError(error: any, context?: ErrorContext): Observable<never> {
    const appError = this.createSearchError(error, context);
    return this.handleError(appError, context);
  }

  // Chat Errors
  handleChatError(error: any, context?: ErrorContext): Observable<never> {
    const appError = this.createChatError(error, context);
    return this.handleError(appError, context);
  }

  // Get all errors
  getErrors(): AppError[] {
    return [...this.errors];
  }

  // Get errors by category
  getErrorsByCategory(category: AppError['category']): AppError[] {
    return this.errors.filter(error => error.category === category);
  }

  // Get recent errors
  getRecentErrors(count: number = 10): AppError[] {
    return this.errors
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, count);
  }

  // Clear errors
  clearErrors(): void {
    this.errors = [];
  }

  // Clear errors by category
  clearErrorsByCategory(category: AppError['category']): void {
    this.errors = this.errors.filter(error => error.category !== category);
  }

  // Private methods
  private createAppError(error: any, context?: ErrorContext): AppError {
    const id = this.generateId();
    const timestamp = new Date();

    let message = 'An unexpected error occurred';
    let userFriendlyMessage = 'Something went wrong. Please try again.';
    let category: AppError['category'] = 'general';
    let shouldNotify = true;
    let shouldLog = true;

    if (typeof error === 'string') {
      message = error;
      userFriendlyMessage = error;
    } else if (error instanceof Error) {
      message = error.message;
      userFriendlyMessage = this.getUserFriendlyMessage(error.message);
    } else if (error && typeof error === 'object') {
      message = error.message || error.error || 'Unknown error';
      userFriendlyMessage = error.userFriendlyMessage || this.getUserFriendlyMessage(message);
      category = error.category || 'general';
      shouldNotify = error.shouldNotify !== false;
      shouldLog = error.shouldLog !== false;
    }

    return {
      id,
      message,
      type: 'error',
      category,
      code: error?.code,
      details: {
        originalError: error,
        context,
        stack: error?.stack
      },
      timestamp,
      userFriendlyMessage,
      shouldLog,
      shouldNotify
    };
  }

  private createApiError(error: any, context?: ErrorContext): AppError {
    const appError = this.createAppError(error, context);
    appError.category = 'api';
    
    // Handle specific HTTP status codes
    if (error?.status) {
      switch (error.status) {
        case 400:
          appError.userFriendlyMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          appError.userFriendlyMessage = 'Authentication required. Please log in again.';
          break;
        case 403:
          appError.userFriendlyMessage = 'Access denied. You don\'t have permission for this action.';
          break;
        case 404:
          appError.userFriendlyMessage = 'Resource not found. Please check the URL or try again.';
          break;
        case 429:
          appError.userFriendlyMessage = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          appError.userFriendlyMessage = 'Server error. Please try again later.';
          break;
        case 502:
        case 503:
        case 504:
          appError.userFriendlyMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          appError.userFriendlyMessage = 'An error occurred while processing your request.';
      }
    }

    return appError;
  }

  private createValidationError(errors: any, context?: ErrorContext): AppError {
    const appError = this.createAppError(errors, context);
    appError.category = 'validation';
    appError.userFriendlyMessage = 'Please check your input and try again.';
    appError.type = 'warning';
    return appError;
  }

  private createNetworkError(error: any, context?: ErrorContext): AppError {
    const appError = this.createAppError(error, context);
    appError.category = 'network';
    appError.userFriendlyMessage = 'Network connection error. Please check your internet connection.';
    return appError;
  }

  private createAuthError(error: any, context?: ErrorContext): AppError {
    const appError = this.createAppError(error, context);
    appError.category = 'auth';
    appError.userFriendlyMessage = 'Authentication error. Please log in again.';
    return appError;
  }

  private createFileError(error: any, context?: ErrorContext): AppError {
    const appError = this.createAppError(error, context);
    appError.category = 'file';
    appError.userFriendlyMessage = 'File processing error. Please check your file and try again.';
    return appError;
  }

  private createSearchError(error: any, context?: ErrorContext): AppError {
    const appError = this.createAppError(error, context);
    appError.category = 'search';
    appError.userFriendlyMessage = 'Search error. Please try a different query.';
    return appError;
  }

  private createChatError(error: any, context?: ErrorContext): AppError {
    const appError = this.createAppError(error, context);
    appError.category = 'chat';
    appError.userFriendlyMessage = 'Chat error. Please try sending your message again.';
    return appError;
  }

  private getUserFriendlyMessage(message: string): string {
    const messageMap: { [key: string]: string } = {
      'Network Error': 'Please check your internet connection and try again.',
      'Timeout': 'Request timed out. Please try again.',
      'Unauthorized': 'Please log in to continue.',
      'Forbidden': 'You don\'t have permission to perform this action.',
      'Not Found': 'The requested resource was not found.',
      'Internal Server Error': 'Server error. Please try again later.',
      'Bad Request': 'Invalid request. Please check your input.',
      'Too Many Requests': 'Too many requests. Please wait a moment and try again.',
      'Service Unavailable': 'Service temporarily unavailable. Please try again later.'
    };

    return messageMap[message] || 'Something went wrong. Please try again.';
  }

  private addError(error: AppError): void {
    this.errors.unshift(error);
    
    // Keep only the last MAX_ERRORS
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors = this.errors.slice(0, this.MAX_ERRORS);
    }
  }

  private logError(error: AppError): void {
    if (!error.shouldLog) return;

    const logData = {
      id: error.id,
      message: error.message,
      category: error.category,
      code: error.code,
      timestamp: error.timestamp.toISOString(),
      context: error.details?.context,
      stack: error.details?.stack
    };

    console.error('Application Error:', logData);

    // In a real application, you might want to send this to a logging service
    // this.loggingService.log('error', logData);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Utility methods for common error scenarios
  showNetworkError(): void {
    this.notificationService.error('Connection Error', 'Please check your internet connection and try again.');
  }

  showAuthError(): void {
    this.notificationService.error('Authentication Error', 'Please log in again to continue.');
  }

  showValidationError(field?: string): void {
    const message = field ? `Please check the ${field} field.` : 'Please check your input.';
    this.notificationService.warning('Validation Error', message);
  }

  showFileError(filename?: string): void {
    const message = filename ? `Error processing ${filename}. Please try again.` : 'File processing error. Please try again.';
    this.notificationService.error('File Error', message);
  }

  showSearchError(query?: string): void {
    const message = query ? `Error searching for "${query}". Please try a different query.` : 'Search error. Please try again.';
    this.notificationService.error('Search Error', message);
  }

  showChatError(): void {
    this.notificationService.error('Chat Error', 'Error sending message. Please try again.');
  }
}
