import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandHeader } from './brand-header';

describe('BrandHeader', () => {
  let component: BrandHeader;
  let fixture: ComponentFixture<BrandHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
