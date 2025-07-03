import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
import { PersonalTaskService } from 'src/app/services/personal-task.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';

interface WeekTask {
  _id: string;
  title: string;
  dueOn: Date | null;
  isCompleted: boolean;
  completedOn: Date | null;
  createdAt: Date;
  dayIndex: number;
}

interface DayColumn {
  index: number;
  name: string;
  date: Date;
  tasks: WeekTask[];
  newTaskTitle: string;
  isInputFocused: boolean;
  isInputDisabled: boolean;
}

@Component({
  selector: 'app-myweektask',
  templateUrl: './myweektask.component.html',
  styleUrl: './myweektask.component.scss'
})
export class MyweektaskComponent implements OnInit {
  @ViewChild('kanbanContainer') kanbanContainer!: ElementRef<HTMLDivElement>;

  // Day columns data
  dayColumns: DayColumn[] = [];
  isLoading: boolean = false;
  
  // Task management
  editingTask: { taskId: string; title: string; dayIndex: number } | null = null;
  
  // UI State
  activeDropdownId: string | null = null;
  activeFocusedInput: number | null = null;
  
  // Drag and Drop
  draggedTask: WeekTask | null = null;
  dragOverColumnIndex: number | null = null;
  
  // Auto scroll
  autoScrollInterval: any = null;
  autoScrollSpeed: number = 15;

  // NEW: Task Clock Modal State
  isTaskClockVisible: boolean = false;
  taskClockMode: 'add' | 'edit' = 'edit';
  selectedTaskForEdit: WeekTask | null = null;

  constructor(
    private personalTaskService: PersonalTaskService,
    private storage: AppStorage
  ) { }

  async ngOnInit(): Promise<void> {
    this.initializeDayColumns();
    await this.fetchWeekTasks();
  }

  private initializeDayColumns(): void {
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    this.dayColumns = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let displayName: string;
      if (i === 0) {
        displayName = 'Today';
      } else if (i === 1) {
        displayName = 'Tomorrow';
      } else {
        displayName = dayNames[date.getDay()];
      }
      
      this.dayColumns.push({
        index: i,
        name: displayName,
        date: date,
        tasks: [],
        newTaskTitle: '',
        isInputFocused: false,
        isInputDisabled: false
      });
    }
  }

  // Main API Call Implementation
  async fetchWeekTasks(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    try {
      const response = await this.personalTaskService.getPersonalWeekTaskDetails();

      if (response) {
        this.mapApiDataToColumns(response);
      }
    } catch (error) {
      console.error('Error fetching week tasks:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private mapApiDataToColumns(data: any): void {
    // Clear existing tasks
    this.dayColumns.forEach(column => column.tasks = []);

    // Map API day keys to column indices
    const dayKeyToIndex: { [key: string]: number } = {
      'today': 0,
      'tomorrow': 1,
      'Monday': this.getDayIndex('Monday'),
      'Tuesday': this.getDayIndex('Tuesday'),
      'Wednesday': this.getDayIndex('Wednesday'),
      'Thursday': this.getDayIndex('Thursday'),
      'Friday': this.getDayIndex('Friday'),
      'Saturday': this.getDayIndex('Saturday'),
      'Sunday': this.getDayIndex('Sunday')
    };

    // Process each day from API response
    Object.keys(data).forEach(dayKey => {
      const tasks = data[dayKey] || [];
      const columnIndex = dayKeyToIndex[dayKey];

      if (columnIndex !== undefined && columnIndex < this.dayColumns.length) {
        const mappedTasks = tasks.map((task: any) => ({
          _id: task._id,
          title: task.title,
          dueOn: task.dueOn,
          isCompleted: task.isCompleted,
          completedOn: task.completedOn,
          createdAt: task.createdAt,
          dayIndex: columnIndex
        }));

        this.dayColumns[columnIndex].tasks = mappedTasks;
        this.sortTasksInColumn(this.dayColumns[columnIndex]);
      }
    });
  }

  private getDayIndex(dayName: string): number {
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIndex = dayNames.indexOf(dayName);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() === targetDayIndex) {
        return i;
      }
    }
    return -1;
  }

