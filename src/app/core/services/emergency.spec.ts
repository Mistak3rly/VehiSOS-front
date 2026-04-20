import { TestBed } from '@angular/core/testing';

import { Emergency } from './emergency';

describe('Emergency', () => {
  let service: Emergency;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Emergency);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
