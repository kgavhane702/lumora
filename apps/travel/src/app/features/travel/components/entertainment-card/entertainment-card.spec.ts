import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntertainmentCard } from './entertainment-card';

describe('EntertainmentCard', () => {
  let component: EntertainmentCard;
  let fixture: ComponentFixture<EntertainmentCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntertainmentCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntertainmentCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
