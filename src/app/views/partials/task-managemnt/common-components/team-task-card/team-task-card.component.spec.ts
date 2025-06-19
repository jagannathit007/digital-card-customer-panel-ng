import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamTaskCardComponent } from './team-task-card.component';

describe('TeamTaskCardComponent', () => {
  let component: TeamTaskCardComponent;
  let fixture: ComponentFixture<TeamTaskCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamTaskCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamTaskCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
