import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { EmployeeDetailsComponent } from './employee-details';
import { EmployeeService } from '../../services/employee';

describe('EmployeeDetailsComponent', () => {
  let component: EmployeeDetailsComponent;
  let fixture: ComponentFixture<EmployeeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeDetailsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: EmployeeService,
          useValue: {
            getEmployee: () => of({
              employeeId: 'E1',
              name: 'Test',
              email: 'test@example.com',
              designation: 'Dev'
            }),
            getEmployeeSkills: () => of([]),
            getEmployeeProjects: () => of([])
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
