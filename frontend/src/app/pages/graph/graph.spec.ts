import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { Graph } from './graph';

describe('Graph', () => {
  let component: Graph;
  let fixture: ComponentFixture<Graph>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Graph],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Graph);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
