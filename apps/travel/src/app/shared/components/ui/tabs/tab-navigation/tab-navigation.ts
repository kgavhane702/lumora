import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Tab, TabChangeEvent } from '../../../../interfaces/tab';

@Component({
  selector: 'app-tab-navigation',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './tab-navigation.html',
  styleUrl: './tab-navigation.scss'
})
export class TabNavigation {
  @Input() tabs: Tab[] = [];
  @Input() activeTab: string = '';
  @Input() variant: 'default' | 'pills' | 'underline' = 'default';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  
  @Output() tabChange = new EventEmitter<TabChangeEvent>();

  onTabClick(tab: Tab) {
    if (tab.disabled || tab.id === this.activeTab) {
      return;
    }

    const previousTab = this.activeTab;
    this.tabChange.emit({
      activeTab: tab.id,
      previousTab: previousTab || undefined
    });
  }

  isActive(tabId: string): boolean {
    return this.activeTab === tabId;
  }

  trackByTab(index: number, tab: Tab): string {
    return tab.id;
  }
}
