import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { EmployeeService } from '../../services/employee';
import { SkillService } from '../../services/skill';
import { ProjectService } from '../../services/project';
import { Employee } from '../../models/employee';
import { Skill } from '../../models/skill';
import { Project } from '../../models/project';

interface DesignationStat {
  label: string;
  count: number;
  percent: number;
}

interface QuickLink {
  path: string;
  label: string;
  description: string;
  accent: string;
}

interface RelationshipAction {
  title: string;
  description: string;
  accent: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly skillService = inject(SkillService);
  private readonly projectService = inject(ProjectService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly employees = signal<Employee[]>([]);
  readonly skills = signal<Skill[]>([]);
  readonly projects = signal<Project[]>([]);

  readonly employeeCount = computed(() => this.employees().length);
  readonly skillCount = computed(() => this.skills().length);
  readonly projectCount = computed(() => this.projects().length);

  readonly recentEmployees = computed(() => this.employees().slice(0, 5));
  readonly recentSkills = computed(() => this.skills().slice(0, 4));
  readonly recentProjects = computed(() => this.projects().slice(0, 4));

  readonly designationStats = computed<DesignationStat[]>(() => {
    const list = this.employees();
    if (!list.length) {
      return [];
    }

    const counts = new Map<string, number>();
    for (const employee of list) {
      const key = employee.designation?.trim() || 'Unspecified';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const total = list.length;
    return [...counts.entries()]
      .map(([label, count]) => ({
        label,
        count,
        percent: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  });

  readonly relationshipActions: RelationshipAction[] = [
    {
      title: 'Assign Skill',
      description: 'Link employees to the skills they bring to the team.',
      accent: 'blue',
    },
    {
      title: 'Assign Project',
      description: 'Put people on the right client work and delivery teams.',
      accent: 'coral',
    },
    {
      title: 'Assign Manager',
      description: 'Connect reporting lines across the organization.',
      accent: 'amber',
    },
  ];

  readonly quickLinks: QuickLink[] = [
    {
      path: '/employees',
      label: 'Employees',
      description: 'Manage people and profiles',
      accent: 'teal',
    },
    {
      path: '/skills',
      label: 'Skills',
      description: 'Track capabilities across teams',
      accent: 'blue',
    },
    {
      path: '/projects',
      label: 'Projects',
      description: 'See active client work',
      accent: 'coral',
    },
    {
      path: '/graph',
      label: 'Skill Graph',
      description: 'Explore the relationship map',
      accent: 'indigo',
    },
    {
      path: '/relationships',
      label: 'Relationships',
      description: 'Assign skills, projects & managers',
      accent: 'mint',
    },
    {
      path: '/recommendations',
      label: 'Recommendations',
      description: 'Find matching talent faster',
      accent: 'amber',
    },
  ];

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      employees: this.employeeService.getEmployees(),
      skills: this.skillService.getSkills(),
      projects: this.projectService.getProjects(),
    }).subscribe({
      next: ({ employees, skills, projects }) => {
        this.employees.set([...(employees ?? [])]);
        this.skills.set([...(skills ?? [])]);
        this.projects.set([...(projects ?? [])]);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Unable to load dashboard data. Check that the API is running.');
        this.loading.set(false);
      },
    });
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }
}
