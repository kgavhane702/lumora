import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-drag-overlay',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './drag-overlay.html',
  styleUrls: ['./drag-overlay.scss']
})
export class DragOverlay {
  @Input() isVisible: boolean = false;
  @Input() message: string = 'Drop your files here';
  @Input() subtitle: string = 'Drag and drop files to attach them to your message';
}
