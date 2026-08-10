import { Component, OnInit, inject, signal } from '@angular/core';
import { EmployeeService } from '../../services/employee';
import { Employee } from '../../models/employee';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './employees.html',
  styleUrl: './employees.scss'
})
export class EmployeesComponent implements OnInit {

  private employeeService = inject(EmployeeService);
  private fb = inject(FormBuilder);

  employees = signal<Employee[]>([]);
  editMode = false;
  employeeForm = this.fb.group({
    employeeId: ['', Validators.required],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    designation: ['', Validators.required]
  });

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
      }
    });
  }

  saveEmployee() {
    if (this.employeeForm.invalid) {
      return;
    }
    const employee = this.employeeForm.value as Employee;
    if (this.editMode) {
      this.employeeService.updateEmployee(employee).subscribe({
        next: () => {
          alert('Employee Updated Successfully');
          this.employeeForm.reset();
          this.editMode = false;
          this.loadEmployees();
        },
        error: (err) => {
          console.error(err);
        }
      });
    } else {
      const alreadyExists = this.employees().some(
        (e) => e.employeeId === employee.employeeId
      );
      if (alreadyExists) {
        alert('This Employee ID already exists');
        return;
      }
      this.employeeService.addEmployee(employee).subscribe({
        next: () => {
          alert('Employee Added Successfully');
          this.employeeForm.reset();
          this.loadEmployees();
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  }

  editEmployee(employee: Employee) {
    this.editMode = true;
    this.employeeForm.patchValue(employee);
  }

  deleteEmployee(id: string) {
    if (!confirm('Delete Employee?')) {
      return;
    }
    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        alert('Employee Deleted Successfully');
        this.loadEmployees();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

}
