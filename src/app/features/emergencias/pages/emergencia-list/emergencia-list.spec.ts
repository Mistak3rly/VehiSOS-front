import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergenciaList } from './emergencia-list';

describe('EmergenciaList', () => {
  let component: EmergenciaList;
  let fixture: ComponentFixture<EmergenciaList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmergenciaList],
    }).compileComponents();

    fixture = TestBed.createComponent(EmergenciaList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
