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
import { FormsModule } from '@angular/forms';

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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MemberDetailDropdownComponent,
  ],
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

  newCategoryName: string = '';
  categories: { id?: string; name: string; isDeleted?: boolean }[] = [];
  showCategoryError: boolean = false;

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
    });

    // Add default category if not in edit mode
    if (!this.isEditMode) {
      this.categories = [];
    }
  }

  get formControls() {
    return this.createBoardForm.controls;
  }

  addCategoryFromInput(): void {
    const trimmedName = this.newCategoryName?.trim();
    if (trimmedName && this.categories.length < 10) {
      // Check for duplicates
      const isDuplicate = this.categories.some(
        (cat) => cat.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (!isDuplicate) {
        this.categories.push({ name: trimmedName });
        this.newCategoryName = '';
        this.showCategoryError = false;
      }
    }
  }

  isCategoryisDuplicate(): boolean {
    const trimmedName = this.newCategoryName?.trim();
    let isDuplicate = false;
    if (trimmedName && this.categories.length < 10) {
      // Check for duplicates
      isDuplicate = this.categories.some(
        (cat) => cat.name.toLowerCase() === trimmedName.toLowerCase()
      );
    }

    return isDuplicate;
  }

  removeCategory(index: number): void {
    if (this.categories.length > 1) {
      this.categories.splice(index, 1);
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

      // Set categories from board data (filter out deleted ones)
      const validCategories =
        this.boardData.categories?.filter((cat: any) => !cat.isDeleted) || [];
      this.categories = validCategories.map((category: any) => ({
        id: category._id || category.id,
        name: category.name,
        isDeleted: false,
      }));

      // If no categories, ensure at least one empty category placeholder
      if (this.categories.length === 0) {
        this.categories = [];
      }

      // Set selected members
      if (this.boardData.members) {
        this.selectedMembers = this.boardData.members.filter(
          (member: any) => !member.isDeleted
        );
      }
    }
  }

  async onSubmit() {
    // Validate categories
    if (this.categories.length === 0) {
      this.showCategoryError = true;
      return;
    }

    if (this.createBoardForm.valid) {
      this.isSubmitting = true;

      // Prepare form data
      const formValue = this.createBoardForm.value;
      const members = this.selectedMembers.map((member) => member._id);

      let boardData: any = {
        name: formValue.name.trim(),
        description: formValue.description.trim(),
        members: members,
      };

      if (this.isEditMode && this.originalBoardId) {
        // For edit mode - separate existing and new categories
        boardData.boardId = this.originalBoardId;

        const existingCategoryIds = this.categories
          .filter((cat) => cat.id)
          .map((cat) => cat.id);

        const newCategoryNames = this.categories
          .filter((cat) => !cat.id)
          .map((cat) => cat.name);

        boardData.existingCategoryIds = existingCategoryIds;
        boardData.newCategoryNames = newCategoryNames;
      } else {
        // For create mode - send all as new categories
        boardData.categories = this.categories.map((cat) => cat.name);
      }

      console.log(
        this.isEditMode ? 'Update Board Data:' : 'Create Board Data:',
        boardData
      );

      // Call appropriate API method based on mode
      const response = this.isEditMode
        ? await this.taskService.UpdateBoard(boardData)
        : await this.taskService.createNewBoard(boardData);

      if (response) {
        this.isSubmitting = false;
        this.boardCreated.emit(boardData);
        this.resetForm();
      } else {
        this.isSubmitting = false;
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.createBoardForm.markAllAsTouched();
      console.log('Form is invalid');
    }
  }

  resetForm(): void {
    this.createBoardForm.reset();
    this.selectedMembers = [];
    this.categories = [];
    this.newCategoryName = '';
    this.showCategoryError = false;
    this.isEditMode = false;
    this.originalBoardId = null;

    // Re-initialize form
    this.initializeForm();
  }

  onCancel(): void {
    this.resetForm();
    this.closeModalEvent.emit();
  }
}
