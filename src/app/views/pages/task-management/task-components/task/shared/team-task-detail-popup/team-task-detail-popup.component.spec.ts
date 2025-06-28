import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamTaskDetailPopupComponent } from './team-task-detail-popup.component';

describe('TeamTaskDetailPopupComponent', () => {
  let component: TeamTaskDetailPopupComponent;
  let fixture: ComponentFixture<TeamTaskDetailPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamTaskDetailPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamTaskDetailPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
