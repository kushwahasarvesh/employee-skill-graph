import { Component, OnInit, inject, signal } from '@angular/core';
import { SkillService } from '../../services/skill';
import { Skill } from '../../models/skill';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './skills.html',
  styleUrl: './skills.scss'
})
export class SkillsComponent implements OnInit {

  private skillService = inject(SkillService);
  private fb = inject(FormBuilder);

  skills = signal<Skill[]>([]);
  editMode = false;
  skillForm = this.fb.group({
    skillId: ['', Validators.required],
    skillName: ['', Validators.required],
    description: ['', Validators.required]
  });

  ngOnInit() {
    this.loadSkills();
  }

  loadSkills() {
    this.skillService.getSkills().subscribe({
      next: (response) => {
        this.skills.set([...(response ?? [])]);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  resetForm() {
    this.skillForm.reset({
      skillId: '',
      skillName: '',
      description: ''
    });
    this.editMode = false;
  }

  saveSkill() {
    if (this.skillForm.invalid) {
      this.skillForm.markAllAsTouched();
      return;
    }

    const skill = this.skillForm.value as Skill;

    if (this.editMode) {
      this.skillService.updateSkill(skill).subscribe({
        next: () => {
          this.skills.update((list) =>
            list.map((s) => (s.skillId === skill.skillId ? { ...skill } : s))
          );
          this.resetForm();
          this.loadSkills();
          alert('Skill Updated Successfully');
        },
        error: (err) => {
          console.error(err);
          alert('Failed to update skill');
        }
      });
      return;
    }

    const alreadyExists = this.skills().some(
      (s) => s.skillId === skill.skillId
    );
    if (alreadyExists) {
      alert('This Skill ID already exists');
      return;
    }

    this.skillService.addSkill(skill).subscribe({
      next: () => {
        this.skills.update((list) => [...list, { ...skill }]);
        this.resetForm();
        this.loadSkills();
        alert('Skill Added Successfully');
      },
      error: (err) => {
        console.error(err);
        alert('Failed to add skill');
      }
    });
  }

  editSkill(skill: Skill) {
    this.editMode = true;
    this.skillForm.patchValue(skill);
  }

  deleteSkill(id: string) {
    if (!confirm('Delete Skill?')) {
      return;
    }
    this.skillService.deleteSkill(id).subscribe({
      next: () => {
        this.skills.update((list) => list.filter((s) => s.skillId !== id));
        this.resetForm();
        this.loadSkills();
        alert('Skill Deleted Successfully');
      },
      error: (err) => {
        console.error(err);
        alert('Failed to delete skill');
      }
    });
  }

}
