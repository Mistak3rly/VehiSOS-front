import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergenciaDetail } from './emergencia-detail';

describe('EmergenciaDetail', () => {
  let component: EmergenciaDetail;
  let fixture: ComponentFixture<EmergenciaDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmergenciaDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(EmergenciaDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
