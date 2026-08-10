import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ShortestPathComponent } from './shortest-path';

describe('ShortestPathComponent', () => {
  let component: ShortestPathComponent;
  let fixture: ComponentFixture<ShortestPathComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortestPathComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortestPathComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
