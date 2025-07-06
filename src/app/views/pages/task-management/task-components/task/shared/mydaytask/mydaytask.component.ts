import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonalTaskService } from 'src/app/services/personal-task.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';

interface PersonalTask {
  _id: string;
  title: string;
  dueOn: Date | null;
  isCompleted: boolean;
  completedOn: Date | null;
  createdAt: Date;
}

@Component({
  selector: 'app-mydaytask',
  templateUrl: './mydaytask.component.html',
  styleUrl: './mydaytask.component.scss'
})
export class MydaytaskComponent implements OnInit {
  @ViewChild('editTaskInput') editTaskInput!: ElementRef<HTMLTextAreaElement>;

  // Task Management Properties
  tasks: PersonalTask[] = [];
  newTaskTitle: string = '';
  editingTaskId: string | null = null;
  editingTaskTitle: string = '';

  // UI State Properties
  userName: string = '';
  activeDropdownId: string | null = null;
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  showFullScreenLoader: boolean = false;

  // Date-time picker properties
  showDateTimePicker: boolean = false;
  selectedTaskId: string = '';
  selectedTaskDueDate: Date | null = null;

  // Toggle property
  showTodayTasks: boolean = false;

  constructor(
    private personalTaskService: PersonalTaskService,
    private storage: AppStorage
  ) { }

  async ngOnInit(): Promise<void> {
    this.userName = this.storage.get(teamMemberCommon.TEAM_MEMBER_DATA)?.name || 'User';
    await this.fetchTasks();
  }

