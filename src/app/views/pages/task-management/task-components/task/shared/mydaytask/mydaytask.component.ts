// import { Component, OnInit, ViewChild } from '@angular/core';
// import { PersonalTaskService } from 'src/app/services/personal-task.service';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
// import { swalHelper } from 'src/app/core/constants/swal-helper';
// @Component({
//   selector: 'app-mydaytask',
//   templateUrl: './mydaytask.component.html',
//   styleUrl: './mydaytask.component.scss'
// })
// export class MydaytaskComponent implements OnInit {
//    constructor(
//     private personalTaskService: PersonalTaskService,
//     private storage: AppStorage
//   ) {}

// async ngOnInit(): Promise<void> {
// }
// // }

// import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { PersonalTaskService } from 'src/app/services/personal-task.service';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { swalHelper } from 'src/app/core/constants/swal-helper';
// import { teamMemberCommon } from 'src/app/core/constants/team-members-common';

// interface PersonalTask {
//   _id: string;
//   title: string;
//   dueOn: Date | null;
//   isCompleted: boolean;
//   completedOn: Date | null;
//   createdAt: Date;
// }

// @Component({
//   selector: 'app-mydaytask',
//   templateUrl: './mydaytask.component.html',
//   styleUrl: './mydaytask.component.scss'
// })
// export class MydaytaskComponent implements OnInit {
//   @ViewChild('taskInput') taskInput!: ElementRef<HTMLTextAreaElement>;
//   @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

//   // Task Management Properties
//   tasks: PersonalTask[] = [];
//   newTaskTitle: string = '';
//   editingTaskId: string | null = null;
//   editingTaskTitle: string = '';

//   // Pagination Properties
//   currentPage: number = 1;
//   totalPages: number = 1;
//   isLoading: boolean = false;
//   isLoadingMore: boolean = false;
//   hasMoreData: boolean = true;

//   // UI State Properties
//   userName: string = '';
//   activeDropdownId: string | null = null;
//   isSubmitting: boolean = false;
//   showFullScreenLoader: boolean = false;

//   // Replace the existing date-time picker properties with these:
//   showDateTimePicker: boolean = false;
//   selectedTaskId: string = '';
//   selectedTaskDueDate: Date | null = null;

//   constructor(
//     private personalTaskService: PersonalTaskService,
//     private storage: AppStorage
//   ) { }


//   async ngOnInit(): Promise<void> {
//     this.userName = this.storage.get(teamMemberCommon.TEAM_MEMBER_DATA)?.name || 'User';
//     await this.fetchTasks(true);
//     this.setupInfiniteScroll();
//   }

//   getCurrentDate(): string {
//     const today = new Date();
//     const options: Intl.DateTimeFormatOptions = {
//       weekday: 'long',
//       day: 'numeric',
//       month: 'long'
//     };
//     return today.toLocaleDateString('en-US', options);
//   }

//   getTimeOfDay(): string {
//     const hour = new Date().getHours();
//     if (hour < 12) return 'Morning';
//     if (hour < 17) return 'Afternoon';
//     return 'Evening';
//   }

//   onKeyDown(event: KeyboardEvent): void {
//     if (event.ctrlKey && event.key === 'Enter') {
//       event.preventDefault();
//       if (this.editingTaskId) {
//         this.updateTask();
//       } else {
//         this.addTask();
//       }
//     }
//   }

//   autoResize(event: Event): void {
//     const textarea = event.target as HTMLTextAreaElement;
//     textarea.style.height = 'auto';
//     textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
//   }

//   canSendTask(): boolean {
//     return this.newTaskTitle.trim().length > 0 && !this.isSubmitting;
//   }

//   async fetchTasks(reset: boolean = false): Promise<void> {
//     if (this.isLoading || this.isLoadingMore) return;

//     if (reset) {
//       this.isLoading = true;
//       this.currentPage = 1;
//       this.tasks = [];
//     } else {
//       this.isLoadingMore = true;
//     }

//     try {
//       const response = await this.personalTaskService.getPersonalTaskDetails({
//         page: this.currentPage,
//         limit: 10
//       });

//       if (response && response.tasks && Array.isArray(response.tasks)) {
//         const newTasks = response.tasks;

