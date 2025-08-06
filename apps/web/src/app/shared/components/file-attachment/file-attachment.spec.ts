import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileAttachment } from './file-attachment';

describe('FileAttachment', () => {
  let component: FileAttachment;
  let fixture: ComponentFixture<FileAttachment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileAttachment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileAttachment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
