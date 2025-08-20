import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadDetailPopupComponent } from './lead-detail-popup.component';

describe('LeadDetailPopupComponent', () => {
  let component: LeadDetailPopupComponent;
  let fixture: ComponentFixture<LeadDetailPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadDetailPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadDetailPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
