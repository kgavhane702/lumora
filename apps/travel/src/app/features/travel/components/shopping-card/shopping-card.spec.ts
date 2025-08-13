import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingCard } from './shopping-card';

describe('ShoppingCard', () => {
  let component: ShoppingCard;
  let fixture: ComponentFixture<ShoppingCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShoppingCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
