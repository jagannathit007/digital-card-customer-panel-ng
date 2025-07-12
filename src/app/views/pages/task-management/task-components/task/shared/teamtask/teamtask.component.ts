import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  signal,
  computed,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';
import { TaskService } from 'src/app/services/task.service';
import { DragDropService } from 'src/app/services/drag-drop.service';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
import { TaskPermissionsService } from './../../../../../../../services/task-permissions.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeamTaskEventService } from 'src/app/services/teamTaskEvent.service';

interface TaskUpdate {
  field: string;
  value: any;
  taskId: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  emailId: string;
  role: string;
  profileImage: string;
  isDeleted: boolean;
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
  createdBy: string;
  completedAt?: Date | null;
  deletedAt?: Date | null;
  assignedToMe: boolean;
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
  // ! Kanban View Auto Scrolling Properties
  @ViewChild('kanbanContainer') kanbanContainer!: ElementRef<HTMLDivElement>;
  private autoScrollInterval: any = null;
  private autoScrollSpeed: number = 15;
  private isDragActive = false;
  // ! Kanban View Auto Scrolling Properties

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
  boardId = signal<string>('');
  completedColumnId = signal<string>('');
  deletedColumnId = signal<string>('');

  showColumnNamePopup = signal<boolean>(false);
  popupMode = signal<'add' | 'rename'>('add');
  positionForNewColumn: 'left' | 'right' = 'right';
  currentColumnId = signal<string | null>(null);
  isAssignmentFilterActive = signal<boolean>(
    !!this.storage.get(teamMemberCommon.ASSIGNMENT_FILTER) || false
  );

  // available user for selected board
  availableUsersForSelectedBoard = signal<TeamMember[]>([]);

  columnForm!: FormGroup;
  showCreatePopup = signal<boolean>(false);

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

  // In your component class
  @ViewChild(CdkDrag) drag!: CdkDrag;

  ngAfterViewInit() {
    if (this.drag) {
      this.setupDragPreview();
    }
    console.log('📋 ViewChild check:', this.kanbanContainer);
    if (this.kanbanContainer) {
      console.log('✅ Container found:', this.kanbanContainer.nativeElement);
    }
  }

