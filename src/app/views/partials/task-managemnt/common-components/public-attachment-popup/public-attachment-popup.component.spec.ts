import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicAttachmentPopupComponent } from './public-attachment-popup.component';

describe('PublicAttachmentPopupComponent', () => {
  let component: PublicAttachmentPopupComponent;
  let fixture: ComponentFixture<PublicAttachmentPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicAttachmentPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicAttachmentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
