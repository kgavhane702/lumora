import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap, delay } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { ErrorHandlerService } from './error-handler.service';

export interface FileInfo {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  extension: string;
  lastModified: Date;
  preview?: string;
}

export interface UploadProgress {
  fileId: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'error';
  uploadedBytes: number;
  totalBytes: number;
  speed?: number; // bytes per second
  estimatedTime?: number; // seconds
  error?: string;
}

export interface UploadResult {
  fileId: string;
  success: boolean;
  url?: string;
  uploadedFileId?: string;
  error?: string;
  metadata?: any;
}

export interface FileValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private uploadProgress = new BehaviorSubject<UploadProgress[]>([]);
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_TYPES = [
    'text/plain',
    'text/csv',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  private readonly ALLOWED_EXTENSIONS = [
    '.txt', '.csv', '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    '.jpg', '.jpeg', '.png', '.gif', '.webp'
  ];

  constructor(
    private notificationService: NotificationService,
    private errorHandler: ErrorHandlerService
  ) {}

  // File validation
  validateFile(file: File): FileValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(this.MAX_FILE_SIZE)})`);
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      errors.push(`File type "${file.type}" is not supported`);
    }

    // Check file extension
    const extension = this.getFileExtension(file.name);
    if (!this.ALLOWED_EXTENSIONS.includes(extension.toLowerCase())) {
      errors.push(`File extension "${extension}" is not supported`);
    }

    // Check if file is empty
    if (file.size === 0) {
      errors.push('File is empty');
    }

    // Warnings
    if (file.size > 5 * 1024 * 1024) { // 5MB
      warnings.push('Large file detected. Upload may take longer.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Validate multiple files
  validateFiles(files: File[]): { valid: File[], invalid: { file: File, errors: string[] }[] } {
    const valid: File[] = [];
    const invalid: { file: File, errors: string[] }[] = [];

    files.forEach(file => {
      const validation = this.validateFile(file);
      if (validation.isValid) {
        valid.push(file);
      } else {
        invalid.push({ file, errors: validation.errors });
      }
    });

    return { valid, invalid };
  }

  // Upload single file
  uploadFile(file: File, endpoint: string = '/api/upload'): Observable<UploadResult> {
    const fileInfo = this.createFileInfo(file);
    const validation = this.validateFile(file);

    if (!validation.isValid) {
      return throwError(() => new Error(validation.errors.join(', ')));
    }

    // Initialize progress
    this.initializeProgress(fileInfo.id, file.size);

    // Mock upload (replace with actual upload logic)
    return this.mockUpload(fileInfo, endpoint).pipe(
      tap(result => {
        if (result.success) {
          this.completeProgress(fileInfo.id);
          this.notificationService.showFileUploadCompleted(file.name);
        } else {
          this.errorProgress(fileInfo.id, result.error || 'Upload failed');
          this.errorHandler.showFileError(file.name);
        }
      }),
      catchError(error => {
        this.errorProgress(fileInfo.id, error.message);
        this.errorHandler.handleFileError(error);
        return throwError(() => error);
      })
    );
  }

  // Upload multiple files
  uploadFiles(files: File[], endpoint: string = '/api/upload'): Observable<UploadResult[]> {
    const { valid, invalid } = this.validateFiles(files);

    if (invalid.length > 0) {
      const errorMessage = `Invalid files: ${invalid.map(item => item.file.name).join(', ')}`;
      this.notificationService.error('Upload Error', errorMessage);
    }

    if (valid.length === 0) {
      return of([]);
    }

    const uploads = valid.map(file => this.uploadFile(file, endpoint));
    
    // In a real implementation, you might want to limit concurrent uploads
    return of(uploads).pipe(
      map(() => valid.map(file => ({
        fileId: this.createFileInfo(file).id,
        success: true,
        url: `https://example.com/uploads/${file.name}`,
        uploadedFileId: Date.now().toString()
      })))
    );
  }

  // Drag and drop handling
  handleDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'copy';
  }

  handleDrop(event: DragEvent): File[] {
    event.preventDefault();
    event.stopPropagation();

    const files: File[] = [];
    if (event.dataTransfer?.files) {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        files.push(event.dataTransfer.files[i]);
      }
    }

    return files;
  }

  // Get upload progress
  getUploadProgress(): Observable<UploadProgress[]> {
    return this.uploadProgress.asObservable();
  }

  // Get progress for specific file
  getFileProgress(fileId: string): Observable<UploadProgress | null> {
    return this.uploadProgress.pipe(
      map(progresses => progresses.find(p => p.fileId === fileId) || null)
    );
  }

  // Cancel upload
  cancelUpload(fileId: string): void {
    const currentProgress = this.uploadProgress.value;
    const updatedProgress = currentProgress.filter(p => p.fileId !== fileId);
    this.uploadProgress.next(updatedProgress);
    
    this.notificationService.info('Upload Cancelled', 'File upload has been cancelled');
  }

  // File processing utilities
  createFilePreview(file: File): Observable<string> {
    return new Observable(observer => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          observer.next(e.target?.result as string);
          observer.complete();
        };
        reader.onerror = () => observer.error(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      } else {
        observer.next('');
        observer.complete();
      }
    });
  }

  getFileIcon(fileType: string): string {
    const iconMap: { [key: string]: string } = {
      'text/plain': 'description',
      'text/csv': 'table_chart',
      'application/pdf': 'picture_as_pdf',
      'application/msword': 'description',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'description',
      'application/vnd.ms-excel': 'table_chart',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'table_chart',
      'image/jpeg': 'image',
      'image/png': 'image',
      'image/gif': 'image',
      'image/webp': 'image'
    };

    return iconMap[fileType] || 'insert_drive_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Private methods
  private createFileInfo(file: File): FileInfo {
    return {
      id: this.generateId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      extension: this.getFileExtension(file.name),
      lastModified: new Date(file.lastModified)
    };
  }

  private getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.'));
  }

  private initializeProgress(fileId: string, totalBytes: number): void {
    const progress: UploadProgress = {
      fileId,
      progress: 0,
      status: 'pending',
      uploadedBytes: 0,
      totalBytes
    };

    const currentProgress = this.uploadProgress.value;
    this.uploadProgress.next([...currentProgress, progress]);
  }

  private updateProgress(fileId: string, uploadedBytes: number, speed?: number): void {
    const currentProgress = this.uploadProgress.value;
    const fileProgress = currentProgress.find(p => p.fileId === fileId);
    
    if (fileProgress) {
      const progress = Math.round((uploadedBytes / fileProgress.totalBytes) * 100);
      const estimatedTime = speed ? (fileProgress.totalBytes - uploadedBytes) / speed : undefined;

      const updatedProgress: UploadProgress = {
        ...fileProgress,
        progress,
        status: 'uploading',
        uploadedBytes,
        speed,
        estimatedTime
      };

      const updatedProgresses = currentProgress.map(p => 
        p.fileId === fileId ? updatedProgress : p
      );

      this.uploadProgress.next(updatedProgresses);
    }
  }

  private completeProgress(fileId: string): void {
    const currentProgress = this.uploadProgress.value;
    const fileProgress = currentProgress.find(p => p.fileId === fileId);
    
    if (fileProgress) {
      const updatedProgress: UploadProgress = {
        ...fileProgress,
        progress: 100,
        status: 'completed',
        uploadedBytes: fileProgress.totalBytes
      };

      const updatedProgresses = currentProgress.map(p => 
        p.fileId === fileId ? updatedProgress : p
      );

      this.uploadProgress.next(updatedProgresses);
    }
  }

  private errorProgress(fileId: string, error: string): void {
    const currentProgress = this.uploadProgress.value;
    const fileProgress = currentProgress.find(p => p.fileId === fileId);
    
    if (fileProgress) {
      const updatedProgress: UploadProgress = {
        ...fileProgress,
        status: 'error',
        error
      };

      const updatedProgresses = currentProgress.map(p => 
        p.fileId === fileId ? updatedProgress : p
      );

      this.uploadProgress.next(updatedProgresses);
    }
  }

  private mockUpload(fileInfo: FileInfo, endpoint: string): Observable<UploadResult> {
    return new Observable(observer => {
      let uploadedBytes = 0;
      const totalBytes = fileInfo.size;
      const chunkSize = Math.max(1024, Math.floor(totalBytes / 100)); // 1KB or 1% of file
      
      const interval = setInterval(() => {
        uploadedBytes += chunkSize;
        
        if (uploadedBytes >= totalBytes) {
          uploadedBytes = totalBytes;
          clearInterval(interval);
          
          observer.next({
            fileId: fileInfo.id,
            success: true,
            url: `https://example.com/uploads/${fileInfo.name}`,
            uploadedFileId: Date.now().toString(),
            metadata: {
              originalName: fileInfo.name,
              size: fileInfo.size,
              type: fileInfo.type,
              uploadedAt: new Date()
            }
          });
          observer.complete();
        } else {
          this.updateProgress(fileInfo.id, uploadedBytes, chunkSize * 10); // Mock speed
        }
      }, 100); // Update every 100ms for smooth progress
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
