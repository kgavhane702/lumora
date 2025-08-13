import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, timeout, tap } from 'rxjs/operators';
import { APP_CONSTANTS } from '../../shared/constants/app-constants';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  timestamp: Date;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = APP_CONSTANTS.API.BASE_URL;
  private isOnline = new BehaviorSubject<boolean>(navigator.onLine);
  private requestCount = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {
    this.setupOnlineStatusListener();
  }

  // Generic GET request
  get<T>(endpoint: string, params?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, null, params);
  }

  // Generic POST request
  post<T>(endpoint: string, data: any, params?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, data, params);
  }

  // Generic PUT request
  put<T>(endpoint: string, data: any, params?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, data, params);
  }

  // Generic DELETE request
  delete<T>(endpoint: string, params?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, null, params);
  }

  // Generic PATCH request
  patch<T>(endpoint: string, data: any, params?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', endpoint, data, params);
  }

  // Search API
  search(query: any): Observable<ApiResponse<any>> {
    return this.post<any>(APP_CONSTANTS.API.SEARCH, query);
  }

  // Chat API
  chat(message: any): Observable<ApiResponse<any>> {
    return this.post<any>(APP_CONSTANTS.API.CHAT, message);
  }

  // Models API
  getModels(): Observable<ApiResponse<any>> {
    return this.get<any>(APP_CONSTANTS.API.MODELS);
  }

  // File upload
  uploadFile(endpoint: string, file: File, additionalData?: any): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<ApiResponse<any>>(`${this.baseUrl}${endpoint}`, formData).pipe(
      tap(() => this.decrementRequestCount()),
      catchError(this.handleError.bind(this))
    );
  }

  // Health check
  healthCheck(): Observable<ApiResponse<any>> {
    return this.get<any>('/health');
  }

  // Online status
  getOnlineStatus(): Observable<boolean> {
    return this.isOnline.asObservable();
  }

  // Request count for loading indicators
  getRequestCount(): Observable<number> {
    return this.requestCount.asObservable();
  }

  // Private methods
  private makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    params?: any
  ): Observable<ApiResponse<T>> {
    this.incrementRequestCount();

    const url = `${this.baseUrl}${endpoint}`;
    const options: any = {
      headers: this.getHeaders(),
      observe: 'response'
    };

    if (params) {
      options.params = this.buildParams(params);
    }

    let request: Observable<any>;

    switch (method) {
      case 'GET':
        request = this.http.get(url, options);
        break;
      case 'POST':
        request = this.http.post(url, data, options);
        break;
      case 'PUT':
        request = this.http.put(url, data, options);
        break;
      case 'DELETE':
        request = this.http.delete(url, options);
        break;
      case 'PATCH':
        request = this.http.patch(url, data, options);
        break;
      default:
        return throwError(() => new Error(`Unsupported HTTP method: ${method}`));
    }

    return request.pipe(
      timeout(30000), // 30 second timeout
      retry(1), // Retry once on failure
      tap(() => this.decrementRequestCount()),
      catchError(this.handleError.bind(this))
    );
  }

  private getHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private buildParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return httpParams;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    this.decrementRequestCount();

    let apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: error.status || 500
    };

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      apiError.message = error.error.message;
    } else {
      // Server-side error
      apiError.status = error.status;
      apiError.message = error.error?.message || error.message || 'Server error';
      apiError.code = error.error?.code;
      apiError.details = error.error?.details;
    }

    // Log error for debugging
    console.error('API Error:', apiError);

    return throwError(() => apiError);
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setupOnlineStatusListener(): void {
    window.addEventListener('online', () => this.isOnline.next(true));
    window.addEventListener('offline', () => this.isOnline.next(false));
  }

  private incrementRequestCount(): void {
    this.requestCount.next(this.requestCount.value + 1);
  }

  private decrementRequestCount(): void {
    const current = this.requestCount.value;
    if (current > 0) {
      this.requestCount.next(current - 1);
    }
  }
}
