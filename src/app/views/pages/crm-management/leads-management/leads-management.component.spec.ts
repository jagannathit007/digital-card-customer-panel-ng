import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadsManagementComponent } from './leads-management.component';

describe('LeadsManagementComponent', () => {
  let component: LeadsManagementComponent;
  let fixture: ComponentFixture<LeadsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadsManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
