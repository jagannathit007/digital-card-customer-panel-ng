import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberfooterComponent } from './memberfooter.component';

describe('MemberfooterComponent', () => {
  let component: MemberfooterComponent;
  let fixture: ComponentFixture<MemberfooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberfooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberfooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
