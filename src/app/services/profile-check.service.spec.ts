import { TestBed } from '@angular/core/testing';

import { ProfileCheckService } from './profile-check.service';

describe('ProfileCheckService', () => {
  let service: ProfileCheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileCheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
