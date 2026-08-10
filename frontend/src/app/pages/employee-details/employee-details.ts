import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EmployeeService } from '../../services/employee';
import { Employee } from '../../models/employee';
import { Skill } from '../../models/skill';
import { Project } from '../../models/project';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-details.html',
  styleUrl: './employee-details.scss'
})
export class EmployeeDetailsComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);

  employee = signal<Employee | null>(null);
  skills = signal<Skill[]>([]);
  projects = signal<Project[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const employeeId = this.route.snapshot.paramMap.get('employeeId');
    if (!employeeId) {
      this.loading.set(false);
      this.error.set('Employee ID is missing');
      return;
    }
    this.loadDetails(employeeId);
  }

  loadDetails(employeeId: string) {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      employee: this.employeeService.getEmployee(employeeId),
      skills: this.employeeService.getEmployeeSkills(employeeId),
      projects: this.employeeService.getEmployeeProjects(employeeId)
    }).subscribe({
      next: ({ employee, skills, projects }) => {
        this.employee.set(employee);
        this.skills.set([...(skills ?? [])]);
        this.projects.set([...(projects ?? [])]);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to load employee details');
        this.loading.set(false);
      }
    });
  }
}
