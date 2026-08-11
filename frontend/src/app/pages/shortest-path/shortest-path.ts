import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Employee } from '../../models/employee';
import { EmployeeService } from '../../services/employee';
import { AlertService } from '../../services/alert';
import { AppSelectComponent } from '../../shared/app-select/app-select';

@Component({
  selector: 'app-shortest-path',
  standalone: true,
  imports: [CommonModule, FormsModule, AppSelectComponent],
  templateUrl: './shortest-path.html',
  styleUrl: './shortest-path.scss'
})
export class ShortestPathComponent implements OnInit {

  private employeeService = inject(EmployeeService);
  private alert = inject(AlertService);

  employees = signal<Employee[]>([]);
  employeeOptions = computed(() =>
    this.employees().map((employee) => ({ value: employee.employeeId, label: employee.name }))
  );
  emp1 = '';
  emp2 = '';
  path = signal<string[]>([]);
  searched = signal(false);
  loading = signal(false);
  error = signal('');

  ngOnInit() {
    this.employeeService.getEmployees().subscribe({
      next: (res) => this.employees.set(res ?? []),
      error: () => this.error.set('Failed to load employees.')
    });
  }

  findPath() {
    if (!this.emp1 || !this.emp2) {
      this.alert.warning('Please select both employees.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.searched.set(true);
    this.path.set([]);

    this.employeeService.getShortestPath(this.emp1, this.emp2).subscribe({
      next: (res) => {
        this.path.set((res ?? []).map((step) => this.toName(step)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to find reporting path.');
        this.loading.set(false);
      }
    });
  }

  initials(name: string): string {
    return (name ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }

  designation(name: string): string {
    return this.employees().find(
      (e) => e.name === name || e.employeeId === name
    )?.designation ?? '';
  }

  private toName(step: string): string {
    const match = this.employees().find(
      (e) => e.employeeId === step || e.name === step
    );
    return match?.name ?? step;
  }
}