  // ! Curently Comennt for testing
  private setupDragPreview() {
    document.addEventListener('cdkDragStarted', (event: any) => {
      if (event.detail.source._dragRef instanceof CdkDrag) {
        setTimeout(() => {
          const preview = document.querySelector(
            '.cdk-drag-preview'
          ) as HTMLElement;
          if (preview) {
            preview.style.width = '20rem';
            preview.style.opacity = '0.9';
            preview.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.2)';
          }
        });
      }
    });
  }

  private setupCustomPreview() {
    // Delay slightly to ensure preview element exists
    setTimeout(() => {
      const preview = document.querySelector(
        '.cdk-drag-preview'
      ) as HTMLElement;
      if (preview) {
        // Make preview match column width
        preview.style.width = '20rem'; // matches your tw-w-80 (80 * 0.25rem = 20rem)
        preview.style.opacity = '0.9';
        preview.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.2)';
      }
    });
  }

  constructor(
    private storage: AppStorage,
    private cdr: ChangeDetectorRef,
    public modal: ModalService,
    private taskService: TaskService,
    public taskPermissionsService: TaskPermissionsService,
    private router: Router,
    private route: ActivatedRoute,
    private dragDropService: DragDropService,
    private fb: FormBuilder,
    private teamTaskEventService: TeamTaskEventService
  ) {}

  async ngOnInit() {
    this.boardId.set(this.storage.get(teamMemberCommon.BOARD_DATA)?._id || '');
    this.columnForm = this.fb.group({
      columnName: [
        '',
        [Validators.required, this.uniqueColumnNameValidator.bind(this)],
      ],
    });
    // this.loadDummyData();
    this.loadData();
    this.setupKeyboardListeners();
    this.setupDragDropSubscription();
    this.setupTaskUpdateSubscription();
  }

  private setupTaskUpdateSubscription() {
    this.teamTaskEventService.taskUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((taskUpdate: TaskUpdate) => {
        this.handleTaskUpdate(taskUpdate);
      });
  }

  private handleTaskUpdate(taskUpdate: TaskUpdate) {
    const { taskId, field, value } = taskUpdate;

    console.log(taskUpdate);
    const columns = [...this.boardColumns()];
    let updatedTask: Task | undefined;

    // Find the task in any column
    for (const column of columns) {
      updatedTask = column.tasks.find((task) => task._id === taskId);
      if (updatedTask) {
        // Update the specific field
        if (field === 'status') {
          updatedTask.status = value;
          updatedTask.completedAt = value === 'completed' ? new Date() : null;
          updatedTask.deletedAt = value === 'deleted' ? new Date() : null;

          if (value === 'completed') {
            // removing from current column and adding in completed column
            const currentColumn = columns.find((col) => col._id === column._id);
            if (currentColumn) {
              currentColumn.tasks = currentColumn.tasks.filter(
                (task) => task._id !== taskId
              );
            }
            const completedColumn = columns.find(
              (col) => col.title.trim().toLowerCase() === 'completed'
            );
            if (completedColumn) {
              completedColumn.tasks.unshift(updatedTask);
            }
          } else if (value === 'deleted') {
            // removing from current column and adding in deleted column
            const currentColumn = columns.find((col) => col._id === column._id);
            if (currentColumn) {
              currentColumn.tasks = currentColumn.tasks.filter(
                (task) => task._id !== taskId
              );
            }
            const deletedColumn = columns.find(
              (col) => col.title.trim().toLowerCase() === 'deleted'
            );
            if (deletedColumn) {
              deletedColumn.tasks.unshift(updatedTask);
            }
          }
          break;
        } else if (field === 'assignedTo') {
          updatedTask.assignedTo = value;

          const isStillMember = updatedTask.assignedTo.some(
            (member: any) =>
              member._id === this.taskPermissionsService.getCurrentUser()?._id
          );

          updatedTask.assignedToMe = isStillMember;
          break;
        } else {
          (updatedTask as any)[field] = value;
          break;
        }
      }
    }

    if (updatedTask) {
      // Update the boardColumns signal to trigger reactivity
      this.boardColumns.set(columns);
      this.cdr.detectChanges(); // Ensure UI updates
    } else {
      console.warn(`Task ${taskId} not found in board columns`);
    }
  }

  // Add this custom validator
  private uniqueColumnNameValidator(control: any) {
    const value = control.value?.trim();
    if (!value) return null;

    const currentColumnId = this.currentColumnId();
    const existingColumns = this.boardColumns();

    // For rename operation, exclude the current column from validation
    const isDuplicate = existingColumns.some((column) => {
      const sameTitle = column.title.toLowerCase() === value.toLowerCase();

      if (this.popupMode() === 'rename') {
        // Exclude the current column being renamed
        return sameTitle && column._id !== currentColumnId;
      }

      return sameTitle;
    });

    return isDuplicate ? { duplicateName: true } : null;
  }

  ngOnDestroy() {
    // this.destroy$.next();
    // this.destroy$.complete();
    // document.removeEventListener('keydown', this.handleKeydown);
    this.clearAutoScroll();
    this.isDragActive = false;
    document.removeEventListener('mousemove', this.trackMouseDuringDrag);
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

  // private loadDummyData() {
  //   // Dummy team members
  //   const dummyMembers: TeamMember[] = [
  //     {
  //       _id: '1',
  //       name: 'John Doe',
  //       emailId: 'john@example.com',
  //       role: 'Developer',
  //       profileImage:
  //         'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
  //     },
  //     {
  //       _id: '2',
  //       name: 'Jane Smith',
  //       emailId: 'jane@example.com',
  //       role: 'Designer',
  //       profileImage:
  //         'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=32&h=32&fit=crop&crop=face',
  //     },
  //     {
  //       _id: '3',
  //       name: 'Mike Johnson',
  //       emailId: 'mike@example.com',
  //       role: 'Manager',
  //       profileImage:
  //         'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
  //     },
  //     {
  //       _id: '4',
  //       name: 'Sarah Wilson',
  //       emailId: 'sarah@example.com',
  //       role: 'QA',
  //       profileImage:
  //         'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
  //     },
  //   ];

  //   // Dummy categories
  //   const dummyCategories: TaskCategory[] = [
  //     { _id: '1', name: 'Frontend', color: 'tw-bg-blue-100 tw-text-blue-800' },
  //     { _id: '2', name: 'Backend', color: 'tw-bg-green-100 tw-text-green-800' },
  //     {
  //       _id: '3',
  //       name: 'Design',
  //       color: 'tw-bg-purple-100 tw-text-purple-800',
  //     },
  //     { _id: '4', name: 'Bug', color: 'tw-bg-red-100 tw-text-red-800' },
  //     {
  //       _id: '5',
  //       name: 'Feature',
  //       color: 'tw-bg-yellow-100 tw-text-yellow-800',
  //     },
  //     {
  //       _id: '6',
  //       name: 'Testing',
  //       color: 'tw-bg-indigo-100 tw-text-indigo-800',
  //     },
  //   ];

  //   // Dummy tasks
  //   const dummyTasks: Task[] = [
  //     {
  //       _id: '1',
  //       title: 'Implement user authentication',
  //       description: 'Set up JWT authentication with login/logout',
  //       status: 'normal',
  //       categories: [dummyCategories[1], dummyCategories[4]],
  //       assignedTo: [dummyMembers[0], dummyMembers[2]],
  //       comments: 3,
  //       attachments: 1,
  //       position: 0,
  //       visibility: 'public',
  //       column: 'col1',
  //     },
  //     {
  //       _id: '2',
  //       title: 'Design landing page',
  //       description: 'Create wireframes and mockups for new landing page',
  //       status: 'in progress',
  //       categories: [dummyCategories[2], dummyCategories[4]],
  //       assignedTo: [dummyMembers[1]],
  //       comments: 5,
  //       attachments: 3,
  //       position: 0,
  //       visibility: 'public',
  //       column: 'col2',
  //     },
  //     {
  //       _id: '3',
  //       title: 'Fix navigation bug',
  //       description: 'Mobile navigation not working properly',
  //       status: 'normal',
  //       categories: [dummyCategories[0], dummyCategories[3]],
  //       assignedTo: [dummyMembers[0], dummyMembers[3]],
  //       comments: 2,
  //       attachments: 0,
  //       position: 1,
  //       visibility: 'public',
  //       column: 'col1',
  //     },
  //     {
  //       _id: '4',
  //       title: 'Setup CI/CD pipeline',
  //       description: 'Configure automated deployment',
  //       status: 'completed',
  //       categories: [dummyCategories[1]],
  //       assignedTo: [dummyMembers[2], dummyMembers[0]],
  //       comments: 8,
  //       attachments: 2,
  //       position: 0,
  //       visibility: 'public',
  //       column: 'col4',
  //     },
  //     {
  //       _id: '5',
  //       title: 'User testing session',
  //       description: 'Conduct usability testing with 10 users',
  //       status: 'doing',
  //       categories: [dummyCategories[5], dummyCategories[2]],
  //       assignedTo: [dummyMembers[1], dummyMembers[3]],
  //       comments: 1,
  //       attachments: 4,
  //       position: 0,
  //       visibility: 'public',
  //       column: 'col3',
  //     },
  //   ];

  //   // Initialize columns with tasks
  //   const columns: BoardColumn[] = [
  //     {
  //       _id: 'col1',
  //       title: 'Things To Do',
  //       position: 0,
  //       tasks: dummyTasks.filter((t) => t.column === 'col1'),
  //       canEdit: true,
  //       canDelete: true,
  //     },
  //     {
  //       _id: 'col2',
  //       title: 'In Progress',
  //       position: 1,
  //       tasks: dummyTasks.filter((t) => t.column === 'col2'),
  //       canEdit: true,
  //       canDelete: true,
  //     },
  //     {
  //       _id: 'col3',
  //       title: 'Doing',
  //       position: 2,
  //       tasks: dummyTasks.filter((t) => t.column === 'col3'),
  //       canEdit: true,
  //       canDelete: true,
  //     },
  //     {
  //       _id: 'col4',
  //       title: 'Completed',
  //       position: 3,
  //       tasks: dummyTasks.filter((t) => t.column === 'col4'),
  //       canEdit: false,
  //       canDelete: false,
  //     },
  //     {
  //       _id: 'col5',
  //       title: 'Deleted',
  //       position: 4,
  //       tasks: [],
  //       canEdit: false,
  //       canDelete: false,
  //     },
  //   ];

  //   // this.boardColumns.set(columns);
  // }

  async loadData() {
    if (!this.boardId()) {
      this.isLoading.set(false);
      return;
    }

    const boardDetails = await this.taskService.getBoardDetails({
      boardId: this.boardId(),
      type: 'board',
    });

    if (boardDetails) {
      this.boardColumns.set(boardDetails.columns);

      this.completedColumnId.set(
        boardDetails.columns.find(
          (col: any) => col.title.toLowerCase() === 'completed'
        )?._id
      );
      this.deletedColumnId.set(
        boardDetails.columns.find(
          (col: any) => col.title.toLowerCase() === 'deleted'
        )?._id
      );

      const availableUsers = await this.loadAvailableUsers();

      if (availableUsers) {
        this.loadTasks();
      }
    } else {
      this.isLoading.set(false);
    }
  }

  async loadAvailableUsers(): Promise<boolean> {
    const users = await this.taskService.GetAllAvailableMembersForBoard({
      boardId: this.boardId(),
    });
    if (users) {
      this.availableUsersForSelectedBoard.set(users);
      return true;
    } else {
      return false;
    }
  }

  async loadTasks() {
    const boardId = this.boardId();
    const tasks = await this.taskService.getBoardsAllTasks({ boardId });

    if (tasks) {
      // Update board columns with tasks
      const columns = this.boardColumns();
      columns.forEach((column) => {
        column.tasks = tasks.filter((task: Task) => task.column === column._id);
      });
      this.boardColumns.set(columns);
    }
    this.isLoading.set(false);
  }

  private focusElement(selector: string, selectText = false) {
    setTimeout(() => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        element.focus();
        if (selectText && element instanceof HTMLInputElement) {
          element.select();
        }
      }
    });
  }

  openAddTeamTaskModal() {
    this.showCreatePopup.set(true);
  }

  onPopupClosed() {
    this.showCreatePopup.set(false);
  }

  onTaskCreated(task: any) {
    console.log(task);
    this.showCreatePopup.set(false);

    this.boardColumns.update((columns) => {
      const column = columns.find((col) => col._id === task.column);
      if (column) {
        column.tasks.push(task);
      }
      return columns;
    });
  }

  // Drag and drop event handlers
  onDragStarted(task: Task) {
    this.isDragActive = true;

    this.isDragging.set(true);
    this.draggedTask.set(task);
    this.clearSelection();
    this.dragDropService.startDrag(task, task.column, 'task');

    if (this.kanbanContainer) {
      this.kanbanContainer.nativeElement.classList.add('dragging');
    }

    // Add mouse tracking listener
    document.addEventListener('mousemove', this.trackMouseDuringDrag);
  }

  // For columns, you might need to add:
  onColumnDragStarted(column: any) {
    this.dragDropService.startDrag(column, column._id, 'column');
  }

  onDragEnded() {
    // setTimeout(() => {
    //   this.isDragging.set(false);
    //   this.draggedTask.set(null);
    //   this.dragDropService.endDrag();
    // }, 100);

    this.isDragActive = false;

    setTimeout(() => {
      this.isDragging.set(false);
      this.draggedTask.set(null);
      this.dragDropService.endDrag();

      if (this.kanbanContainer) {
        this.kanbanContainer.nativeElement.classList.remove('dragging');
      }

      // Remove mouse tracking listener
      document.removeEventListener('mousemove', this.trackMouseDuringDrag);

      this.clearAutoScroll();
    }, 100);
  }

  // old code before improving chat gpt without fallback

  // async onColumnDrop(event: CdkDragDrop<BoardColumn[]>) {
  //   if (event.previousIndex !== event.currentIndex) {
  //     const columns = [...this.boardColumns()];

  //     console.log(event.previousIndex, event.currentIndex);

  //     // Only allow reordering of editable columns (not completed/deleted)
  //     const editableColumns = columns.filter((col) => col.canEdit);
  //     const fixedColumns = columns.filter((col) => !col.canEdit);

  //     if (
  //       event.previousIndex < editableColumns.length &&
  //       event.currentIndex < editableColumns.length
  //     ) {
  //       moveItemInArray(
  //         editableColumns,
  //         event.previousIndex,
  //         event.currentIndex
  //       );

  //       // Update positions with animation support
  //       editableColumns.forEach((col, index) => {
  //         col.position = index;
  //       });

  //       // Recombine arrays
  //       const reorderedColumns = [...editableColumns, ...fixedColumns];
  //       this.boardColumns.set(reorderedColumns);

  //       // Trigger change detection for smooth animations
  //       this.cdr.detectChanges();

  //       this.updateColumnPositions(editableColumns);

  //       console.log(
  //         'targetColumnId : ',
  //         event.container.data[event.currentIndex]?._id
  //       );

  //       const updateInDatabase = await this.taskService.ReorderColumn({
  //         boardId: this.boardId(),
  //         columnId: event.container.data[event.currentIndex]?._id,
  //         newPosition: event.currentIndex,
  //       });

  //       if (!updateInDatabase) {
  //         // Fallback: undo the move of local
  //       }
  //     }
  //   }
  // }

  // old code after improving chat gpt without fallback

  // Column operations
  async onColumnDrop(event: CdkDragDrop<BoardColumn[]>) {
    if (event.previousIndex === event.currentIndex) return;

    const originalColumns = [...this.boardColumns()];
    const editableColumns = originalColumns.filter((col) => col.canEdit);
    const fixedColumns = originalColumns.filter((col) => !col.canEdit);

    // Safe check: drag happens within editable zone
    if (
      event.previousIndex < editableColumns.length &&
      event.currentIndex < editableColumns.length
    ) {
      // Clone editable for manipulation
      const newEditableColumns = [...editableColumns];
      moveItemInArray(
        newEditableColumns,
        event.previousIndex,
        event.currentIndex
      );

      // Update positions
      newEditableColumns.forEach((col, index) => (col.position = index));

      // Merge editable + fixed columns, sorted by position
      const newColumnList = [...newEditableColumns, ...fixedColumns].sort(
        (a, b) => a.position - b.position
      );
      const previousColumnState = [...originalColumns]; // backup for rollback

      this.boardColumns.set(newColumnList);
      this.cdr.detectChanges(); // for smooth animation

      const movedColumn = newEditableColumns[event.currentIndex];
      try {
        const success = await this.taskService.ReorderColumn({
          boardId: this.boardId(),
          columnId: movedColumn._id,
          newPosition: movedColumn.position,
        });

        if (!success) {
          this.boardColumns.set(previousColumnState);
          console.warn('Failed to reorder columns on backend. Reverting...');
        }
      } catch (err) {
        this.boardColumns.set(previousColumnState);
        console.error('Error reordering column:', err);
      }
    }
  }

  // FIXED: Task drop handling for cross-column movement
  async onTaskDrop(event: CdkDragDrop<Task[]>, targetColumnId: string) {
    // Immediately clear auto scroll
    this.isDragActive = false;
    this.clearAutoScroll();

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
        this.updateTaskStatus(movedTask, targetColumn, sourceColumn);
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

    if (
      sourceColumnId !== targetColumnId ||
      (sourceColumnId === targetColumnId &&
        event.previousIndex !== event.currentIndex)
    ) {
      const updateInDatabase = await this.taskService.reorderBoardTasks({
        // boardId: this.boardId(),
        // sourceColumnId,
        toColumn: targetColumnId,
        taskId: event.container.data[event.currentIndex]?._id,
        toPosition: event.currentIndex,
      });

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
          this.updateTaskStatus(revertedTask, sourceColumn, targetColumn);
        }
      }
    }
  }

  private updateTaskStatus(task: Task, column: BoardColumn, sourceColumn: BoardColumn) {
    if (!['completed', 'deleted'].includes(column.title.toLowerCase()) && !['completed', 'deleted'].includes(sourceColumn.title.toLowerCase())) return;
    switch (column.title.toLowerCase()) {
      case 'completed':
        task.status = 'completed';
        task.completedAt = new Date();
        task.deletedAt = null;
        break;
      case 'deleted':
        task.status = 'deleted';
        task.deletedAt = new Date();
        task.completedAt = null;
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
      this.columnForm.patchValue({
        columnName: column.title,
      });
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
    console.log(target.value);
    if (target) {
      this.newColumnTitle.set(target.value);
    }
  }

  async saveColumnRename(columnId: string, title: string) {
    const oldTitle = this.boardColumns().find(
      (col) => col._id === columnId
    )?.title;

    if (title) {
      const columns = [...this.boardColumns()];
      const columnIndex = columns.findIndex((col) => col._id === columnId);

      if (columnIndex !== -1) {
        columns[columnIndex].title = title;
        this.boardColumns.set(columns);

        const updateInDatabase = await this.taskService.RenameColumn({
          columnId,
          newTitle: title,
          boardId: this.boardId(),
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
  }

  cancelColumnRename() {
    this.editingColumnId.set(null);
    this.newColumnTitle.set('');
  }

  async deleteColumn(columnId: string) {
    const boardDetails = this.boardColumns().find((col) => col._id == columnId);
    console.log('boardDetails : ', boardDetails);
    this.closeColumnMenu();
    swalHelper
      .confirmation(
        `Delete "${boardDetails?.title}" Board`,
        `Are you sure you want to this BOARD ?`,
        'question'
      )
      .then(async (result) => {
        if (result.isConfirmed) {
          this.isLoading.set(true);

          const column = this.boardColumns().find(
            (col) => col._id === columnId
          );
          if (column && column.canDelete && column.tasks.length === 0) {
            const response = await this.taskService.DeleteColumn({
              columnId: columnId,
              boardId: this.boardId(),
            });

            if (response) {
              const columns = this.boardColumns().filter(
                (col) => col._id !== columnId
              );
              this.boardColumns.set(columns);

              console.log('Column deleted:', columnId);
            }
          } else if (column && column.tasks.length > 0) {
            alert('Please move all tasks from this column before deleting it.');
          }
          this.isLoading.set(false);
        }
      });
  }

  openAddColumnPopup(position: 'left' | 'right', referenceColumnId: string) {
    this.closeColumnMenu();
    this.popupMode.set('add');
    this.currentColumnId.set(referenceColumnId);
    this.columnForm.reset();
    this.showColumnNamePopup.set(true);
    this.positionForNewColumn = position;

    this.focusElement('#columnNameInput');
  }

  // For renaming column
  openRenameColumnPopup(columnId: string) {
    const column = this.boardColumns().find((col) => col._id === columnId);
    if (column) {
      this.closeColumnMenu();
      this.popupMode.set('rename');
      this.currentColumnId.set(columnId);
      this.columnForm.patchValue({
        columnName: column.title,
      });
      this.showColumnNamePopup.set(true);

      this.focusElement('#columnNameInput', true);
    }
  }

  closeColumnNamePopup() {
    this.showColumnNamePopup.set(false);
    this.currentColumnId.set(null);
    this.columnForm.reset();
  }

  async handleColumnNameSubmit() {
    if (this.columnForm.invalid) return;

    const columnName = this.columnForm.get('columnName')?.value.trim();

    if (this.popupMode() === 'rename' && this.currentColumnId()) {
      await this.saveColumnRename(this.currentColumnId()!, columnName);
    } else if (this.popupMode() === 'add' && this.currentColumnId()) {
      await this.addColumn(
        this.positionForNewColumn,
        this.currentColumnId()!,
        columnName
      );
    }
    this.closeColumnNamePopup();
  }

  async addColumn(
    position: 'left' | 'right',
    referenceColumnId: string,
    title: string
  ) {
    this.isLoading.set(true);

    const columns = [...this.boardColumns()];
    const refIndex = columns.findIndex((col) => col._id === referenceColumnId);

    const response = await this.taskService.AddNewColumn({
      boardId: this.boardId(),
      title: title,
      position: position === 'left' ? `${refIndex}` : `${refIndex + 1}`,
    });

    if (response) {
      columns.splice(response.position, 0, response);
      this.boardColumns.set(columns);
      console.log('Column added:', { position, referenceColumnId, response });
    }

    this.isLoading.set(false);
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

  async completeTask(task: Task) {
    if (this.completedColumnId()) {
      this.moveTaskToColumn(task, this.completedColumnId());
      this.clearSelection();
    }
  }
  deleteTask(task: Task) {
    if (this.deletedColumnId()) {
      this.moveTaskToColumn(task, this.deletedColumnId());
      this.clearSelection();
    }
  }

  openTask(task: Task) {
    this.router.navigate(['detail', task._id], { relativeTo: this.route });
  }

  onTaskDoubleClick(task: Task) {
    this.router.navigate(['detail', task._id], { relativeTo: this.route });
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
      this.updateTaskStatus(task, targetColumn, sourceColumn);
      targetColumn.tasks.unshift(task);
      this.boardColumns.set(columns);

      const updateInDatabase = this.taskService.reorderBoardTasks({
        toColumn: targetColumnId,
        taskId: task._id,
        toPosition: 0,
      });
      if (!updateInDatabase) {
        // Fallback: undo the move of local
        targetColumn.tasks.shift();
        task.column = sourceColumn._id;
        sourceColumn.tasks.push(task);
        this.boardColumns.set(columns);
        console.error(
          'Failed to update task in database, reverted changes locally.'
        );
      } else {
        console.log('Task moved to column:', {
          taskId: task._id,
          targetColumnId,
        });
      }
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

      this.focusElement(`input[data-new-task-input="${columnId}"]`);
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
        board: this.boardId(),
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
          createdBy: response.createdBy,
          assignedToMe: response.assignedToMe,
        };
        column.tasks.push(newTask);
        this.boardColumns.update((cols) => [...cols]);
        this.newTaskInputColumnId.set(null);
        this.newTaskDraftTitle.set('');

        // Scroll to the newly added task
        this.scrollToBottom(columnId);
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

  private scrollToBottom(columnId: string) {
    setTimeout(() => {
      const container = document.querySelector(
        `[id="${columnId}"]`
      ) as HTMLElement;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 100); // Small delay to ensure the task is rendered
  }

  //  ! Kanban View Autoscrolling all The methods
  private setupDragEventListeners() {
    // Use CDK drag events instead of manual mouse events
    document.addEventListener('dragover', this.handleCdkDragOver.bind(this), {
      passive: false,
    });
    document.addEventListener('dragend', this.handleCdkDragEnd.bind(this));
  }

  private handleCdkDragOver = (event: DragEvent) => {
    if (!this.isDragActive) return;

    console.log('🖱️ CDK Drag over event:', {
      x: event.clientX,
      y: event.clientY,
      isDragActive: this.isDragActive,
    });

    this.handleAutoScrollWithDragEvent(event);
  };

  private handleCdkDragEnd = (event: DragEvent) => {
    this.isDragActive = false;
    this.clearAutoScroll();
  };

  private handleAutoScrollWithDragEvent(event: DragEvent): void {
    if (!this.kanbanContainer) {
      return;
    }

    const container = this.kanbanContainer.nativeElement;
    const rect = container.getBoundingClientRect();
    const scrollThreshold = 150; // Increased threshold for easier trigger
    const x = event.clientX - rect.left;

    // Clear any existing scroll
    this.clearAutoScroll();

    // Check left scroll trigger
    if (x < scrollThreshold && container.scrollLeft > 0) {
      this.startContinuousScroll('left', container);
    }
    // Check right scroll trigger
    else if (x > rect.width - scrollThreshold) {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft < maxScroll) {
        this.startContinuousScroll('right', container);
      } else {
      }
    } else {
    }
  }

  private startContinuousScroll(
    direction: 'left' | 'right',
    container: HTMLElement
  ) {
    const scrollStep = () => {
      if (!this.isDragActive) {
        this.clearAutoScroll();
        return;
      }

      const scrollAmount =
        direction === 'left' ? -this.autoScrollSpeed : this.autoScrollSpeed;
      const beforeScroll = container.scrollLeft;

      container.scrollLeft += scrollAmount;

      // Check boundaries
      const maxScroll = container.scrollWidth - container.clientWidth;
      const canContinue =
        direction === 'left'
          ? container.scrollLeft > 0
          : container.scrollLeft < maxScroll;

      if (canContinue && this.isDragActive) {
        this.autoScrollInterval = requestAnimationFrame(scrollStep);
      } else {
        this.clearAutoScroll();
      }
    };

    this.autoScrollInterval = requestAnimationFrame(scrollStep);
  }

  private clearAutoScroll(): void {
    if (this.autoScrollInterval) {
      cancelAnimationFrame(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }

  // FIXED: Mouse tracking during drag
  private trackMouseDuringDrag = (event: MouseEvent) => {
    if (this.isDragActive) {
      this.handleAutoScrollFromMousePosition(event.clientX, event.clientY);
    }
  };

  // Test method to manually check container
  testAutoScroll() {
    if (!this.kanbanContainer) {
      return;
    }

    const container = this.kanbanContainer.nativeElement;

    // Test manual scroll
    container.scrollLeft += 50;
    setTimeout(() => {}, 100);
  }

  testDragEvents() {
    // Simulate drag active
    this.isDragActive = true;

    // Test auto-scroll with fake mouse position
    const fakeEvent = {
      clientX: 100, // Near left edge
      clientY: 300,
    };

    this.handleAutoScrollFromMousePosition(
      fakeEvent.clientX,
      fakeEvent.clientY
    );
  }

  // MAIN FIX: Direct mouse position handling for task drag
  private handleAutoScrollFromMousePosition(
    mouseX: number,
    mouseY: number
  ): void {
    if (!this.kanbanContainer) {
      return;
    }

    if (!this.isDragActive) {
      return;
    }

    const container = this.kanbanContainer.nativeElement;
    const rect = container.getBoundingClientRect();
    const scrollThreshold = 150;
    const x = mouseX - rect.left;

    // Check if mouse is within container vertically
    if (mouseY < rect.top || mouseY > rect.bottom) {
      this.clearAutoScroll();
      return;
    }

    // Clear any existing scroll
    this.clearAutoScroll();

    // Check left scroll trigger
    if (x < scrollThreshold && container.scrollLeft > 0) {
      this.startContinuousScroll('left', container);
    }
    // Check right scroll trigger
    else if (x > rect.width - scrollThreshold) {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft < maxScroll) {
        this.startContinuousScroll('right', container);
      } else {
      }
    } else {
    }
  }

  // Auto-scroll handling method - exactly like your working code
  private handleAutoScroll(event: MouseEvent): void {
    if (!this.kanbanContainer) {
      return;
    }

    const container = this.kanbanContainer.nativeElement;
    const rect = container.getBoundingClientRect();
    const scrollThreshold = 100; // Reduced for easier testing
    const x = event.clientX - rect.left;

    // Clear any existing scroll
    this.clearAutoScroll();

    // Check left scroll trigger
    if (x < scrollThreshold && container.scrollLeft > 0) {
      this.startAutoScrollLeft(container);
    }
    // Check right scroll trigger
    else if (x > rect.width - scrollThreshold) {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft < maxScroll) {
        this.startAutoScrollRight(container);
      } else {
      }
    } else {
    }
  }

  private startAutoScrollLeft(container: HTMLElement) {
    const scrollStep = () => {
      container.scrollLeft -= this.autoScrollSpeed;

      if (container.scrollLeft > 0) {
        this.autoScrollInterval = requestAnimationFrame(scrollStep);
      } else {
        this.clearAutoScroll();
      }
    };
    this.autoScrollInterval = requestAnimationFrame(scrollStep);
  }

  private startAutoScrollRight(container: HTMLElement) {
    const scrollStep = () => {
      container.scrollLeft += this.autoScrollSpeed;

      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft < maxScroll) {
        this.autoScrollInterval = requestAnimationFrame(scrollStep);
      } else {
        this.clearAutoScroll();
      }
    };
    this.autoScrollInterval = requestAnimationFrame(scrollStep);
  }

  // Add mouse move listener during drag
  private handleDragMove = (event: MouseEvent) => {
    if (!this.isDragging()) {
      return;
    }

    if (!this.kanbanContainer) {
      return;
    }

    this.handleAutoScroll(event);
  };

  onToggleAssignmentFilter() {
    this.isAssignmentFilterActive.set(!this.isAssignmentFilterActive());

    this.storage.set(
      teamMemberCommon.ASSIGNMENT_FILTER,
      this.isAssignmentFilterActive()
    );
  }
}
