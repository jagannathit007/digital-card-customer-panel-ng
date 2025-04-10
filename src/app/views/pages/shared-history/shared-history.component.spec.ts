import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedHistoryComponent } from './shared-history.component';

describe('SharedHistoryComponent', () => {
  let component: SharedHistoryComponent;
  let fixture: ComponentFixture<SharedHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
