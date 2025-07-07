import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicAttachmentComponent } from './public-attachment.component';

describe('PublicAttachmentComponent', () => {
  let component: PublicAttachmentComponent;
  let fixture: ComponentFixture<PublicAttachmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicAttachmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
