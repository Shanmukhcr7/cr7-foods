import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Foods } from './foods';

describe('Foods', () => {
  let component: Foods;
  let fixture: ComponentFixture<Foods>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Foods]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Foods);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
