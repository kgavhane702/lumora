import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferCard } from './transfer-card';

describe('TransferCard', () => {
  let component: TransferCard;
  let fixture: ComponentFixture<TransferCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
