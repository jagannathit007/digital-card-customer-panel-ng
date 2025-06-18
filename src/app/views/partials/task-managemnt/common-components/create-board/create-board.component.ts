import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { environment } from 'src/env/env.local';
import { MemberDetailDropdownComponent } from '../add-members-dropdown/add-members-dropdown.component';
import { TaskService } from 'src/app/services/task.service';

interface TeamMember {
  _id: string;
  name: string;
  profileImage?: string;
  role: string;
  id?: string;
}

interface CreateBoardData {
  name: string;
  description: string;
  categories: string[];
  members: string[];
}

@Component({
  selector: 'app-create-board',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MemberDetailDropdownComponent],
  templateUrl: './create-board.component.html',
  styleUrl: './create-board.component.scss',
})
export class CreateBoardComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() boardCreated = new EventEmitter<CreateBoardData>();
  createBoardForm!: FormGroup;
  selectedMembers: TeamMember[] = [];
  isSubmitting = false;

  constructor(private fb: FormBuilder, private taskService: TaskService) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.createBoardForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      description: ['', [Validators.maxLength(500)]],
      categories: this.fb.array([]),
    });

    // Add default category
    this.addCategory();
  }

  get categoriesArray(): FormArray {
    return this.createBoardForm.get('categories') as FormArray;
  }

  get formControls() {
    return this.createBoardForm.controls;
  }

  addCategory(): void {
    if (this.categoriesArray.length < 10) {
      this.categoriesArray.push(
        this.fb.control('', [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ])
      );
    }
  }

  removeCategory(index: number): void {
    if (this.categoriesArray.length > 1) {
      this.categoriesArray.removeAt(index);
    }
  }

  onMembersSelected(members: TeamMember[]): void {
    this.selectedMembers = members;
  }

  onMemberAdded(members: TeamMember[]): void {
    this.selectedMembers = members;
  }

  getImageUrl(url: string): string {
    return `${environment.imageURL}${url}`;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.createBoardForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isCategoryInvalid(index: number): boolean {
    const category = this.categoriesArray.at(index);
    return !!(
      category &&
      category.invalid &&
      (category.dirty || category.touched)
    );
  }

  getFieldError(fieldName: string): string {
    const field = this.createBoardForm.get(fieldName);
    if (field?.errors && (field.dirty || field.touched)) {
      if (field.errors['required'])
        return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['minlength'])
        return `${this.getFieldLabel(fieldName)} must be at least ${
          field.errors['minlength'].requiredLength
        } characters`;
      if (field.errors['maxlength'])
        return `${this.getFieldLabel(fieldName)} must not exceed ${
          field.errors['maxlength'].requiredLength
        } characters`;
    }
    return '';
  }

  getCategoryError(index: number): string {
    const category = this.categoriesArray.at(index);
    if (category?.errors && (category.dirty || category.touched)) {
      if (category.errors['required']) return 'Category name is required';
      if (category.errors['minlength'])
        return 'Category name must be at least 1 character';
      if (category.errors['maxlength'])
        return 'Category name must not exceed 50 characters';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Board name',
      description: 'Description',
    };
    return labels[fieldName] || fieldName;
  }

  async onSubmit() {
    if (this.createBoardForm.valid) {
      this.isSubmitting = true;

      // Prepare form data
      const formValue = this.createBoardForm.value;
      const categories = formValue.categories.filter(
        (cat: string) => cat.trim() !== ''
      );
      const members = this.selectedMembers.map((member) => member._id);

      const boardData: CreateBoardData = {
        name: formValue.name.trim(),
        description: formValue.description.trim(),
        categories: categories,
        members: members,
      };

      // Log the data instead of calling API
      console.log('Create Board Data:', boardData);
      console.log('Selected Members Details:', this.selectedMembers);

      const response = await this.taskService.createNewBoard(boardData);

      if(response){
        this.isSubmitting = false;

        this.boardCreated.emit(boardData);
        this.resetForm();
      }

      // Simulate API call delay
      // setTimeout(() => {
      //   this.isSubmitting = false;

      //   this.boardCreated.emit(boardData);
      //   this.resetForm();
      // }, 1500);
    } else {
      // Mark all fields as touched to show validation errors
      this.createBoardForm.markAllAsTouched();
      this.categoriesArray.controls.forEach((control) =>
        control.markAsTouched()
      );
      console.log('Form is invalid');
    }
  }

  resetForm(): void {
    this.createBoardForm.reset();
    this.selectedMembers = [];

    // Reset categories array
    while (this.categoriesArray.length > 1) {
      this.categoriesArray.removeAt(1);
    }

    // Re-initialize form
    this.initializeForm();
  }

  onCancel(): void {
    this.resetForm();
    this.closeModalEvent.emit();
  }
}
