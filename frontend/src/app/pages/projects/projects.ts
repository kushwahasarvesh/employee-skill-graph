import { Component, OnInit, inject, signal } from '@angular/core';
import { ProjectService } from '../../services/project';
import { Project } from '../../models/project';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class ProjectsComponent implements OnInit {

  private projectService = inject(ProjectService);
  private fb = inject(FormBuilder);

  projects = signal<Project[]>([]);
  editMode = false;
  projectForm = this.fb.group({
    projectId: ['', Validators.required],
    projectName: ['', Validators.required],
    clientName: ['', Validators.required],
    description: ['', Validators.required]
  });

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe({
      next: (response) => {
        this.projects.set([...(response ?? [])]);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  resetForm() {
    this.projectForm.reset({
      projectId: '',
      projectName: '',
      clientName: '',
      description: ''
    });
    this.editMode = false;
  }

  saveProject() {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const project = this.projectForm.value as Project;

    if (this.editMode) {
      this.projectService.updateProject(project).subscribe({
        next: () => {
          this.projects.update((list) =>
            list.map((p) => (p.projectId === project.projectId ? { ...project } : p))
          );
          this.resetForm();
          this.loadProjects();
          alert('Project Updated Successfully');
        },
        error: (err) => {
          console.error(err);
          alert('Failed to update project');
        }
      });
      return;
    }

    const alreadyExists = this.projects().some(
      (p) => p.projectId === project.projectId
    );
    if (alreadyExists) {
      alert('This Project ID already exists');
      return;
    }

    this.projectService.addProject(project).subscribe({
      next: () => {
        this.projects.update((list) => [...list, { ...project }]);
        this.resetForm();
        this.loadProjects();
        alert('Project Added Successfully');
      },
      error: (err) => {
        console.error(err);
        alert('Failed to add project');
      }
    });
  }

  editProject(project: Project) {
    this.editMode = true;
    this.projectForm.patchValue(project);
  }

  deleteProject(id: string) {
    if (!confirm('Delete Project?')) {
      return;
    }
    this.projectService.deleteProject(id).subscribe({
      next: () => {
        this.projects.update((list) => list.filter((p) => p.projectId !== id));
        this.resetForm();
        this.loadProjects();
        alert('Project Deleted Successfully');
      },
      error: (err) => {
        console.error(err);
        alert('Failed to delete project');
      }
    });
  }

}