//         if (reset) {
//           this.tasks = newTasks; // No sorting - maintain original order
//         } else {
//           this.tasks = [...this.tasks, ...newTasks]; // No sorting - maintain original order
//         }

//         const total = parseInt(response.total);
//         const limit = parseInt(response.limit);
//         this.totalPages = Math.ceil(total / limit);
//         this.hasMoreData = this.currentPage < this.totalPages;

//         if (this.hasMoreData) {
//           this.currentPage++;
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching tasks:', error);
//     } finally {
//       this.isLoading = false;
//       this.isLoadingMore = false;
//     }
//   }

//   // Sort only when task status changes - completed tasks go to bottom
//   private sortTasksByStatus(tasks: PersonalTask[]): PersonalTask[] {
//     return tasks.sort((a, b) => {
//       // Incomplete tasks first, completed tasks at bottom
//       if (a.isCompleted && !b.isCompleted) return 1;
//       if (!a.isCompleted && b.isCompleted) return -1;
      
//       // Within same status, maintain original order (no further sorting)
//       return 0;
//     });
//   }

//   async addTask(): Promise<void> {
//     if (!this.canSendTask()) return;

//     this.isSubmitting = true;
//     const taskTitle = this.newTaskTitle.trim();

//     const tempTask: PersonalTask = {
//       _id: `temp-${Date.now()}`,
//       title: taskTitle,
//       dueOn: null,
//       isCompleted: false,
//       completedOn: null,
//       createdAt: new Date()
//     };
    
//     this.tasks.unshift(tempTask);
//     this.newTaskTitle = '';

//     try {
//       const response = await this.personalTaskService.AddPersonalTask({
//         title: taskTitle
//       });

//       if (response) {
//         const tempIndex = this.tasks.findIndex(t => t._id === tempTask._id);
//         if (tempIndex !== -1) {
//           this.tasks[tempIndex] = response;
//           // No sorting - just replace the temp task with real one
//         }
//       } else {
//         this.tasks = this.tasks.filter(t => t._id !== tempTask._id);
//       }
//     } catch (error) {
//       console.error('Error adding task:', error);
//       this.tasks = this.tasks.filter(t => t._id !== tempTask._id);
//     } finally {
//       this.isSubmitting = false;
//     }
//   }

//   startEdit(task: PersonalTask): void {
//     this.editingTaskId = task._id;
//     this.editingTaskTitle = task.title;
//     this.newTaskTitle = task.title;
//     this.activeDropdownId = null;

//     setTimeout(() => {
//       if (this.taskInput) {
//         this.taskInput.nativeElement.focus();
//         this.taskInput.nativeElement.select();
//       }
//     }, 100);
//   }

//   cancelEdit(): void {
//     this.editingTaskId = null;
//     this.editingTaskTitle = '';
//     this.newTaskTitle = '';
//   }

//   async updateTask(): Promise<void> {
//     if (!this.editingTaskId || !this.newTaskTitle.trim()) return;

//     this.isSubmitting = true;
//     const updatedTitle = this.newTaskTitle.trim();
//     const originalTitle = this.editingTaskTitle;

//     // Find task and update UI immediately
//     const taskIndex = this.tasks.findIndex(t => t._id === this.editingTaskId);
//     if (taskIndex !== -1) {
//       this.tasks[taskIndex].title = updatedTitle;
//     }

//     try {
//       const response = await this.personalTaskService.UpdatePersonalTask({
//         taskId: this.editingTaskId,
//         title: updatedTitle
//       });

//       if (response) {
//         // Success: Just cancel edit, keep the updated UI
//         this.cancelEdit();
//         // NO DATA RELOAD - UI already updated
//       } else {
//         // API failed: Revert the UI change
//         if (taskIndex !== -1) {
//           this.tasks[taskIndex].title = originalTitle;
//         }
//       }
//     } catch (error) {
//       console.error('Error updating task:', error);
//       // API error: Revert the UI change
//       if (taskIndex !== -1) {
//         this.tasks[taskIndex].title = originalTitle;
//       }
//     } finally {
//       this.isSubmitting = false;
//     }
//   }

