import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap, throwError } from 'rxjs';

import { Employee } from '../../models/employee';
import { Skill } from '../../models/skill';
import { Project } from '../../models/project';

import { EmployeeService } from '../../services/employee';
import { SkillService } from '../../services/skill';
import { ProjectService } from '../../services/project';

@Component({
  selector: 'app-relationships',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './relationships.html',
  styleUrl: './relationships.scss'
})
export class RelationshipsComponent implements OnInit {

  employeeService = inject(EmployeeService);
  skillService = inject(SkillService);
  projectService = inject(ProjectService);

  employees: Employee[] = [];
  skills: Skill[] = [];
  projects: Project[] = [];

  skillEmployeeId = '';
  skillId = '';

  projectEmployeeId = '';
  projectId = '';

  managerEmployeeId = '';
  managerId = '';

  ngOnInit() {
    this.employeeService.getEmployees()
      .subscribe(res => this.employees = res);

    this.skillService.getSkills()
      .subscribe(res => this.skills = res);

    this.projectService.getProjects()
      .subscribe(res => this.projects = res);
  }

  assignSkill() {
    if (!this.skillEmployeeId || !this.skillId) {
      alert('Please select both employee and skill.');
      return;
    }

    const employeeId = this.skillEmployeeId;
    const skillId = this.skillId;
    const employeeName = this.employeeName(employeeId);

    this.employeeService.getEmployeeSkills(employeeId).pipe(
      switchMap(existing => {
        if (existing.some(s => s.skillId === skillId)) {
          return throwError(() => ({
            duplicate: true,
            message: `This skill already exists for the selected employee (${employeeName}).`
          }));
        }
        return this.employeeService.assignSkill(employeeId, skillId);
      })
    ).subscribe({
      next: () => {
        alert('Skill assigned successfully.');
        this.skillEmployeeId = '';
        this.skillId = '';
      },
      error: (err) => alert(this.errorMessage(
        err,
        `This skill already exists for the selected employee (${employeeName}).`
      ))
    });
  }

  assignProject() {
    if (!this.projectEmployeeId || !this.projectId) {
      alert('Please select both employee and project.');
      return;
    }

    const employeeId = this.projectEmployeeId;
    const projectId = this.projectId;
    const employeeName = this.employeeName(employeeId);

    this.employeeService.getEmployeeProjects(employeeId).pipe(
      switchMap(existing => {
        if (existing.some(p => p.projectId === projectId)) {
          return throwError(() => ({
            duplicate: true,
            message: `This project already exists for the selected employee (${employeeName}).`
          }));
        }
        return this.employeeService.assignProject(employeeId, projectId);
      })
    ).subscribe({
      next: () => {
        alert('Project assigned successfully.');
        this.projectEmployeeId = '';
        this.projectId = '';
      },
      error: (err) => alert(this.errorMessage(
        err,
        `This project already exists for the selected employee (${employeeName}).`
      ))
    });
  }

  assignManager() {
    if (!this.managerEmployeeId || !this.managerId) {
      alert('Please select both employee and manager.');
      return;
    }

    if (this.managerEmployeeId === this.managerId) {
      alert('An employee cannot be their own manager.');
      return;
    }

    this.employeeService
      .assignManager(this.managerEmployeeId, this.managerId)
      .subscribe({
        next: () => {
          alert('Manager assigned successfully.');
          this.managerEmployeeId = '';
          this.managerId = '';
        },
        error: (err) => alert(this.errorMessage(err, 'Failed to assign manager.'))
      });
  }

  private employeeName(employeeId: string): string {
    return this.employees.find(e => e.employeeId === employeeId)?.name || employeeId;
  }

  private errorMessage(err: any, fallback: string): string {
    if (err?.duplicate && err?.message) {
      return err.message;
    }

    if (typeof err?.error === 'string' && err.error.trim()) {
      try {
        const parsed = JSON.parse(err.error);
        if (parsed?.message) {
          return parsed.message;
        }
      } catch {
        return err.error;
      }
    }

    if (err?.error?.message) {
      return err.error.message;
    }

    if (err?.message && !err?.name) {
      return err.message;
    }

    return fallback;
  }
}
