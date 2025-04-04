import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessServicesComponent } from './business-services.component';

describe('BusinessServicesComponent', () => {
  let component: BusinessServicesComponent;
  let fixture: ComponentFixture<BusinessServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
