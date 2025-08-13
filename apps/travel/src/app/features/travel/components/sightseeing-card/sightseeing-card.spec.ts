import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SightseeingCard } from './sightseeing-card';

describe('SightseeingCard', () => {
  let component: SightseeingCard;
  let fixture: ComponentFixture<SightseeingCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SightseeingCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SightseeingCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
