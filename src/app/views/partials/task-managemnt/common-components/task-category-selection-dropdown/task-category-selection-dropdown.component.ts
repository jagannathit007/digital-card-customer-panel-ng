import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-task-category-selection-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './task-category-selection-dropdown.component.html',
  styleUrl: './task-category-selection-dropdown.component.scss',
})
export class TaskCategorySelectionDropdownComponent {
  @Output() onCategoryUpdated = new EventEmitter<any>();

  @Input() boardId: string | null = null;
  @Input() taskId: string | null = null;
  @Input() taskPermissions: boolean = true;

  categories: any[] = [];
  @Input() selectedCategory: string | null = null;

  constructor(
    private TaskService: TaskService,
    private storage: AppStorage,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    console.log('selectedCategory', this.selectedCategory);
  }

  async loadCategories(): Promise<void> {
    const boardDetails = await this.TaskService.getBoardDetails({
      boardId: this.boardId,
      type: 'board',
    });
    console.log('boardDetails', boardDetails);
    if (boardDetails) {
      const filteredCategories = boardDetails.board.categories.filter((cat:any) => !cat.isDeleted);
      if (!filteredCategories.some((cat:any) => cat._id === this.selectedCategory)) {
        this.selectedCategory = null;
      }
      this.categories = filteredCategories;
      this.cdr.detectChanges();
    }
  }

  async updateCategories(categoryId: string | null): Promise<void> {
    const categories = await this.TaskService.updateTeamTaskCategory({
      boardId: this.boardId,
      taskId: this.taskId,
      category:categoryId,
    });

    if (categories) {
      this.onCategoryUpdated.emit(categoryId);
    }
  }
}
