import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Skill } from '../models/skill';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SkillService {

  private http = inject(HttpClient);

  private api = `${environment.apiUrl}/skills`;

  getSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.api}?_=${Date.now()}`, {
      headers: new HttpHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      })
    });
  }

  addSkill(skill: Skill) {
    return this.http.post(this.api, skill, {
      responseType: 'text'
    });
  }

  updateSkill(skill: Skill) {
    return this.http.put(`${this.api}/${skill.skillId}`, skill, {
      responseType: 'text'
    });
  }

  deleteSkill(id: string) {
    return this.http.delete(`${this.api}/${id}`, {
      responseType: 'text'
    });
  }

}
