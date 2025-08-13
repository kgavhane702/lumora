import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-follow-up-questions',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './follow-up-questions.html',
  styleUrl: './follow-up-questions.scss'
})
export class FollowUpQuestions {
  @Input() questions: string[] = [];
  @Input() title: string = 'Related questions';
  @Input() icon: string = 'chat';
  @Input() variant: 'list' | 'grid' | 'chips' = 'list';
  @Input() maxVisible?: number;
  
  @Output() questionClick = new EventEmitter<string>();

  get visibleQuestions(): string[] {
    return this.maxVisible ? this.questions.slice(0, this.maxVisible) : this.questions;
  }

  onQuestionClick(question: string) {
    this.questionClick.emit(question);
  }
}
