import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelaxationCard } from './relaxation-card';

describe('RelaxationCard', () => {
  let component: RelaxationCard;
  let fixture: ComponentFixture<RelaxationCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelaxationCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelaxationCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
