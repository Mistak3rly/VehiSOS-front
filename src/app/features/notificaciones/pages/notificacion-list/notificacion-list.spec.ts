import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificacionList } from './notificacion-list';

describe('NotificacionList', () => {
  let component: NotificacionList;
  let fixture: ComponentFixture<NotificacionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificacionList],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificacionList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