//   async toggleTaskStatus(task: PersonalTask): Promise<void> {
//     // Allow toggling both ways
//     const originalStatus = task.isCompleted;
//     const originalCompletedOn = task.completedOn;
    
//     // Update UI immediately
//     task.isCompleted = !task.isCompleted;
//     task.completedOn = task.isCompleted ? new Date() : null;

//     // ONLY sort when status changes - move completed to bottom
//     this.tasks = this.sortTasksByStatus(this.tasks);

//     try {
//       const response = await this.personalTaskService.TogglePersonalTaskStatus({taskId: task._id});

//       if (!response) {
//         // Revert changes if API call failed
//         task.isCompleted = originalStatus;
//         task.completedOn = originalCompletedOn;
//         // Re-sort back to original position
//         this.tasks = this.sortTasksByStatus(this.tasks);
//       }
//     } catch (error) {
//       console.error('Error toggling task status:', error);
//       // Revert changes if API call failed
//       task.isCompleted = originalStatus;
//       task.completedOn = originalCompletedOn;
//       // Re-sort back to original position
//       this.tasks = this.sortTasksByStatus(this.tasks);
//     }
//   }

//   async deleteTask(taskId: string): Promise<void> {
//     try {
//       // Show confirmation dialog and wait for result
//       const confirmed = await swalHelper.confirmation(
//         'Delete',
//         'Are you sure you want to delete this task?',
//         'warning'
//       );
      
//       // Close dropdown immediately regardless of confirmation result
//       this.activeDropdownId = null;
      
//       // If user clicked cancel, stop here
//       if (!confirmed.isConfirmed) {
//         return;
//       }

//       // User confirmed deletion, proceed
//       const originalTasks = [...this.tasks];
//       this.tasks = this.tasks.filter((t: PersonalTask) => t._id !== taskId);

//       const response = await this.personalTaskService.DeletePersonalTask({ taskId: taskId });

//       if (response) {
//         // Task deleted successfully, refresh the list
//         await this.fetchTasks(true);
//       } else {
//         // API call failed, show loader and restore original state
//         this.showFullScreenLoader = true;
//         this.tasks = originalTasks;
//         await this.fetchTasks(true);
//         this.showFullScreenLoader = false;
//       }
//     } catch (error) {
//       console.error('Error deleting task:', error);
//       // On error, refresh the tasks to ensure data consistency
//       this.showFullScreenLoader = true;
//       await this.fetchTasks(true);
//       this.showFullScreenLoader = false;
//     }
//   }

//   toggleDropdown(taskId: string): void {
    
//     this.activeDropdownId = this.activeDropdownId === taskId ? null : taskId;
    
//   }

//   @HostListener('document:click', ['$event'])
//   onDocumentClick(event: MouseEvent): void {
//     const target = event.target as HTMLElement;
//     if (!target.closest('.dropdown-container')) {
//       this.activeDropdownId = null;
//     }
//   }

//   private setupInfiniteScroll(): void {
//     // Will be handled by scroll event in template
//   }

//   onScroll(event: Event): void {
//     const container = event.target as HTMLElement;
//     const scrollTop = container.scrollTop;
//     const scrollHeight = container.scrollHeight;
//     const clientHeight = container.clientHeight;

//     // More aggressive infinite scroll trigger - loads when 80% scrolled
//     const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
//     if (scrollPercentage >= 0.8 && this.hasMoreData && !this.isLoadingMore && !this.isLoading) {
//       this.fetchTasks(false);
//     }
//   }

//   formatDate(date: Date | string): string {
//     if (!date) return '';
//     const d = new Date(date);
//     return d.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   }

//   trackByTaskId(index: number, task: PersonalTask): string {
//     return task._id;
//   }

//   // This function checks if the due date has passed
// isDueOverdue(dueOn: Date | string | null): boolean {
//   if (!dueOn) return false;
//   return new Date(dueOn).getTime() < Date.now();
// }

//   openDateTimePicker(taskId: string, currentDueDate: Date | null = null): void {
//     this.selectedTaskId = taskId;
//     this.selectedTaskDueDate = currentDueDate;
//     this.showDateTimePicker = true;
    
//     // Close the dropdown when opening date-time picker
//     this.activeDropdownId = null;
//   }

