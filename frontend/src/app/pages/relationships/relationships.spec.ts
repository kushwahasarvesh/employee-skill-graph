import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { RelationshipsComponent } from './relationships';

describe('RelationshipsComponent', () => {
  let component: RelationshipsComponent;
  let fixture: ComponentFixture<RelationshipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelationshipsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelationshipsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
