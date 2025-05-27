import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberheaderComponent } from './memberheader.component';

describe('MemberheaderComponent', () => {
  let component: MemberheaderComponent;
  let fixture: ComponentFixture<MemberheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberheaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