//   // 5. Update the closeDateTimePicker method
//   closeDateTimePicker(): void {
//     this.showDateTimePicker = false;
//     this.selectedTaskId = '';
//     this.selectedTaskDueDate = null;
//   }

//     // 6. Update the onTaskDateTimeUpdated method
//   onTaskDateTimeUpdated(newDateTime: Date): void {
    
//     // Find the task in your tasks array and update its dueOn property
//     const taskIndex = this.tasks.findIndex(t => t._id === this.selectedTaskId);
//     if (taskIndex !== -1) {
//       this.tasks[taskIndex].dueOn = newDateTime;
//     }
    
//     // Close the date-time picker
//     this.closeDateTimePicker();
//   }

// }


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
  @ViewChild('taskInput') taskInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  // Task Management Properties
  tasks: PersonalTask[] = [];
  newTaskTitle: string = '';
  editingTaskId: string | null = null;
  editingTaskTitle: string = '';

  // Pagination Properties
  currentPage: number = 1;
  totalPages: number = 1;
  isLoading: boolean = false;
  isLoadingMore: boolean = false;
  hasMoreData: boolean = true;

  // UI State Properties
  userName: string = '';
  activeDropdownId: string | null = null;
  isSubmitting: boolean = false;
  showFullScreenLoader: boolean = false;

  // Date-time picker properties
  showDateTimePicker: boolean = false;
  selectedTaskId: string = '';
  selectedTaskDueDate: Date | null = null;

  constructor(
    private personalTaskService: PersonalTaskService,
    private storage: AppStorage
  ) { }

  async ngOnInit(): Promise<void> {
    this.userName = this.storage.get(teamMemberCommon.TEAM_MEMBER_DATA)?.name || 'User';
    await this.fetchTasks(true);
    this.setupInfiniteScroll();
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

  // New methods for date display
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

  // Method to get the next task (closest to current time on the same day)
  getNextTask(): PersonalTask | null {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    // Filter tasks that have due date on today and are not completed
    const todayTasks = this.tasks.filter(task => {
      if (!task.dueOn || task.isCompleted) return false;
      const taskDate = new Date(task.dueOn);
      return taskDate >= today && taskDate < tomorrow;
    });

    if (todayTasks.length === 0) return null;

    // Find the task closest to current time
    let closestTask = todayTasks[0];
    let smallestDiff = Math.abs(new Date(closestTask.dueOn!).getTime() - now.getTime());

    for (const task of todayTasks) {
      const diff = Math.abs(new Date(task.dueOn!).getTime() - now.getTime());
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestTask = task;
      }
    }

    return closestTask;
  }

  // Method to format time for next task display
  formatTime(date: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      if (this.editingTaskId) {
        this.updateTask();
      } else {
        this.addTask();
      }
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

  async fetchTasks(reset: boolean = false): Promise<void> {
    if (this.isLoading || this.isLoadingMore) return;

    if (reset) {
      this.isLoading = true;
      this.currentPage = 1;
      this.tasks = [];
    } else {
      this.isLoadingMore = true;
    }

    try {
      const response = await this.personalTaskService.getPersonalTaskDetails({
        page: this.currentPage,
        limit: 10
      });

      if (response && response.tasks && Array.isArray(response.tasks)) {
        const newTasks = response.tasks;

        if (reset) {
          this.tasks = newTasks; // No sorting - maintain original order
        } else {
          this.tasks = [...this.tasks, ...newTasks]; // No sorting - maintain original order
        }

        const total = parseInt(response.total);
        const limit = parseInt(response.limit);
        this.totalPages = Math.ceil(total / limit);
        this.hasMoreData = this.currentPage < this.totalPages;

        if (this.hasMoreData) {
          this.currentPage++;
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      this.isLoading = false;
      this.isLoadingMore = false;
    }
  }

  // Sort only when task status changes - completed tasks go to bottom
  private sortTasksByStatus(tasks: PersonalTask[]): PersonalTask[] {
    return tasks.sort((a, b) => {
      // Incomplete tasks first, completed tasks at bottom
      if (a.isCompleted && !b.isCompleted) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;
      
      // Within same status, maintain original order (no further sorting)
      return 0;
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
          // No sorting - just replace the temp task with real one
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
      if (this.taskInput) {
        this.taskInput.nativeElement.focus();
        this.taskInput.nativeElement.select();
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

    // Find task and update UI immediately
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
        // Success: Just cancel edit, keep the updated UI
        this.cancelEdit();
        // NO DATA RELOAD - UI already updated
      } else {
        // API failed: Revert the UI change
        if (taskIndex !== -1) {
          this.tasks[taskIndex].title = originalTitle;
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // API error: Revert the UI change
      if (taskIndex !== -1) {
        this.tasks[taskIndex].title = originalTitle;
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  async toggleTaskStatus(task: PersonalTask): Promise<void> {
    // Allow toggling both ways
    const originalStatus = task.isCompleted;
    const originalCompletedOn = task.completedOn;
    
    // Update UI immediately
    task.isCompleted = !task.isCompleted;
    task.completedOn = task.isCompleted ? new Date() : null;

    // ONLY sort when status changes - move completed to bottom
    this.tasks = this.sortTasksByStatus(this.tasks);

    try {
      const response = await this.personalTaskService.TogglePersonalTaskStatus({taskId: task._id});

      if (!response) {
        // Revert changes if API call failed
        task.isCompleted = originalStatus;
        task.completedOn = originalCompletedOn;
        // Re-sort back to original position
        this.tasks = this.sortTasksByStatus(this.tasks);
      }
    } catch (error) {
      console.error('Error toggling task status:', error);
      // Revert changes if API call failed
      task.isCompleted = originalStatus;
      task.completedOn = originalCompletedOn;
      // Re-sort back to original position
      this.tasks = this.sortTasksByStatus(this.tasks);
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      // Show confirmation dialog and wait for result
      const confirmed = await swalHelper.confirmation(
        'Delete',
        'Are you sure you want to delete this task?',
        'warning'
      );
      
      // Close dropdown immediately regardless of confirmation result
      this.activeDropdownId = null;
      
      // If user clicked cancel, stop here
      if (!confirmed.isConfirmed) {
        return;
      }

      // User confirmed deletion, proceed
      const originalTasks = [...this.tasks];
      this.tasks = this.tasks.filter((t: PersonalTask) => t._id !== taskId);

      const response = await this.personalTaskService.DeletePersonalTask({ taskId: taskId });

      if (response) {
        // Task deleted successfully, refresh the list
        await this.fetchTasks(true);
      } else {
        // API call failed, show loader and restore original state
        this.showFullScreenLoader = true;
        this.tasks = originalTasks;
        await this.fetchTasks(true);
        this.showFullScreenLoader = false;
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      // On error, refresh the tasks to ensure data consistency
      this.showFullScreenLoader = true;
      await this.fetchTasks(true);
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

  private setupInfiniteScroll(): void {
    // Will be handled by scroll event in template
  }

  onScroll(event: Event): void {
    const container = event.target as HTMLElement;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // More aggressive infinite scroll trigger - loads when 80% scrolled
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    if (scrollPercentage >= 0.8 && this.hasMoreData && !this.isLoadingMore && !this.isLoading) {
      this.fetchTasks(false);
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

  // This function checks if the due date has passed
  isDueOverdue(dueOn: Date | string | null): boolean {
    if (!dueOn) return false;
    return new Date(dueOn).getTime() < Date.now();
  }

  openDateTimePicker(taskId: string, currentDueDate: Date | null = null): void {
    this.selectedTaskId = taskId;
    this.selectedTaskDueDate = currentDueDate;
    this.showDateTimePicker = true;
    
    // Close the dropdown when opening date-time picker
    this.activeDropdownId = null;
  }

  closeDateTimePicker(): void {
    this.showDateTimePicker = false;
    this.selectedTaskId = '';
    this.selectedTaskDueDate = null;
  }

  onTaskDateTimeUpdated(newDateTime: Date): void {
    // Find the task in your tasks array and update its dueOn property
    const taskIndex = this.tasks.findIndex(t => t._id === this.selectedTaskId);
    if (taskIndex !== -1) {
      this.tasks[taskIndex].dueOn = newDateTime;
    }
    
    // Close the date-time picker
    this.closeDateTimePicker();
  }
}