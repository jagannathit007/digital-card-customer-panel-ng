import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCategorySelectionDropdownComponent } from './task-category-selection-dropdown.component';

describe('TaskCategorySelectionDropdownComponent', () => {
  let component: TaskCategorySelectionDropdownComponent;
  let fixture: ComponentFixture<TaskCategorySelectionDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCategorySelectionDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskCategorySelectionDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
