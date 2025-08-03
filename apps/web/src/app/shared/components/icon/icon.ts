import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconService } from '../../services/icon.service';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.html',
  styleUrl: './icon.scss'
})
export class Icon {
  @Input() name: string = '';
  @Input() size: number = 24;
  @Input() color: string = 'currentColor';
  @Input() className: string = '';

  constructor(
    private iconService: IconService,
    private sanitizer: DomSanitizer
  ) {}

  get iconPath(): SafeHtml {
    const svgContent = this.iconService.getIconPath(this.name);
    return this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }
}
