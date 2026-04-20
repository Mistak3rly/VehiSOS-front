import { TestBed } from '@angular/core/testing';

import { Technician } from './technician';

describe('Technician', () => {
  let service: Technician;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Technician);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
