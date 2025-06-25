import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  signal,
  computed,
} from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';
import { TaskService } from 'src/app/services/task.service';
import { DragDropService } from 'src/app/services/drag-drop.service';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';

export interface TeamMember {
  _id: string;
  name: string;
  emailId: string;
  role: string;
  profileImage: string;
}

export interface TaskCategory {
  _id: string;
  name: string;
  color: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  categories: TaskCategory[];
  assignedTo: TeamMember[];
  comments: number;
  attachments: number;
  position: number;
  dueDate?: Date;
  visibility: 'public' | 'private';
  column: string;
}

export interface BoardColumn {
  _id: string;
  title: string;
  position: number;
  tasks: Task[];
  canEdit: boolean;
  canDelete: boolean;
}

@Component({
  selector: 'app-teamtask',
  templateUrl: './teamtask.component.html',
  styleUrl: './teamtask.component.scss',
})
export class TeamtaskComponent implements OnInit, OnDestroy {
  baseURL = environment.baseURL;
  private destroy$ = new Subject<void>();

  // Reactive signals for state management
  boardColumns = signal<BoardColumn[]>([]);
  selectedTask = signal<Task | null>(null);
  draggedTask = signal<Task | null>(null);
  isDragging = signal<boolean>(false);

  // Column action states
  activeColumnMenu = signal<string | null>(null);
  editingColumnId = signal<string | null>(null);
  newColumnTitle = signal<string>('');

  // Loading state
  isLoading = signal<boolean>(true);

  // Computed properties
  editableColumns = computed(() =>
    this.boardColumns().filter((col) => col.canEdit)
  );

  newTaskInputColumnId = signal<string | null>(null);
  newTaskDraftTitle = signal<string>('');

  fixedColumns = computed(() =>
    this.boardColumns().filter((col) => !col.canEdit)
  );

  constructor(
    private storage: AppStorage,
    private cdr: ChangeDetectorRef,
    public modal: ModalService,
    private taskService: TaskService,
    private router: Router,
    private dragDropService: DragDropService
  ) {}

  async ngOnInit() {
    this.loadDummyData();
    this.loadData();
    this.setupKeyboardListeners();
    this.setupDragDropSubscription();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('keydown', this.handleKeydown);
  }

