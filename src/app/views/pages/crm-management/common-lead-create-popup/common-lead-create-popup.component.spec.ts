import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonLeadCreatePopupComponent } from './common-lead-create-popup.component';

describe('CommonLeadCreatePopupComponent', () => {
  let component: CommonLeadCreatePopupComponent;
  let fixture: ComponentFixture<CommonLeadCreatePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonLeadCreatePopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonLeadCreatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
