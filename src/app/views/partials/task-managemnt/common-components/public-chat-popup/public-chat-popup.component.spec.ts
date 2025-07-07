import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicChatPopupComponent } from './public-chat-popup.component';

describe('PublicChatPopupComponent', () => {
  let component: PublicChatPopupComponent;
  let fixture: ComponentFixture<PublicChatPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicChatPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicChatPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
