import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TallerDashboard } from './taller-dashboard';

describe('TallerDashboard', () => {
  let component: TallerDashboard;
  let fixture: ComponentFixture<TallerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TallerDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(TallerDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
