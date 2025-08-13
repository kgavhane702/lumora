import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccommodationCard } from './accommodation-card';

describe('AccommodationCard', () => {
  let component: AccommodationCard;
  let fixture: ComponentFixture<AccommodationCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccommodationCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccommodationCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
