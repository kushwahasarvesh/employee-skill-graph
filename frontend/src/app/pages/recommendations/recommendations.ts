import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { Employee } from '../../models/employee';
import { Recommendation } from '../../models/recommendation';
import { EmployeeService } from '../../services/employee';
import { AlertService } from '../../services/alert';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recommendations.html',
  styleUrl: './recommendations.scss'
})
export class RecommendationsComponent implements OnInit {

  private employeeService = inject(EmployeeService);
  private alert = inject(AlertService);

  employees = signal<Employee[]>([]);
  employeeId = '';
  recommendations = signal<Recommendation[]>([]);
  searched = signal(false);
  loading = signal(false);
  error = signal('');

  ngOnInit() {
    this.employeeService.getEmployees().subscribe({
      next: (res) => this.employees.set(res ?? []),
      error: () => this.error.set('Failed to load employees.')
    });
  }

  findSimilar() {
    if (!this.employeeId) {
      this.alert.warning('Please select an employee.');
      return;
    }

    const selectedEmployeeId = this.employeeId;

    this.loading.set(true);
    this.error.set('');
    this.searched.set(true);
    this.recommendations.set([]);

    forkJoin({
      recommendations: this.employeeService.getRecommendations(selectedEmployeeId),
      selectedSkills: this.employeeService.getEmployeeSkills(selectedEmployeeId)
    }).pipe(
      switchMap(({ recommendations, selectedSkills }) => {
        const rows = recommendations ?? [];
        if (rows.length === 0) {
          return of([] as Recommendation[]);
        }

        const alreadyMatched = rows.some(r => (r.matchedSkills?.length ?? 0) > 0);
        if (alreadyMatched) {
          return of(rows);
        }

        const selectedNames = new Set(
          (selectedSkills ?? []).map(s => s.skillName)
        );

        return forkJoin(
          rows.map(rec =>
            this.employeeService.getEmployeeSkills(rec.employeeId).pipe(
              map(skills => ({
                employeeId: rec.employeeId,
                name: rec.name,
                matchedSkills: (skills ?? [])
                  .map(s => s.skillName)
                  .filter(name => selectedNames.has(name))
              } as Recommendation)),
              catchError(() => of({
                employeeId: rec.employeeId,
                name: rec.name,
                matchedSkills: [] as string[]
              } as Recommendation))
            )
          )
        );
      }),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (res) => this.recommendations.set(res ?? []),
      error: () => this.error.set('Failed to load recommendations.')
    });
  }

  skillsMatch(rec: Recommendation): string {
    return (rec.matchedSkills ?? []).join(', ');
  }
}
