import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'completed' | 'error';
}

@Component({
  selector: 'app-file-attachment',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './file-attachment.html',
  styleUrls: ['./file-attachment.scss']
})
export class FileAttachmentComponent implements OnInit {
  @Input() attachedFiles: AttachedFile[] = [];
  @Input() maxFiles: number = 5;
  @Input() maxFileSize: number = 10 * 1024 * 1024; // 10MB
  @Input() acceptedTypes: string = '.pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png';
  @Input() showUploadProgress: boolean = true;
  
  @Output() fileRemove = new EventEmitter<AttachedFile>();
  @Output() fileUpload = new EventEmitter<File[]>();
  @Output() fileError = new EventEmitter<{ file: File; error: string }>();

  ngOnInit() {
    // Simulate upload progress for new files
    this.simulateUploadProgress();
  }

  ngOnChanges() {
    // Re-simulate progress when attachedFiles changes
    if (this.attachedFiles.length > 0) {
      this.simulateUploadProgress();
    }
  }

  onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    const validFiles: File[] = [];
    const errors: { file: File; error: string }[] = [];

    files.forEach(file => {
      // Check file size
      if (file.size > this.maxFileSize) {
        errors.push({ file, error: 'File too large' });
        return;
      }

      // Check file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!this.acceptedTypes.includes(fileExtension)) {
        errors.push({ file, error: 'File type not supported' });
        return;
      }

      validFiles.push(file);
    });

    // Emit errors
    errors.forEach(error => this.fileError.emit(error));

    // Emit valid files
    if (validFiles.length > 0) {
      this.fileUpload.emit(validFiles);
    }

    // Reset input
    event.target.value = '';
  }

  onRemoveFile(file: AttachedFile) {
    this.fileRemove.emit(file);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('text')) return 'description';
    return 'attach_file';
  }

  trackByFile(index: number, file: AttachedFile): string {
    return file.id;
  }

  private simulateUploadProgress() {
    // Simulate upload progress for files that are pending
    this.attachedFiles.forEach(file => {
      if (file.uploadStatus === 'pending') {
        file.uploadStatus = 'uploading';
        file.uploadProgress = 0;
        
        // Simulate progress animation
        const interval = setInterval(() => {
          if (file.uploadProgress !== undefined && file.uploadProgress < 100) {
            file.uploadProgress += Math.random() * 15 + 5; // Random increment between 5-20%
            if (file.uploadProgress >= 100) {
              file.uploadProgress = 100;
              file.uploadStatus = 'completed';
              clearInterval(interval);
            }
          } else {
            clearInterval(interval);
          }
        }, 200); // Update every 200ms
      }
    });
  }
}
