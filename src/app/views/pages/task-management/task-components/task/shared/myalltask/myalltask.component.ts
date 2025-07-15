import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
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
  updatedAt: Date;
  calenderEventId?: string;
  createdBy: string;
}

interface TaskDateGroup {
  date: string;
  tasks: PersonalTask[];
}

@Component({
  selector: 'app-myalltask',
  templateUrl: './myalltask.component.html',
  styleUrl: './myalltask.component.scss',
})
export class MyalltaskComponent implements OnInit {
  @ViewChild('editTaskInput') editTaskInput!: ElementRef<HTMLInputElement>;

  // Task Data
  allTaskGroups: TaskDateGroup[] = [];
  
  // UI State
  isLoading: boolean = false;
  showFullScreenLoader: boolean = false;
  activeDropdownId: string | null = null;
  collapsedDates: Set<string> = new Set<string>();

  // Edit Modal
  editingTaskId: string | null = null;
  editTaskTitle: string = '';

  // Date-time picker properties
  showDateTimePicker: boolean = false;
  selectedTaskId: string = '';
  selectedTaskDueDate: Date | null = null;

  constructor(
    private personalTaskService: PersonalTaskService,
    private storage: AppStorage
  ) {}

  async ngOnInit(): Promise<void> {
    console.log('MyAllTask component initialized'); // Debug log
    await this.loadAllTasks();
  }

  // Data Loading Methods
  async loadAllTasks(): Promise<void> {
    this.isLoading = true;
    this.allTaskGroups = [];

    try {
      const response = await this.personalTaskService.getAllTasks({
        search: ''
      });

      console.log('API Response:', response);

      if (response && response.tasks) {
        this.allTaskGroups = response.tasks;
        // Collapse all previous dates by default
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.allTaskGroups.forEach(group => {
          const groupDate = this.parseDate(group.date);
          if (groupDate < today) {
            this.collapsedDates.add(group.date);
          }
        });
        console.log('Tasks loaded:', this.allTaskGroups); 
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      this.isLoading = false;
    }
  }

  parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Task Management Methods
  async toggleTaskStatus(task: PersonalTask): Promise<void> {
    console.log('Toggling task status for:', task._id); // Debug log
    
    const originalStatus = task.isCompleted;
    const originalCompletedOn = task.completedOn;

    // Update UI immediately
    task.isCompleted = !task.isCompleted;
    task.completedOn = task.isCompleted ? new Date() : null;

    // Close dropdown
    this.activeDropdownId = null;

    try {
      const response = await this.personalTaskService.TogglePersonalTaskStatus({
        taskId: task._id,
      });

      if (!response) {
        // Revert changes and reload
        task.isCompleted = originalStatus;
        task.completedOn = originalCompletedOn;
        await this.loadAllTasks();
      }
    } catch (error) {
      console.error('Error toggling task status:', error);
      // Revert changes and reload
      task.isCompleted = originalStatus;
      task.completedOn = originalCompletedOn;
      await this.loadAllTasks();
    }
  }

  startEdit(task: PersonalTask): void {
    console.log('Starting edit for task:', task._id); // Debug log
    
    this.editingTaskId = task._id;
    this.editTaskTitle = task.title;
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
    this.editTaskTitle = '';
  }

  async updateTask(): Promise<void> {
    if (!this.editingTaskId || !this.editTaskTitle.trim()) return;

    const updatedTitle = this.editTaskTitle.trim();
    
    // Find and update task optimistically
    const task = this.findTaskById(this.editingTaskId);
    const originalTitle = task?.title;

    if (task) {
      task.title = updatedTitle;
    }

    try {
      const response = await this.personalTaskService.UpdatePersonalTask({
        taskId: this.editingTaskId,
        title: updatedTitle,
      });

      if (response) {
        this.cancelEdit();
      } else {
        // Revert on failure
        if (task && originalTitle) {
          task.title = originalTitle;
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert on error
      if (task && originalTitle) {
        task.title = originalTitle;
      }
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    console.log('Deleting task:', taskId); // Debug log
    
    try {
      const confirmed = await swalHelper.confirmation(
        'Delete',
        'Are you sure you want to delete this task?',
        'warning'
      );

      // Close dropdown
      this.activeDropdownId = null;

      if (!confirmed.isConfirmed) {
        return;
      }

      // Show loading
      this.showFullScreenLoader = true;

      const response = await this.personalTaskService.DeletePersonalTask({
        taskId: taskId,
      });

      if (response) {
        // Remove task from UI immediately
        this.removeTaskFromGroups(taskId);
      } else {
        // Reload if API failed
        await this.loadAllTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      // Reload on error
      await this.loadAllTasks();
    } finally {
      this.showFullScreenLoader = false;
    }
  }

  // Helper Methods
  findTaskById(taskId: string): PersonalTask | null {
    for (const group of this.allTaskGroups) {
      const task = group.tasks.find(t => t._id === taskId);
      if (task) return task;
    }
    return null;
  }

  removeTaskFromGroups(taskId: string): void {
    this.allTaskGroups = this.allTaskGroups.map(group => ({
      ...group,
      tasks: group.tasks.filter(task => task._id !== taskId)
    })).filter(group => group.tasks.length > 0); // Remove empty groups
  }

  canUpdateTask(): boolean {
    return this.editTaskTitle.trim().length > 0;
  }

  // Date Formatting Methods
  formatDateHeader(dateString: string): string {
    try {
      // Parse DD-MM-YYYY format
      const [day, month, year] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if it's today
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      }
      
      // Check if it's yesterday
      if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      
      // Format as readable date
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString; // Fallback to original string
    }
  }

  formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  isDueOverdue(dueOn: Date | string | null): boolean {
    if (!dueOn) return false;
    return new Date(dueOn).getTime() < Date.now();
  }

  isToday(dateString: string): boolean {
    try {
      const [day, month, year] = dateString.split('-');
      const groupDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const today = new Date();
      return groupDate.toDateString() === today.toDateString();
    } catch (error) {
      return false;
    }
  }

  isDateCollapsed(dateString: string): boolean {
    return this.collapsedDates.has(dateString);
  }

  toggleDateCollapse(dateString: string): void {
    if (this.collapsedDates.has(dateString)) {
      this.collapsedDates.delete(dateString);
    } else {
      this.collapsedDates.add(dateString);
    }
  }

  // UI Event Handlers
  toggleDropdown(taskId: string): void {
    console.log('Dropdown clicked for task:', taskId); // Debug log
    if (this.activeDropdownId === taskId) {
      this.activeDropdownId = null;
    } else {
      this.activeDropdownId = taskId;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.tw-relative')) {
      this.activeDropdownId = null;
    }
  }

  onEditModalKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.updateTask();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEdit();
    }
  }

  // Track By Functions for Performance
  trackByDate(index: number, group: TaskDateGroup): string {
    return group.date;
  }

  trackByTaskId(index: number, task: PersonalTask): string {
    return task._id;
  }

  // Date-Time Picker Methods
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
    const task = this.findTaskById(this.selectedTaskId);
    if (task) {
      task.dueOn = newDateTime;
    }
    this.closeDateTimePicker();
    // Optionally reload data to get proper order
    // this.loadAllTasks();
  }
}