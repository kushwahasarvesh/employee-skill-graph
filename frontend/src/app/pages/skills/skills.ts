import { Component, OnInit, inject, signal } from '@angular/core';
import { SkillService } from '../../services/skill';
import { AlertService } from '../../services/alert';
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
  private alert = inject(AlertService);
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
        this.alert.error('Failed to load skills');
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
      this.alert.warning('Please fill all required fields');
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
          this.alert.update('Skill Updated Successfully');
        },
        error: (err) => {
          console.error(err);
          this.alert.error('Failed to update skill');
        }
      });
      return;
    }

    const alreadyExists = this.skills().some(
      (s) => s.skillId === skill.skillId
    );
    if (alreadyExists) {
      this.alert.warning('This Skill ID already exists');
      return;
    }

    this.skillService.addSkill(skill).subscribe({
      next: () => {
        this.skills.update((list) => [...list, { ...skill }]);
        this.resetForm();
        this.loadSkills();
        this.alert.success('Skill Added Successfully');
      },
      error: (err) => {
        console.error(err);
        this.alert.error('Failed to add skill');
      }
    });
  }

  editSkill(skill: Skill) {
    this.editMode = true;
    this.skillForm.patchValue(skill);
  }

  deleteSkill(skill: Skill) {
    this.alert.confirmDelete(skill.skillName, 'Do you want to delete this skill?').subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.skillService.deleteSkill(skill.skillId).subscribe({
        next: () => {
          this.skills.update((list) => list.filter((s) => s.skillId !== skill.skillId));
          this.resetForm();
          this.loadSkills();
          this.alert.deleted('Skill Deleted Successfully');
        },
        error: (err) => {
          console.error(err);
          this.alert.error('Failed to delete skill');
        }
      });
    });
  }

}
