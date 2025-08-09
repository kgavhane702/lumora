import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-panel.html',
  styleUrl: './tab-panel.scss'
})
export class TabPanel {
  @Input() tabId: string = '';
  @Input() activeTab: string = '';
  @Input() lazy: boolean = false;
  @Input() preserveContent: boolean = true;

  private hasBeenActive = false;

  @HostBinding('class.tab-panel--active')
  get isActive(): boolean {
    const active = this.activeTab === this.tabId;
    if (active) {
      this.hasBeenActive = true;
    }
    return active;
  }

  @HostBinding('class.tab-panel--hidden')
  get isHidden(): boolean {
    return !this.isActive;
  }

  get shouldRender(): boolean {
    if (!this.lazy) return true;
    if (this.preserveContent) return this.hasBeenActive;
    return this.isActive;
  }
}
