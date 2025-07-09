import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonTeamTaskCreatePopupComponent } from './common-team-task-create-popup.component';

describe('CommonTeamTaskCreatePopupComponent', () => {
  let component: CommonTeamTaskCreatePopupComponent;
  let fixture: ComponentFixture<CommonTeamTaskCreatePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonTeamTaskCreatePopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonTeamTaskCreatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
