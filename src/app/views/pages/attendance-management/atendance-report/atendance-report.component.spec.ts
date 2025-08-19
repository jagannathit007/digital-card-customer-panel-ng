import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtendanceReportComponent } from './atendance-report.component';

describe('AtendanceReportComponent', () => {
  let component: AtendanceReportComponent;
  let fixture: ComponentFixture<AtendanceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtendanceReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtendanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
