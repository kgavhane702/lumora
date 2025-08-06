import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragOverlay } from './drag-overlay';

describe('DragOverlay', () => {
  let component: DragOverlay;
  let fixture: ComponentFixture<DragOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragOverlay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DragOverlay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
