import { Component, OnInit, inject, signal } from '@angular/core';
import { EmployeeService } from '../../services/employee';
import { AlertService } from '../../services/alert';
import { Employee } from '../../models/employee';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employees.html',
  styleUrl: './employees.scss'
})
export class EmployeesComponent implements OnInit {

  private employeeService = inject(EmployeeService);
  private alert = inject(AlertService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  private readonly emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  employees = signal<Employee[]>([]);
  editMode = false;
  employeeForm = this.fb.group({
    employeeId: ['', Validators.required],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
    designation: ['', Validators.required]
  });

  get email() {
    return this.employeeForm.get('email');
  }

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: (response) => {
        this.employees.set([...response]);
      },
      error: (error) => {
        console.error(error);
        this.alert.error('Failed to load employees');
      }
    });
  }

  saveEmployee() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      if (this.email?.hasError('required')) {
        this.alert.warning('Email ID is required');
      } else if (this.email?.hasError('pattern')) {
        this.alert.warning('Please enter a valid email ID');
      } else {
        this.alert.warning('Please fill all required fields');
      }
      return;
    }
    const employee = this.employeeForm.value as Employee;
    const emailTaken = this.employees().some(
      (e) =>
        e.email.toLowerCase() === employee.email.toLowerCase() &&
        e.employeeId !== employee.employeeId
    );
    if (emailTaken) {
      this.alert.warning('This email ID already exists');
      return;
    }
    if (this.editMode) {
      this.employeeService.updateEmployee(employee).subscribe({
        next: () => {
          this.alert.update('Employee Updated Successfully');
          this.employeeForm.reset();
          this.editMode = false;
          this.loadEmployees();
        },
        error: (err) => {
          console.error(err);
          this.alert.error('Failed to update employee');
        }
      });
    } else {
      const alreadyExists = this.employees().some(
        (e) => e.employeeId === employee.employeeId
      );
      if (alreadyExists) {
        this.alert.warning('This Employee ID already exists');
        return;
      }
      this.employeeService.addEmployee(employee).subscribe({
        next: () => {
          this.alert.success('Employee Added Successfully');
          this.employeeForm.reset();
          this.loadEmployees();
        },
        error: (err) => {
          console.error(err);
          this.alert.error('Failed to add employee');
        }
      });
    }
  }

  openEmployeeDetails(employee: Employee) {
    this.router.navigate(['/employees', employee.employeeId]);
  }

  editEmployee(employee: Employee) {
    this.editMode = true;
    this.employeeForm.patchValue(employee);
  }

  deleteEmployee(employee: Employee) {
    this.alert.confirmDelete(employee.name, 'Do you want to delete this employee?').subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.employeeService.deleteEmployee(employee.employeeId).subscribe({
        next: () => {
          this.alert.deleted('Employee Deleted Successfully');
          this.loadEmployees();
        },
        error: (err) => {
          console.error(err);
          this.alert.error('Failed to delete employee');
        }
      });
    });
  }

}
