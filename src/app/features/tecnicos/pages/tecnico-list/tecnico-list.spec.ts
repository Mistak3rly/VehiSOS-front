import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TecnicoList } from './tecnico-list';

describe('TecnicoList', () => {
  let component: TecnicoList;
  let fixture: ComponentFixture<TecnicoList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TecnicoList],
    }).compileComponents();

    fixture = TestBed.createComponent(TecnicoList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
