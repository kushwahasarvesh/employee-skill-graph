import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../models/project';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private http = inject(HttpClient);

  private api = `${environment.apiUrl}/projects`;

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.api}?_=${Date.now()}`, {
      headers: new HttpHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      })
    });
  }

  addProject(project: Project) {
    return this.http.post(this.api, project, {
      responseType: 'text'
    });
  }

  updateProject(project: Project) {
    return this.http.put(`${this.api}/${project.projectId}`, project, {
      responseType: 'text'
    });
  }

  deleteProject(id: string) {
    return this.http.delete(`${this.api}/${id}`, {
      responseType: 'text'
    });
  }

}
