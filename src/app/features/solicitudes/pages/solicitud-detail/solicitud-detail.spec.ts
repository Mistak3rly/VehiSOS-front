import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudDetail } from './solicitud-detail';

describe('SolicitudDetail', () => {
  let component: SolicitudDetail;
  let fixture: ComponentFixture<SolicitudDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitudDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