private sortTasksInColumn(column: DayColumn): void {
  const currentTime = new Date();
  
  column.tasks.sort((a, b) => {
    // Incomplete tasks first
    if (a.isCompleted !== b.isCompleted) {
      return Number(a.isCompleted) - Number(b.isCompleted);
    }
    
    // Sort by time, not createdAt
    const timeA = new Date(a.dueOn || a.createdAt);
    const timeB = new Date(b.dueOn || b.createdAt);
    
    // For today, sort by proximity to current time
    if (column.index === 0) {
      const diffA = Math.abs(timeA.getTime() - currentTime.getTime());
      const diffB = Math.abs(timeB.getTime() - currentTime.getTime());
      return diffA - diffB;
    }
    
    // For other days, earliest time first
    return timeA.getTime() - timeB.getTime();
  });
}

  // Input Management
  onInputFocus(columnIndex: number): void {
    this.activeFocusedInput = columnIndex;
    this.dayColumns[columnIndex].isInputFocused = true;
    
    // Disable all other inputs
    this.dayColumns.forEach((column, index) => {
      if (index !== columnIndex) {
        column.isInputDisabled = true;
      }
    });
  }

  onInputBlur(columnIndex: number): void {
    setTimeout(() => {
      this.dayColumns[columnIndex].isInputFocused = false;
      this.dayColumns.forEach(column => {
        column.isInputDisabled = false;
      });
      this.activeFocusedInput = null;
    }, 100);
  }

  onKeyDown(event: KeyboardEvent, columnIndex: number): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTask(columnIndex);
    }
  }

 async addTask(columnIndex: number): Promise<void> {
    const column = this.dayColumns[columnIndex];
    const taskTitle = column.newTaskTitle.trim();
    
    if (!taskTitle) return;
    const dueDate = new Date(column.date);
    dueDate.setMinutes(dueDate.getMinutes() + 5);

    


    const response = await this.personalTaskService.AddPersonalTask({
        title: taskTitle,
        dueOn: dueDate
      });

      if(response){
        const newTask: WeekTask = {
      _id: response._id,
      title: taskTitle,
      dueOn: dueDate,
      isCompleted: false,
      completedOn: null,
      createdAt: response.createdAt,
      dayIndex: columnIndex
    };
    // Add to top of column
    column.tasks.unshift(newTask);
    column.newTaskTitle = '';
    
    // Explicitly set input focus state
    column.isInputFocused = true;

    // Sort column to maintain order
    this.sortTasksInColumn(column);
      }
    
    // Keep input focused after adding task
    setTimeout(() => {
      const inputElement = document.querySelector(`textarea[data-column="${columnIndex}"]`) as HTMLTextAreaElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 50);
  }

async toggleTaskStatus(task: WeekTask): Promise<void> {
  const previousStatus = task.isCompleted;
  const previousCompletedOn = task.completedOn;
  
  // Update UI immediately
  task.isCompleted = !task.isCompleted;
  task.completedOn = task.isCompleted ? new Date() : null;
  
  // Sort the column after status change
  const column = this.dayColumns[task.dayIndex];
  this.sortTasksInColumn(column);
  
  try {
    await this.personalTaskService.TogglePersonalTaskStatus({
      taskId: task._id,
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    
    // Revert on error
    task.isCompleted = previousStatus;
    task.completedOn = previousCompletedOn;
    this.sortTasksInColumn(column);
  }
}

  startEditTask(task: WeekTask): void {
    this.editingTask = {
      taskId: task._id,
      title: task.title,
      dayIndex: task.dayIndex
    };
    this.activeDropdownId = null;
  }

  saveEditTask(): void {
    if (!this.editingTask) return;
    
    const column = this.dayColumns[this.editingTask.dayIndex];
    const task = column.tasks.find(t => t._id === this.editingTask!.taskId);
    
    if (task && this.editingTask.title.trim()) {
      task.title = this.editingTask.title.trim();
    }
    
    this.editingTask = null;
  }

  cancelEditTask(): void {
    this.editingTask = null;
  }

  async deleteTask(task: WeekTask): Promise<void> {
    try {
      const confirmed = await swalHelper.confirmation(
        'Delete',
        'Are you sure you want to delete this task?',
        'warning'
      );
      
      this.activeDropdownId = null;
      
      if (!confirmed.isConfirmed) {
        return;
      }

      const column = this.dayColumns[task.dayIndex];
      column.tasks = column.tasks.filter(t => t._id !== task._id);

      await this.personalTaskService.DeletePersonalTask({ taskId: task._id });

    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }


  async moveTaskToDay(task: WeekTask, targetDayIndex: number): Promise<void> {
  if (task.dayIndex === targetDayIndex) return;

  // Close dropdown immediately
  this.activeDropdownId = null;
  
  // Remove from current column
  const currentColumn = this.dayColumns[task.dayIndex];
  currentColumn.tasks = currentColumn.tasks.filter(t => t._id !== task._id);
  
  // Add to target column
  task.dayIndex = targetDayIndex;
  const targetColumn = this.dayColumns[targetDayIndex];
  targetColumn.tasks.unshift(task);
  
  // Sort both columns
  this.sortTasksInColumn(currentColumn);
  this.sortTasksInColumn(targetColumn);
  
  // NEW: API call for update
  try {
    const newDueDate = new Date(targetColumn.date);
    // Existing time ko maintain karo
    if (task.dueOn) {
      const existingTime = new Date(task.dueOn);
      newDueDate.setHours(existingTime.getHours(), existingTime.getMinutes());
    }
    
    await this.personalTaskService.UpdatePersonalTask({
      taskId: task._id,
      dueOn: newDueDate
    });
    
    // Update local task object
    task.dueOn = newDueDate;
    
  } catch (error) {
    console.error('Error updating task:', error);
    // Revert on error
    targetColumn.tasks = targetColumn.tasks.filter(t => t._id !== task._id);
    currentColumn.tasks.unshift(task);
    task.dayIndex = currentColumn.index;
    this.sortTasksInColumn(currentColumn);
    this.sortTasksInColumn(targetColumn);
  }
  
  this.activeDropdownId = null;
}

  // NEW: Task Clock Modal Methods
  openEditTaskModal(task: WeekTask): void {
    this.selectedTaskForEdit = task;
    this.taskClockMode = 'edit';
    this.isTaskClockVisible = true;
    this.activeDropdownId = null;
  }

  openAddTaskModal(): void {
    this.selectedTaskForEdit = null;
    this.taskClockMode = 'add';
    this.isTaskClockVisible = true;
  }

  closeTaskClockModal(): void {
    this.isTaskClockVisible = false;
    this.selectedTaskForEdit = null;
  }

  onTaskUpdated(updatedDate: Date): void {
    // Refresh the tasks after update
    this.fetchWeekTasks();
  }

  onTaskAdded(): void {
    // Refresh the tasks after adding new task
    this.fetchWeekTasks();
  }

  // Dropdown Management
  toggleDropdown(taskId: string): void {
    this.activeDropdownId = this.activeDropdownId === taskId ? null : taskId;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container') && !target.closest('.task-options')) {
      this.activeDropdownId = null;
    }
    if (!target.closest('.edit-task-container')) {
      if (this.editingTask) {
        this.saveEditTask();
      }
    }
  }

  // Drag and Drop (existing methods remain the same)
  onDragStart(event: DragEvent, task: WeekTask): void {
    this.draggedTask = task;
    event.dataTransfer!.effectAllowed = 'move';
    this.kanbanContainer.nativeElement.classList.add('dragging');
    
    const dragElement = event.target as HTMLElement;
    const clone = dragElement.cloneNode(true) as HTMLElement;
    
    clone.style.position = 'absolute';
    clone.style.top = '-1000px';
    clone.style.left = '-1000px';
    clone.style.width = dragElement.offsetWidth + 'px';
    clone.style.transform = 'rotate(3deg)';
    clone.style.opacity = '0.95';
    clone.style.backgroundColor = '#ffffff';
    clone.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
    clone.style.border = '2px solid #3b82f6';
    clone.style.borderRadius = '8px';
    clone.style.zIndex = '9999';
    
    document.body.appendChild(clone);
    event.dataTransfer!.setDragImage(clone, dragElement.offsetWidth / 2, 25);
    
    setTimeout(() => {
      if (document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
    }, 1);
  }

  onDragOver(event: DragEvent, columnIndex: number): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    this.dragOverColumnIndex = columnIndex;
    this.handleAutoScroll(event);
  }

  onDragLeave(event: DragEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      this.dragOverColumnIndex = null;
    }
  }

  async onDrop(event: DragEvent, targetColumnIndex: number): Promise<void> {
    event.preventDefault();
    
    if (!this.draggedTask || this.draggedTask.dayIndex === targetColumnIndex) {
      this.resetDragState();
      return;
    }

    await this.moveTaskToDay(this.draggedTask, targetColumnIndex);
    this.resetDragState();
  }

  onDragEnd(): void {
    this.resetDragState();
    this.kanbanContainer.nativeElement.classList.remove('dragging');
  }

  private resetDragState(): void {
    this.draggedTask = null;
    this.dragOverColumnIndex = null;
    this.clearAutoScroll();
  }

  private handleAutoScroll(event: DragEvent): void {
    if (!this.kanbanContainer) return;

    const container = this.kanbanContainer.nativeElement;
    const rect = container.getBoundingClientRect();
    const scrollThreshold = 250;

    const x = event.clientX - rect.left;

    this.clearAutoScroll();

    const scrollStep = () => {
      if (x < scrollThreshold) {
        container.scrollLeft -= this.autoScrollSpeed;
        if (container.scrollLeft > 0) {
          this.autoScrollInterval = requestAnimationFrame(scrollStep);
        }
      } else if (x > rect.width - scrollThreshold) {
        container.scrollLeft += this.autoScrollSpeed;
        if (container.scrollLeft < container.scrollWidth - container.clientWidth) {
          this.autoScrollInterval = requestAnimationFrame(scrollStep);
        }
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

  // Utility methods
  trackByTaskId(index: number, task: WeekTask): string {
    return task._id;
  }

  trackByColumnIndex(index: number, column: DayColumn): number {
    return column.index;
  }

  getTasksForColumn(columnIndex: number): WeekTask[] {
    return this.dayColumns[columnIndex]?.tasks || [];
  }

  isTaskBeingDragged(task: WeekTask): boolean {
    return this.draggedTask?._id === task._id;
  }

  shouldHideTask(task: WeekTask): boolean {
    return this.isTaskBeingDragged(task);
  }

  ngOnDestroy(): void {
    this.clearAutoScroll();
  }
}