  getCurrentDate(): string {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    };
    return today.toLocaleDateString('en-US', options);
  }

  getCurrentDayName(): string {
    const today = new Date();
    return today.toLocaleDateString('en-US', { weekday: 'long' });
  }

  getCurrentDayNumber(): string {
    const today = new Date();
    return today.getDate().toString();
  }

  getCurrentMonthName(): string {
    const today = new Date();
    return today.toLocaleDateString('en-US', { month: 'long' });
  }

  getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  getNextTask(): PersonalTask | null {
  const now = new Date();
  
  // Filter tasks that have due date in future and are not completed
  const futureTasks = this.tasks.filter(task => {
    if (!task.dueOn || task.isCompleted) return false;
    const taskDate = new Date(task.dueOn);
    return taskDate > now; // Only future tasks
  });

  if (futureTasks.length === 0) return null;

  // Find the task closest to current time (soonest upcoming task)
  let nextTask = futureTasks[0];
  let smallestDiff = new Date(nextTask.dueOn!).getTime() - now.getTime();

  for (const task of futureTasks) {
    const diff = new Date(task.dueOn!).getTime() - now.getTime();
    if (diff < smallestDiff) {
      smallestDiff = diff;
      nextTask = task;
    }
  }

  return nextTask;
}

  formatTime(date: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  onInputKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.editingTaskId) {
        this.updateTask();
      } else {
        this.addTask();
      }
    }
  }

  onEditModalKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.updateTask();
    }
  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
  }

  canSendTask(): boolean {
    return this.newTaskTitle.trim().length > 0 && !this.isSubmitting;
  }

  async fetchTasks(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      const response = await this.personalTaskService.getPersonalTaskDetails({});

      if (response && response.tasks && Array.isArray(response.tasks)) {
        this.tasks = response.tasks;
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async fetchTodayTasks(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      const response = await this.personalTaskService.getPersonalAllTodayTaskDetails({});

      if (response && response.tasks && Array.isArray(response.tasks)) {
        this.tasks = response.tasks;
      }
    } catch (error) {
      console.error('Error fetching today tasks:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onToggleChange(): Promise<void> {
    if (this.showTodayTasks) {
      await this.fetchTodayTasks();
    } else {
      await this.fetchTasks();
    }
  }

  toggleTodayTasks(): void {
    this.showTodayTasks = !this.showTodayTasks;
    this.onToggleChange();
  }

  formatCompletedTime(completedOn: Date | null): string {
    if (!completedOn) return '';
    const d = new Date(completedOn);
    return 'at ' + d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  async addTask(): Promise<void> {
    if (!this.canSendTask()) return;

    this.isSubmitting = true;
    const taskTitle = this.newTaskTitle.trim();

    const tempTask: PersonalTask = {
      _id: `temp-${Date.now()}`,
      title: taskTitle,
      dueOn: null,
      isCompleted: false,
      completedOn: null,
      createdAt: new Date()
    };
    
    this.tasks.unshift(tempTask);
    this.newTaskTitle = '';

    try {
      const response = await this.personalTaskService.AddPersonalTask({
        title: taskTitle
      });

      if (response) {
        const tempIndex = this.tasks.findIndex(t => t._id === tempTask._id);
        if (tempIndex !== -1) {
          this.tasks[tempIndex] = response;
        }
      } else {
        this.tasks = this.tasks.filter(t => t._id !== tempTask._id);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      this.tasks = this.tasks.filter(t => t._id !== tempTask._id);
    } finally {
      this.isSubmitting = false;
    }
  }

   startEdit(task: PersonalTask): void {
    this.editingTaskId = task._id;
    this.editingTaskTitle = task.title;
    this.newTaskTitle = task.title;
    this.activeDropdownId = null;

    setTimeout(() => {
      if (this.editTaskInput) {
        this.editTaskInput.nativeElement.focus();
        this.editTaskInput.nativeElement.select();
      }
    }, 100);
  }

  cancelEdit(): void {
    this.editingTaskId = null;
    this.editingTaskTitle = '';
    this.newTaskTitle = '';
  }

  async updateTask(): Promise<void> {
    if (!this.editingTaskId || !this.newTaskTitle.trim()) return;

    this.isSubmitting = true;
    const updatedTitle = this.newTaskTitle.trim();
    const originalTitle = this.editingTaskTitle;

    const taskIndex = this.tasks.findIndex(t => t._id === this.editingTaskId);
    if (taskIndex !== -1) {
      this.tasks[taskIndex].title = updatedTitle;
    }

    try {
      const response = await this.personalTaskService.UpdatePersonalTask({
        taskId: this.editingTaskId,
        title: updatedTitle
      });

      if (response) {
        this.cancelEdit();
        await this.fetchTasks();
      } else {
        if (taskIndex !== -1) {
          this.tasks[taskIndex].title = originalTitle;
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      if (taskIndex !== -1) {
        this.tasks[taskIndex].title = originalTitle;
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  async toggleTaskStatus(task: PersonalTask): Promise<void> {
    const originalStatus = task.isCompleted;
    const originalCompletedOn = task.completedOn;
    
    // Update UI immediately
    task.isCompleted = !task.isCompleted;
    task.completedOn = task.isCompleted ? new Date() : null;

    // Move task to appropriate position
    if (task.isCompleted) {
      // Move completed task to bottom
      this.tasks = this.tasks.filter(t => t._id !== task._id);
      this.tasks.push(task);
    } else {
      // Move incomplete task to top
      this.tasks = this.tasks.filter(t => t._id !== task._id);
      this.tasks.unshift(task);
    }

    try {
      const response = await this.personalTaskService.TogglePersonalTaskStatus({taskId: task._id});

      if (!response) {
        // Revert changes if API failed
        task.isCompleted = originalStatus;
        task.completedOn = originalCompletedOn;
        // Reload fresh data
        await this.fetchTasks();
      }
    } catch (error) {
      console.error('Error toggling task status:', error);
      // Revert changes if API failed
      task.isCompleted = originalStatus;
      task.completedOn = originalCompletedOn;
      // Reload fresh data
      await this.fetchTasks();
    }
  }

  async deleteTask(taskId: string): Promise<void> {
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

      const originalTasks = [...this.tasks];
      this.tasks = this.tasks.filter((t: PersonalTask) => t._id !== taskId);

      const response = await this.personalTaskService.DeletePersonalTask({ taskId: taskId });

      if (response) {
        await this.fetchTasks();
      } else {
        this.showFullScreenLoader = true;
        this.tasks = originalTasks;
        await this.fetchTasks();
        this.showFullScreenLoader = false;
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      this.showFullScreenLoader = true;
      await this.fetchTasks();
      this.showFullScreenLoader = false;
    }
  }

  toggleDropdown(taskId: string): void {
    this.activeDropdownId = this.activeDropdownId === taskId ? null : taskId;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.activeDropdownId = null;
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  trackByTaskId(index: number, task: PersonalTask): string {
    return task._id;
  }

  isDueOverdue(dueOn: Date | string | null): boolean {
    if (!dueOn) return false;
    return new Date(dueOn).getTime() < Date.now();
  }

  openDateTimePicker(taskId: string, currentDueDate: Date | null = null): void {
    this.selectedTaskId = taskId;
    this.selectedTaskDueDate = currentDueDate;
    this.showDateTimePicker = true;
    
    this.activeDropdownId = null;
  }

  closeDateTimePicker(): void {
    this.showDateTimePicker = false;
    this.selectedTaskId = '';
    this.selectedTaskDueDate = null;
  }

  onTaskDateTimeUpdated(newDateTime: Date | null): void {
    const taskIndex = this.tasks.findIndex(t => t._id === this.selectedTaskId);
    if (taskIndex !== -1) {
      this.tasks[taskIndex].dueOn = newDateTime;
    }
    
    this.closeDateTimePicker();
    
    // Refresh data to get proper order
    this.fetchTasks();
  }
}