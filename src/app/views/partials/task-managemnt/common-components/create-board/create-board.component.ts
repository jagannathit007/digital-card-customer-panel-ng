import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  boardId?: string;
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
  @Input() boardData: any = null;
  isEditMode = false;
  originalBoardId: string | null = null;
  createBoardForm!: FormGroup;
  selectedMembers: TeamMember[] = [];
  isSubmitting = false;

  constructor(private fb: FormBuilder, private taskService: TaskService) {}

  ngOnInit(): void {
    this.initializeForm();

    if (this.boardData) {
      this.isEditMode = true;
      this.originalBoardId = this.boardData._id;
      this.populateFormForEdit();
    }
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

  private populateFormForEdit(): void {
    if (this.boardData) {
      // Populate basic fields
      this.createBoardForm.patchValue({
        name: this.boardData.name,
        description: this.boardData.description,
      });

      // Clear existing categories and add from board data
      while (this.categoriesArray.length > 0) {
        this.categoriesArray.removeAt(0);
      }

      // Add categories from board data (filter out deleted ones)
      const validCategories =
        this.boardData.categories?.filter((cat: any) => !cat.isDeleted) || [];
      validCategories.forEach((category: any) => {
        this.categoriesArray.push(
          this.fb.control(category.name, [
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(50),
          ])
        );
      });

      // If no categories, add one empty category
      if (this.categoriesArray.length === 0) {
        this.addCategory();
      }

      // Set selected members (you'll need to pass these to your member dropdown component)
      if (this.boardData.members) {
        this.selectedMembers = this.boardData.members.filter(
          (member: any) => !member.isDeleted
        );
      }
    }
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

      const boardData: any = {
        name: formValue.name.trim(),
        description: formValue.description.trim(),
        categories: categories,
        members: members,
      };

      // Add board ID if in edit mode
      if (this.isEditMode && this.originalBoardId) {
        boardData.boardId = this.originalBoardId;
      }

      console.log(
        this.isEditMode ? 'Update Board Data:' : 'Create Board Data:',
        boardData
      );
      console.log('Selected Members Details:', this.selectedMembers);

      // Call appropriate API method based on mode
      const response = this.isEditMode
        ? await this.taskService.UpdateBoard(boardData) // You'll need to implement this
        : await this.taskService.createNewBoard(boardData);

      if (response) {
        this.isSubmitting = false;
        this.boardCreated.emit(boardData);
        this.resetForm();
      }
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
  this.isEditMode = false;
  this.originalBoardId = null;

  // Reset categories array
  while (this.categoriesArray.length > 0) {
    this.categoriesArray.removeAt(0);
  }

  // Re-initialize form
  this.initializeForm();
}

  onCancel(): void {
    this.resetForm();
    this.closeModalEvent.emit();
  }
}
