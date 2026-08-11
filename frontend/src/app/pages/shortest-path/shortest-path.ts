import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Employee } from '../../models/employee';
import { ReportingHop, ReportingPath } from '../../models/reporting-path';
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
  path = signal<ReportingPath | null>(null);
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
    this.path.set(null);

    this.employeeService.getShortestPath(this.emp1, this.emp2).subscribe({
      next: (res) => {
        this.path.set(this.normalizePath(res));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to find reporting path.');
        this.loading.set(false);
      }
    });
  }

  initials(person: Employee): string {
    return (person?.name ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }

  hasDirectedHops(): boolean {
    return (this.path()?.hops?.length ?? 0) > 0;
  }

  hop(index: number): ReportingHop | undefined {
    return this.path()?.hops?.[index];
  }

  /** True when the left person reports to the right person. */
  reportsForward(index: number): boolean {
    const people = this.path()?.people ?? [];
    const hop = this.hop(index);
    const left = people[index];
    if (!hop || !left) {
      return true;
    }
    return hop.reporterId === left.employeeId;
  }

  hopLabel(index: number): string {
    const hop = this.hop(index);
    if (!hop) {
      return 'REPORTS_TO';
    }
    return `${this.personName(hop.reporterId)} reports to ${this.personName(hop.managerId)}`;
  }

  private personName(employeeId: string): string {
    const fromPath = this.path()?.people?.find((person) => person.employeeId === employeeId);
    if (fromPath?.name) {
      return fromPath.name;
    }
    return this.employees().find((person) => person.employeeId === employeeId)?.name ?? employeeId;
  }

  private normalizePath(res: ReportingPath | string[] | null | undefined): ReportingPath {
    if (Array.isArray(res)) {
      return {
        people: res.map((step) => this.toPerson(step)),
        hops: []
      };
    }

    return {
      people: (res?.people ?? []).map((person) => this.toPerson(person)),
      hops: res?.hops ?? []
    };
  }

  private toPerson(step: Employee | string): Employee {
    if (typeof step !== 'string') {
      return step;
    }
    const match = this.employees().find(
      (employee) => employee.employeeId === step || employee.name === step
    );
    return match ?? {
      employeeId: step,
      name: step,
      email: '',
      designation: ''
    };
  }
}
