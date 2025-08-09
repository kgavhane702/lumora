import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickActionsGrid } from './quick-actions-grid';

describe('QuickActionsGrid', () => {
  let component: QuickActionsGrid;
  let fixture: ComponentFixture<QuickActionsGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickActionsGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickActionsGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
