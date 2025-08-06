import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-input.html',
  styleUrls: ['./search-input.scss']
})
export class SearchInputComponent implements OnInit, OnChanges {
  @Input() placeholder: string = 'Ask anything...';
  @Input() maxLength: number = 1000;
  @Input() autoFocus: boolean = false;
  @Input() disabled: boolean = false;
  @Input() searchQuery: string = '';
  
  @Output() inputChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();
  @Output() focus = new EventEmitter<void>();
  @Output() blur = new EventEmitter<void>();
  
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLTextAreaElement>;
  
  isFocused: boolean = false;

  ngOnInit() {
    if (this.autoFocus && this.searchInput) {
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 100);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchQuery'] && this.searchInput) {
      // Update the textarea value when searchQuery changes from parent
      this.searchInput.nativeElement.value = this.searchQuery;
      this.autoResize();
    }
  }

  onInputChange() {
    console.log('SearchInputComponent onInputChange called with:', this.searchQuery);
    this.inputChange.emit(this.searchQuery);
    this.autoResize();
  }

  autoResize() {
    if (this.searchInput) {
      const textarea = this.searchInput.nativeElement;
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = newHeight + 'px';
    }
  }

  onFocus() {
    this.isFocused = true;
    this.focus.emit();
  }

  onBlur() {
    this.isFocused = false;
    this.blur.emit();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSearch();
    }
  }

  onSearch() {
    const query = this.searchQuery.trim();
    if (query && !this.disabled) {
      this.search.emit(query);
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.inputChange.emit(this.searchQuery);
    this.autoResize();
  }

  focusInput() {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }
} 