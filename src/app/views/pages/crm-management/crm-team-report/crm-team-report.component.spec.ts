import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmTeamReportComponent } from './crm-team-report.component';

describe('CrmTeamReportComponent', () => {
  let component: CrmTeamReportComponent;
  let fixture: ComponentFixture<CrmTeamReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrmTeamReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrmTeamReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
