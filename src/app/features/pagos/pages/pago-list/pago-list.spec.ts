import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoList } from './pago-list';

describe('PagoList', () => {
  let component: PagoList;
  let fixture: ComponentFixture<PagoList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoList],
    }).compileComponents();

    fixture = TestBed.createComponent(PagoList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