  private setupDragDropSubscription() {
    this.dragDropService.dragState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((dragState) => {
        if (dragState.isDragging) {
          this.isDragging.set(true);
          this.draggedTask.set(dragState.draggedItem);
        } else {
          this.isDragging.set(false);
          this.draggedTask.set(null);
        }
      });
  }

  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.clearSelection();
    }
  };

  private setupKeyboardListeners() {
    document.addEventListener('keydown', this.handleKeydown);
  }

  private loadDummyData() {
    // Dummy team members
    const dummyMembers: TeamMember[] = [
      {
        _id: '1',
        name: 'John Doe',
        emailId: 'john@example.com',
        role: 'Developer',
        profileImage:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      },
      {
        _id: '2',
        name: 'Jane Smith',
        emailId: 'jane@example.com',
        role: 'Designer',
        profileImage:
          'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=32&h=32&fit=crop&crop=face',
      },
      {
        _id: '3',
        name: 'Mike Johnson',
        emailId: 'mike@example.com',
        role: 'Manager',
        profileImage:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      },
      {
        _id: '4',
        name: 'Sarah Wilson',
        emailId: 'sarah@example.com',
        role: 'QA',
        profileImage:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      },
    ];

    // Dummy categories
    const dummyCategories: TaskCategory[] = [
      { _id: '1', name: 'Frontend', color: 'tw-bg-blue-100 tw-text-blue-800' },
      { _id: '2', name: 'Backend', color: 'tw-bg-green-100 tw-text-green-800' },
      {
        _id: '3',
        name: 'Design',
        color: 'tw-bg-purple-100 tw-text-purple-800',
      },
      { _id: '4', name: 'Bug', color: 'tw-bg-red-100 tw-text-red-800' },
      {
        _id: '5',
        name: 'Feature',
        color: 'tw-bg-yellow-100 tw-text-yellow-800',
      },
      {
        _id: '6',
        name: 'Testing',
        color: 'tw-bg-indigo-100 tw-text-indigo-800',
      },
    ];

    // Dummy tasks
    const dummyTasks: Task[] = [
      {
        _id: '1',
        title: 'Implement user authentication',
        description: 'Set up JWT authentication with login/logout',
        status: 'normal',
        categories: [dummyCategories[1], dummyCategories[4]],
        assignedTo: [dummyMembers[0], dummyMembers[2]],
        comments: 3,
        attachments: 1,
        position: 0,
        visibility: 'public',
        column: 'col1',
      },
      {
        _id: '2',
        title: 'Design landing page',
        description: 'Create wireframes and mockups for new landing page',
        status: 'in progress',
        categories: [dummyCategories[2], dummyCategories[4]],
        assignedTo: [dummyMembers[1]],
        comments: 5,
        attachments: 3,
        position: 0,
        visibility: 'public',
        column: 'col2',
      },
      {
        _id: '3',
        title: 'Fix navigation bug',
        description: 'Mobile navigation not working properly',
        status: 'normal',
        categories: [dummyCategories[0], dummyCategories[3]],
        assignedTo: [dummyMembers[0], dummyMembers[3]],
        comments: 2,
        attachments: 0,
        position: 1,
        visibility: 'public',
        column: 'col1',
      },
      {
        _id: '4',
        title: 'Setup CI/CD pipeline',
        description: 'Configure automated deployment',
        status: 'completed',
        categories: [dummyCategories[1]],
        assignedTo: [dummyMembers[2], dummyMembers[0]],
        comments: 8,
        attachments: 2,
        position: 0,
        visibility: 'public',
        column: 'col4',
      },
      {
        _id: '5',
        title: 'User testing session',
        description: 'Conduct usability testing with 10 users',
        status: 'doing',
        categories: [dummyCategories[5], dummyCategories[2]],
        assignedTo: [dummyMembers[1], dummyMembers[3]],
        comments: 1,
        attachments: 4,
        position: 0,
        visibility: 'public',
        column: 'col3',
      },
    ];

    // Initialize columns with tasks
    const columns: BoardColumn[] = [
      {
        _id: 'col1',
        title: 'Things To Do',
        position: 0,
        tasks: dummyTasks.filter((t) => t.column === 'col1'),
        canEdit: true,
        canDelete: true,
      },
      {
        _id: 'col2',
        title: 'In Progress',
        position: 1,
        tasks: dummyTasks.filter((t) => t.column === 'col2'),
        canEdit: true,
        canDelete: true,
      },
      {
        _id: 'col3',
        title: 'Doing',
        position: 2,
        tasks: dummyTasks.filter((t) => t.column === 'col3'),
        canEdit: true,
        canDelete: true,
      },
      {
        _id: 'col4',
        title: 'Completed',
        position: 3,
        tasks: dummyTasks.filter((t) => t.column === 'col4'),
        canEdit: false,
        canDelete: false,
      },
      {
        _id: 'col5',
        title: 'Deleted',
        position: 4,
        tasks: [],
        canEdit: false,
        canDelete: false,
      },
    ];

    // this.boardColumns.set(columns);
  }

  async loadData() {
    const boardDetails = await this.taskService.getBoardDetails({
      boardId: this.storage.get(teamMemberCommon.BOARD_DATA)?._id || '',
    });

    if (boardDetails) {
      console.log('Board details loaded:', boardDetails);
      this.boardColumns.set(boardDetails.columns);

      this.loadTasks();
    }
  }

  async loadTasks() {
    const boardId = this.storage.get(teamMemberCommon.BOARD_DATA)?._id || '';
    const tasks = await this.taskService.getBoardsAllTasks({ boardId });

    if (tasks) {
      console.log('Tasks loaded:', tasks);

      // Update board columns with tasks
      const columns = this.boardColumns();
      columns.forEach((column) => {
        column.tasks = tasks.filter((task: Task) => task.column === column._id);
      });
      this.boardColumns.set(columns);

      this.isLoading.set(false);
    }
  }

  // Drag and drop event handlers
  onDragStarted(task: Task) {
    this.isDragging.set(true);
    this.draggedTask.set(task);
    this.clearSelection(); // Clear selection when dragging starts
    this.dragDropService.startDrag(task, task.column);
  }

  onDragEnded() {
    setTimeout(() => {
      this.isDragging.set(false);
      this.draggedTask.set(null);
      this.dragDropService.endDrag();
    }, 100);
  }

  // Column operations
  onColumnDrop(event: CdkDragDrop<BoardColumn[]>) {
    if (event.previousIndex !== event.currentIndex) {
      const columns = [...this.boardColumns()];

      // Only allow reordering of editable columns (not completed/deleted)
      const editableColumns = columns.filter((col) => col.canEdit);
      const fixedColumns = columns.filter((col) => !col.canEdit);

      if (
        event.previousIndex < editableColumns.length &&
        event.currentIndex < editableColumns.length
      ) {
        moveItemInArray(
          editableColumns,
          event.previousIndex,
          event.currentIndex
        );

        // Update positions with animation support
        editableColumns.forEach((col, index) => {
          col.position = index;
        });

        // Recombine arrays
        const reorderedColumns = [...editableColumns, ...fixedColumns];
        this.boardColumns.set(reorderedColumns);

        // Trigger change detection for smooth animations
        this.cdr.detectChanges();

        this.updateColumnPositions(editableColumns);
      }
    }
  }

  // FIXED: Task drop handling for cross-column movement
  async onTaskDrop(event: CdkDragDrop<Task[]>, targetColumnId: string) {
    const columns = [...this.boardColumns()];
    const sourceColumnId = event.previousContainer.id;

    // Find source and target columns
    const sourceColumn = columns.find((col) => col._id === sourceColumnId);
    const targetColumn = columns.find((col) => col._id === targetColumnId);

    if (!sourceColumn || !targetColumn) return;

    // Update drag service with target info
    this.dragDropService.updateTarget(targetColumnId);

    // Prevent flickering by temporarily disabling selection
    this.clearSelection();

    if (sourceColumnId === targetColumnId) {
      // Reordering within same column
      const tasks = [...targetColumn.tasks];
      moveItemInArray(tasks, event.previousIndex, event.currentIndex);

      // Update positions
      tasks.forEach((task, index) => {
        task.position = index;
      });

      targetColumn.tasks = tasks;
    } else {
      // Moving between different columns
      const sourceData = [...sourceColumn.tasks];
      const targetData = [...targetColumn.tasks];

      // Transfer the item
      transferArrayItem(
        sourceData,
        targetData,
        event.previousIndex,
        event.currentIndex
      );

      // Update the moved task's properties
      const movedTask = targetData[event.currentIndex];
      if (movedTask) {
        movedTask.column = targetColumnId;
        this.updateTaskStatus(movedTask, targetColumn);
      }

      // Update both columns
      sourceColumn.tasks = sourceData;
      targetColumn.tasks = targetData;

      // Update positions for both columns
      sourceData.forEach((task, index) => {
        task.position = index;
      });

      targetData.forEach((task, index) => {
        task.position = index;
      });
    }

    // Update the signal to trigger reactivity
    this.boardColumns.set(columns);

    // Force change detection for smooth animations
    this.cdr.detectChanges();

    console.log('Task moved:', {
      taskId: event.container.data[event.currentIndex]?._id,
      sourceColumnId,
      targetColumnId,
      newPosition: event.currentIndex,
    });

    const updateInDatabase = await this.taskService.reorderBoardTasks({
      // boardId: this.storage.get(teamMemberCommon.BOARD_DATA)?._id || '',
      // sourceColumnId,
      toColumn: targetColumnId,
      taskId: event.container.data[event.currentIndex]?._id,
      toPosition: event.currentIndex,
    });

    console.log('Update in database:', updateInDatabase);

    if (!updateInDatabase) {
      // Fallback: undo the move of local
      if (sourceColumnId === targetColumnId) {
        console.log(
          'Revert reordering within same column',
          sourceColumnId,
          targetColumnId
        );
        // Revert reordering within same column
        moveItemInArray(
          targetColumn.tasks,
          event.currentIndex,
          event.previousIndex
        );
      } else {
        // Revert transfer between columns
        const revertedTask = targetColumn.tasks.splice(
          event.currentIndex,
          1
        )[0];
        sourceColumn.tasks.splice(event.previousIndex, 0, revertedTask);

        // undo status update to last when moving task between column
        this.updateTaskStatus(revertedTask, sourceColumn);
      }
    }
  }

  private updateTaskStatus(task: Task, column: BoardColumn) {
    switch (column.title.toLowerCase()) {
      case 'completed':
        task.status = 'completed';
        break;
      case 'deleted':
        task.status = 'deleted';
        break;
      case 'in progress':
        task.status = 'in progress';
        break;
      default:
        task.status = 'normal';
    }
  }

  private updateTaskPositions(columnId: string) {
    const column = this.boardColumns().find((col) => col._id === columnId);
    if (column) {
      column.tasks.forEach((task, index) => {
        task.position = index;
      });
    }
  }

  private updateColumnPositions(columns: BoardColumn[]) {
    console.log(
      'Column positions updated:',
      columns.map((col) => ({ id: col._id, position: col.position }))
    );
  }

  // Column menu operations
  toggleColumnMenu(columnId: string, event: Event) {
    event.stopPropagation();
    this.activeColumnMenu.set(
      this.activeColumnMenu() === columnId ? null : columnId
    );
  }

  closeColumnMenu() {
    this.activeColumnMenu.set(null);
  }

  startRenameColumn(columnId: string) {
    const column = this.boardColumns().find((col) => col._id === columnId);
    if (column && column.canEdit) {
      this.editingColumnId.set(columnId);
      this.newColumnTitle.set(column.title);
      this.closeColumnMenu();

      setTimeout(() => {
        const input = document.querySelector(
          `input[data-column-id="${columnId}"]`
        ) as HTMLInputElement;
        if (input) {
          input.focus();
          input.select();
        }
      }, 0);
    }
  }

  onColumnTitleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.newColumnTitle.set(target.value);
    }
  }

  async saveColumnRename(columnId: string) {
    const oldTitle = this.boardColumns().find(
      (col) => col._id === columnId
    )?.title;
    const title = this.newColumnTitle().trim();
    if (title) {
      const columns = [...this.boardColumns()];
      const columnIndex = columns.findIndex((col) => col._id === columnId);

      if (columnIndex !== -1) {
        columns[columnIndex].title = title;
        this.boardColumns.set(columns);

        const updateInDatabase = await this.taskService.RenameColumn({
          columnId,
          newTitle: title,
          boardId: this.storage.get(teamMemberCommon.BOARD_DATA)?._id || '',
        });

        if (!updateInDatabase) {
          columns[columnIndex].title = oldTitle || '';
          this.boardColumns.set(columns);
        } else {
          console.log('Update in database:', updateInDatabase);
        }
      }
    }

    this.editingColumnId.set(null);
    this.newColumnTitle.set('');
  }

  cancelColumnRename() {
    this.editingColumnId.set(null);
    this.newColumnTitle.set('');
  }

  deleteColumn(columnId: string) {
    const column = this.boardColumns().find((col) => col._id === columnId);
    if (column && column.canDelete && column.tasks.length === 0) {
      const columns = this.boardColumns().filter((col) => col._id !== columnId);
      this.boardColumns.set(columns);

      console.log('Column deleted:', columnId);
    } else if (column && column.tasks.length > 0) {
      alert('Please move all tasks from this column before deleting it.');
    }
    this.closeColumnMenu();
  }

  async addColumn(position: 'left' | 'right', referenceColumnId: string) {
    this.isLoading.set(false);

    const columns = [...this.boardColumns()];
    const refIndex = columns.findIndex((col) => col._id === referenceColumnId);

    const updateInDatabase = await this.taskService.AddNewColumn({
      boardId: this.storage.get(teamMemberCommon.BOARD_DATA)?._id || '',
      title: 'New Column',
      position: position === 'left' ? `${refIndex}` : `${refIndex + 1}`,
    })

    if(updateInDatabase) {
      console.log('Update in database:', updateInDatabase);

      console.log('Update in database:', updateInDatabase);

      // const newColumn = updateInDatabase.columns[updateInDatabase.columns.length - 1];
      // columns.splice(position === 'left' ? refIndex : refIndex + 1, 0, newColumn);
      // this.boardColumns.set(columns);

      // console.log('Column added:', { position, referenceColumnId, newColumn });
    }

    // const newColumn: BoardColumn = {
    //   _id: `col-${Date.now()}`,
    //   title: 'New Column',
    //   position: position === 'left' ? refIndex : refIndex + 1,
    //   tasks: [],
    //   canEdit: true,
    //   canDelete: true,
    // };

    // const insertIndex = position === 'left' ? refIndex : refIndex + 1;
    // columns.splice(insertIndex, 0, newColumn);

    // columns.forEach((col, index) => {
    //   col.position = index;
    // });

    // this.boardColumns.set(columns);
    // this.closeColumnMenu();

    // setTimeout(() => {
    //   this.startRenameColumn(newColumn._id);
    // }, 100);
    

  }

  // Task operations
  selectTask(task: Task, event: Event) {
    event.stopPropagation();
    if (!this.isDragging()) {
      this.selectedTask.set(task);
    }
  }

  clearSelection() {
    this.selectedTask.set(null);
  }

  completeTask(task: Task) {
    this.moveTaskToColumn(task, 'col4');
    this.clearSelection();
  }

  deleteTask(task: Task) {
    this.moveTaskToColumn(task, 'col5');
    this.clearSelection();
  }

  openTask(task: Task) {
    this.router.navigate(['/task', task._id]);
  }

  onTaskDoubleClick(task: Task) {
    this.router.navigate(['/task', task._id]);
  }

  private moveTaskToColumn(task: Task, targetColumnId: string) {
    const columns = [...this.boardColumns()];

    const sourceColumn = columns.find((col) => col._id === task.column);
    const targetColumn = columns.find((col) => col._id === targetColumnId);

    if (sourceColumn && targetColumn) {
      const taskIndex = sourceColumn.tasks.findIndex((t) => t._id === task._id);
      if (taskIndex !== -1) {
        sourceColumn.tasks.splice(taskIndex, 1);
      }

      task.column = targetColumnId;
      task.position = targetColumn.tasks.length;
      this.updateTaskStatus(task, targetColumn);
      targetColumn.tasks.push(task);

      this.boardColumns.set(columns);

      console.log('Task moved to column:', {
        taskId: task._id,
        targetColumnId,
      });
    }
  }

  // addNewTask(columnId: string) {
  //   const column = this.boardColumns().find(col => col._id === columnId);
  //   if (column) {
  //     const newTask: Task = {
  //       _id: `task-${Date.now()}`,
  //       title: 'New Task',
  //       description: '',
  //       status: column.title.toLowerCase() === 'completed' ? 'completed' :
  //              column.title.toLowerCase() === 'deleted' ? 'deleted' : 'normal',
  //       categories: [],
  //       assignedTo: [],
  //       comments: 0,
  //       attachments: 0,
  //       position: column.tasks.length,
  //       visibility: 'public',
  //       column: columnId
  //     };

  //     column.tasks.push(newTask);
  //     this.boardColumns.update(cols => [...cols]);

  //     console.log('New task created:', newTask);

  //     setTimeout(() => {
  //       this.router.navigate(['/task', newTask._id]);
  //     }, 100);
  //   }
  // }

  // Utility methods

  // ...existing code...
  showNewTaskInput(columnId: string) {
    // If switching columns, keep the draft title
    if (this.newTaskInputColumnId() !== columnId) {
      this.newTaskInputColumnId.set(columnId);
      // Focus will be handled in template with setTimeout
    } else {
      // If clicking again, just focus input
      this.newTaskInputColumnId.set(columnId);
    }
  }

  onNewTaskTitleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.newTaskDraftTitle.set(target.value);
  }

  async submitNewTask(columnId: string) {
    const title = this.newTaskDraftTitle().trim();
    if (!title) return;
    const column = this.boardColumns().find((col) => col._id === columnId);
    if (column) {
      const response = await this.taskService.AddTeamTask({
        title,
        status: 'normal',
        position: column.tasks.length,
        column: columnId,
        board: this.storage.get(teamMemberCommon.BOARD_DATA)?._id || '',
      });

      console.log('New task created:', response);

      if (response) {
        const newTask: Task = {
          _id: response._id,
          title: response.title,
          description: '',
          status: response.status,
          categories: [],
          assignedTo: [],
          comments: 0,
          attachments: 0,
          position: response.position,
          visibility: response.visibility,
          column: columnId,
        };
        column.tasks.push(newTask);
        this.boardColumns.update((cols) => [...cols]);
        this.newTaskInputColumnId.set(null);
        this.newTaskDraftTitle.set('');
        // setTimeout(() => {
        //   this.router.navigate(['/task', newTask._id]);
        // }, 100);
      }
    }
  }

  cancelNewTaskInput() {
    this.newTaskInputColumnId.set(null);
    // Keep draft title for possible transfer to another column
  }
  // ...existing code...

  getColumnById(columnId: string): BoardColumn | undefined {
    return this.boardColumns().find((col) => col._id === columnId);
  }

  canMoveToCompleted(task: Task): boolean {
    return task.column !== 'col4';
  }

  canMoveToDeleted(task: Task): boolean {
    return task.column !== 'col5';
  }

  canRestoreFromDeleted(task: Task): boolean {
    return task.column === 'col5';
  }

  // Click outside handler
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    if (!target.closest('.column-menu-container')) {
      this.closeColumnMenu();
    }

    if (!target.closest('.task-card') && !target.closest('.task-actions')) {
      this.clearSelection();
    }
  }

  // TrackBy functions for performance
  trackByColumnId(index: number, column: BoardColumn): string {
    return column._id;
  }

  trackByTaskId(index: number, task: Task): string {
    return task._id;
  }
}
