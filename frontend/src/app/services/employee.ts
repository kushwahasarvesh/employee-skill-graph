import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Employee } from '../models/employee';
import { Skill } from '../models/skill';
import { Project } from '../models/project';
import { Recommendation } from '../models/recommendation';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private http = inject(HttpClient);

  private api = `${environment.apiUrl}/employees`;

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.api, {
      headers: new HttpHeaders({
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache'
      })
    });
  }

  getEmployee(employeeId: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.api}/${employeeId}`);
  }

  addEmployee(employee: Employee) {
    return this.http.post(this.api, employee);
  }

  deleteEmployee(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  }

  updateEmployee(employee: Employee) {
    return this.http.put(
      `${this.api}/${employee.employeeId}`,
      employee
    );
  }

  getEmployeeSkills(employeeId: string): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.api}/${employeeId}/skills`);
  }

  getEmployeeProjects(employeeId: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.api}/${employeeId}/projects`);
  }

  getRecommendations(employeeId: string): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(`${this.api}/${employeeId}/recommendations`);
  }

  assignSkill(employeeId: string, skillId: string): Observable<{ message: string }> {
    return this.postAssign(`${this.api}/${employeeId}/skills/${skillId}`);
  }

  assignProject(employeeId: string, projectId: string): Observable<{ message: string }> {
    return this.postAssign(`${this.api}/${employeeId}/projects/${projectId}`);
  }

  assignManager(employeeId: string, managerId: string): Observable<{ message: string }> {
    return this.postAssign(`${this.api}/${employeeId}/manager/${managerId}`);
  }

  getShortestPath(emp1: string, emp2: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.api}/path/${emp1}/${emp2}`);
  }

  /**
   * Backend may return JSON {"message":"..."} or plain text.
   * Reading as text avoids Angular JSON parse failures that skip success handlers.
   */
  private postAssign(url: string): Observable<{ message: string }> {
    return this.http.post(url, {}, {
      responseType: 'text',
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      map((body: string) => {
        if (!body) {
          return { message: 'Success' };
        }
        try {
          const parsed = JSON.parse(body);
          return { message: parsed.message || body };
        } catch {
          return { message: body };
        }
      })
    );
  }

}
