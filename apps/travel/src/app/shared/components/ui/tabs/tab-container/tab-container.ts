import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabNavigation } from '../tab-navigation/tab-navigation';
import { Tab, TabChangeEvent } from '../../../../interfaces/tab';

@Component({
  selector: 'app-tab-container',
  standalone: true,
  imports: [CommonModule, TabNavigation],
  templateUrl: './tab-container.html',
  styleUrl: './tab-container.scss'
})
export class TabContainer implements OnInit {
  @Input() tabs: Tab[] = [];
  @Input() activeTab: string = '';
  @Input() variant: 'default' | 'pills' | 'underline' = 'default';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() lazy: boolean = false;
  @Input() preserveContent: boolean = true;
  
  @Output() tabChange = new EventEmitter<TabChangeEvent>();

  ngOnInit() {
    // Set first tab as active if no active tab is specified
    if (!this.activeTab && this.tabs.length > 0) {
      const firstEnabledTab = this.tabs.find(tab => !tab.disabled);
      if (firstEnabledTab) {
        this.activeTab = firstEnabledTab.id;
      }
    }
  }

  onTabChange(event: TabChangeEvent) {
    this.activeTab = event.activeTab;
    this.tabChange.emit(event);
  }
}
