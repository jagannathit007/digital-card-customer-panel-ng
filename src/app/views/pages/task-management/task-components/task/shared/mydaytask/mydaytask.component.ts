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

// interface PersonalTask {
//   _id: string;
//   title: string;
//   dueOn: Date | null;
//   isCompleted: boolean;
//   completedOn: Date | null;
//   createdAt: Date;
// }

// interface TaskResponse {
//   status: number;
//   message: string;
//   data: {
//     total: string;
//     page: string;
//     limit: string;
//     tasks: PersonalTask[];
//   };
// }

// interface AddTaskResponse {
//   status: number;
//   message: string;
//   data: PersonalTask;
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
//   userName: string = 'User';
//   activeDropdownId: string | null = null;
//   isSubmitting: boolean = false;
//   showFullScreenLoader: boolean = false;

//   constructor(
//     private personalTaskService: PersonalTaskService,
//     private storage: AppStorage
//   ) { }

//   async ngOnInit(): Promise<void> {
//     // Initialize user name from storage or default
//     this.userName = 'User';

//     // Fetch initial tasks
//     await this.fetchTasks(true);

//     // Setup scroll listener for infinite scroll
//     this.setupInfiniteScroll();
//   }

//   /**
//    * Get current date formatted as "Thursday, 26 June"
//    */
//   getCurrentDate(): string {
//     const today = new Date();
//     const options: Intl.DateTimeFormatOptions = {
//       weekday: 'long',
//       day: 'numeric',
//       month: 'long'
//     };
//     return today.toLocaleDateString('en-US', options);
//   }

//   /**
//    * Get time of day for greeting
//    */
//   getTimeOfDay(): string {
//     const hour = new Date().getHours();
//     if (hour < 12) return 'Morning';
//     if (hour < 17) return 'Afternoon';
//     return 'Evening';
//   }

//   /**
//    * Handle keyboard events for task input
//    */
//   onKeyDown(event: KeyboardEvent): void {
//     if (event.ctrlKey && event.key === 'Enter') {
//       event.preventDefault();
//       if (this.editingTaskId) {
//         this.updateTask();
//       } else {
//         this.addTask();
//       }
//     }
//     // Allow normal Enter for new lines (default behavior)
//   }

//   /**
//    * Auto-resize textarea based on content
//    */
//   autoResize(event: Event): void {
//     const textarea = event.target as HTMLTextAreaElement;
//     textarea.style.height = 'auto';
//     textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
//   }

//   /**
//    * Check if send button should be enabled
//    */
//   canSendTask(): boolean {
//     return this.newTaskTitle.trim().length > 0 && !this.isSubmitting;
//   }

//   /**
//    * Fetch tasks from API with pagination
//    */
//   async fetchTasks(reset: boolean = false): Promise<void> {
//     if (this.isLoading || this.isLoadingMore) return;

//     if (reset) {
//       this.isLoading = true;
//       this.currentPage = 1;
//       this.tasks = [];
//     } else {
//       this.isLoadingMore = true;
//     }

//     const response = await this.personalTaskService.getPersonalTaskDetails({
//       page: this.currentPage,
//       limit: 10
//     });

//     console.log('Fetched tasks response:', response);

//     // Check for successful response
//     if (response && response.tasks && Array.isArray(response.tasks)) {
//       const newTasks = response.tasks;

//       if (reset) {
//         this.tasks = newTasks;
//       } else {
//         this.tasks = [...this.tasks, ...newTasks];
//       }

//       // Update pagination info
//       const total = parseInt(response.total);
//       const limit = parseInt(response.limit);
//       this.totalPages = Math.ceil(total / limit);
//       this.hasMoreData = this.currentPage < this.totalPages;

//       if (this.hasMoreData) {
//         this.currentPage++;
//       }

//       console.log('Tasks loaded:', this.tasks.length, 'Total available:', total);
//     } else {
//       console.error('Invalid response structure:', response);
//       swalHelper.showToast('Failed to fetch tasks - Invalid response', 'error');
//     }
//     this.isLoading = false;
//     this.isLoadingMore = false;

//   }

//   /**
//    * Add new task
//    */
//   async addTask(): Promise<void> {
//     if (!this.canSendTask()) return;

//     this.isSubmitting = true;
//     const taskTitle = this.newTaskTitle.trim();

//     // Optimistic UI update - only create temp task with minimal data
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
//       // Send only the title to API as requested
//       const response = await this.personalTaskService.AddPersonalTask({
//         title: taskTitle
//       });

//       console.log('Add task response:', response);

//       // Check for successful response - could be status 200 or 201
//       if (response) {
//         // Replace temp task with real task data
//         const realTask = response;
//         const tempIndex = this.tasks.findIndex(t => t._id === tempTask._id);
//         if (tempIndex !== -1) {
//           this.tasks[tempIndex] = realTask;
//         }
//         swalHelper.showToast('Task added successfully', 'success');
//       } else {
//         // Remove temp task on failure
//         this.tasks = this.tasks.filter(t => t._id !== tempTask._id);
//         const errorMessage = response?.message || 'Failed to add task';
//         console.error('Task addition failed:', errorMessage);
//         swalHelper.showToast(errorMessage, 'error');
//       }
//     } catch (error) {
//       console.error('Error adding task:', error);
//       // Remove temp task on error
//       this.tasks = this.tasks.filter(t => t._id !== tempTask._id);
//       swalHelper.showToast('Failed to add task', 'error');
//     } finally {
//       this.isSubmitting = false;
//     }
//   }

//   /**
//    * Start editing a task
//    */
//   startEdit(task: PersonalTask): void {
//     this.editingTaskId = task._id;
//     this.editingTaskTitle = task.title;
//     this.newTaskTitle = task.title;
//     this.activeDropdownId = null;

//     // Focus on input
//     setTimeout(() => {
//       if (this.taskInput) {
//         this.taskInput.nativeElement.focus();
//         this.taskInput.nativeElement.select();
//       }
//     }, 100);
//   }

//   /**
//    * Cancel editing
//    */
//   cancelEdit(): void {
//     this.editingTaskId = null;
//     this.editingTaskTitle = '';
//     this.newTaskTitle = '';
//   }

//   /**
//    * Update existing task
//    */
//   async updateTask(): Promise<void> {
//     if (!this.editingTaskId || !this.newTaskTitle.trim()) return;

//     this.isSubmitting = true;
//     const updatedTitle = this.newTaskTitle.trim();
//     const originalTitle = this.editingTaskTitle;

//     // Optimistic UI update
//     const taskIndex = this.tasks.findIndex(t => t._id === this.editingTaskId);
//     if (taskIndex !== -1) {
//       this.tasks[taskIndex].title = updatedTitle;
//     }

//     try {
//       const response = await this.personalTaskService.UpdatePersonalTask({
//         taskId: this.editingTaskId,
//         title: updatedTitle
//       });

//       if (response && (response.status === 200 || response.status === 201)) {
//         swalHelper.showToast('Task updated successfully', 'success');
//         this.cancelEdit();
//       } else {
//         // Revert on failure
//         if (taskIndex !== -1) {
//           this.tasks[taskIndex].title = originalTitle;
//         }
//         const errorMessage = response?.message || 'Failed to update task';
//         swalHelper.showToast(errorMessage, 'error');
//       }
//     } catch (error) {
//       console.error('Error updating task:', error);
//       // Revert on error
//       if (taskIndex !== -1) {
//         this.tasks[taskIndex].title = originalTitle;
//       }
//       swalHelper.showToast('Failed to update task', 'error');
//     } finally {
//       this.isSubmitting = false;
//     }
//   }

//   /**
//    * Toggle task completion status
//    */
//   async toggleTaskStatus(task: PersonalTask): Promise<void> {
//     if (task.isCompleted) return; // Don't allow uncompleting

//     const originalStatus = task.isCompleted;

//     // Optimistic UI update
//     task.isCompleted = true;
//     task.completedOn = new Date();

//     try {
//       const response = await this.personalTaskService.TogglePersonalTaskStatus(task._id);

//       if (response && (response.status === 200 || response.status === 201)) {
//         swalHelper.showToast('Task completed successfully', 'success');
//       } else {
//         // Revert on failure
//         task.isCompleted = originalStatus;
//         task.completedOn = null;
//         const errorMessage = response?.message || 'Failed to update task status';
//         swalHelper.showToast(errorMessage, 'error');
//       }
//     } catch (error) {
//       console.error('Error toggling task status:', error);
//       // Revert on error
//       task.isCompleted = originalStatus;
//       task.completedOn = null;
//       swalHelper.showToast('Failed to update task status', 'error');
//     }
//   }

//   /**
//    * Delete task
//    */
//   async deleteTask(taskId: string): Promise<void> {
//     // Optimistic UI update
//     const originalTasks = [...this.tasks];
//     this.tasks = this.tasks.filter((t: PersonalTask) => t._id !== taskId);
//     this.activeDropdownId = null;

//     const response = await this.personalTaskService.DeletePersonalTask({ taskId: taskId });

//     if (response) {
//       this.fetchTasks(true)
//     } else {
//       // Revert on failure and show full screen loader
//       this.showFullScreenLoader = true;
//       this.tasks = originalTasks;
//       await this.fetchTasks(true);
//       this.showFullScreenLoader = false;
//       const errorMessage = response?.message || 'Failed to delete task';
//       swalHelper.showToast(errorMessage, 'error');
//     }
//   }

//   /**
//    * Toggle dropdown menu
//    */
//   toggleDropdown(taskId: string): void {
//     this.activeDropdownId = this.activeDropdownId === taskId ? null : taskId;
//   }

//   /**
//    * Close dropdown when clicking outside
//    */
//   @HostListener('document:click', ['$event'])
//   onDocumentClick(event: MouseEvent): void {
//     const target = event.target as HTMLElement;
//     if (!target.closest('.dropdown-container')) {
//       this.activeDropdownId = null;
//     }
//   }

//   /**
//    * Setup infinite scroll
//    */
//   private setupInfiniteScroll(): void {
//     // Will be handled by scroll event in template
//   }

//   /**
//    * Handle scroll event for infinite loading
//    */
//   onScroll(event: Event): void {
//     const container = event.target as HTMLElement;
//     const scrollTop = container.scrollTop;
//     const scrollHeight = container.scrollHeight;
//     const clientHeight = container.clientHeight;

//     // Load more when scrolled to bottom
//     if (scrollTop + clientHeight >= scrollHeight - 100 && this.hasMoreData && !this.isLoadingMore) {
//       this.fetchTasks(false);
//     }
//   }

//   /**
//    * Format date for display
//    */
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

//   /**
//    * Track by function for ngFor optimization
//    */
//   trackByTaskId(index: number, task: PersonalTask): string {
//     return task._id;
//   }
// }


// import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { PersonalTaskService } from 'src/app/services/personal-task.service';
// import { AppStorage } from 'src/app/core/utilities/app-storage';

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
//   userName: string = 'User';
//   activeDropdownId: string | null = null;
//   isSubmitting: boolean = false;
//   showFullScreenLoader: boolean = false;

//   constructor(
//     private personalTaskService: PersonalTaskService,
//     private storage: AppStorage
//   ) { }

//   async ngOnInit(): Promise<void> {
//     this.userName = 'User';
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

//     const response = await this.personalTaskService.getPersonalTaskDetails({
//       page: this.currentPage,
//       limit: 10
//     });

//     if (response && response.tasks && Array.isArray(response.tasks)) {
//       const newTasks = response.tasks;

//       if (reset) {
//         this.tasks = newTasks;
//       } else {
//         this.tasks = [...this.tasks, ...newTasks];
//       }

//       const total = parseInt(response.total);
//       const limit = parseInt(response.limit);
//       this.totalPages = Math.ceil(total / limit);
//       this.hasMoreData = this.currentPage < this.totalPages;

//       if (this.hasMoreData) {
//         this.currentPage++;
//       }
//     }
    
//     this.isLoading = false;
//     this.isLoadingMore = false;
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

//     const response = await this.personalTaskService.AddPersonalTask({
//       title: taskTitle
//     });

//     if (response) {
//       const tempIndex = this.tasks.findIndex(t => t._id === tempTask._id);
//       if (tempIndex !== -1) {
//         this.tasks[tempIndex] = response;
//       }
//     } else {
//       this.tasks = this.tasks.filter(t => t._id !== tempTask._id);
//     }
    
//     this.isSubmitting = false;
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

//     const taskIndex = this.tasks.findIndex(t => t._id === this.editingTaskId);
//     if (taskIndex !== -1) {
//       this.tasks[taskIndex].title = updatedTitle;
//     }

//     const response = await this.personalTaskService.UpdatePersonalTask({
//       taskId: this.editingTaskId,
//       title: updatedTitle
//     });

//     if (response) {
//       this.cancelEdit();
//     } else {
//       if (taskIndex !== -1) {
//         this.tasks[taskIndex].title = originalTitle;
//       }
//     }
    
//     this.isSubmitting = false;
//   }

//   async toggleTaskStatus(task: PersonalTask): Promise<void> {
//     if (task.isCompleted) return;

//     const originalStatus = task.isCompleted;
//     task.isCompleted = true;
//     task.completedOn = new Date();

//     const response = await this.personalTaskService.TogglePersonalTaskStatus({taskId :task._id});

//     if (!response) {
//       task.isCompleted = originalStatus;
//       task.completedOn = null;
//     }
//   }

//   async deleteTask(taskId: string): Promise<void> {
//     const originalTasks = [...this.tasks];
//     this.tasks = this.tasks.filter((t: PersonalTask) => t._id !== taskId);
//     this.activeDropdownId = null;

//     const response = await this.personalTaskService.DeletePersonalTask({ taskId: taskId });

//     if (response) {
//       this.fetchTasks(true);
//     } else {
//       this.showFullScreenLoader = true;
//       this.tasks = originalTasks;
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

//     if (scrollTop + clientHeight >= scrollHeight - 100 && this.hasMoreData && !this.isLoadingMore) {
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

// }



// import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { PersonalTaskService } from 'src/app/services/personal-task.service';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { swalHelper } from 'src/app/core/constants/swal-helper';

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
//   userName: string = 'User';
//   activeDropdownId: string | null = null;
//   isSubmitting: boolean = false;
//   showFullScreenLoader: boolean = false;

//   constructor(
//     private personalTaskService: PersonalTaskService,
//     private storage: AppStorage
//   ) { }

//   async ngOnInit(): Promise<void> {
//     this.userName = 'User';
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
//           this.tasks = this.sortTasks(newTasks);
//         } else {
//           this.tasks = this.sortTasks([...this.tasks, ...newTasks]);
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

//   // Sort tasks: incomplete first, completed at bottom
//   private sortTasks(tasks: PersonalTask[]): PersonalTask[] {
//     return tasks.sort((a, b) => {
//       if (a.isCompleted && !b.isCompleted) return 1;
//       if (!a.isCompleted && b.isCompleted) return -1;
//       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
//           this.tasks = this.sortTasks(this.tasks);
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
//         this.cancelEdit();
//       } else {
//         if (taskIndex !== -1) {
//           this.tasks[taskIndex].title = originalTitle;
//         }
//       }
//     } catch (error) {
//       console.error('Error updating task:', error);
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
    
//     task.isCompleted = !task.isCompleted;
//     task.completedOn = task.isCompleted ? new Date() : null;

//     // Re-sort tasks immediately for instant UI update
//     this.tasks = this.sortTasks(this.tasks);

//     try {
//       const response = await this.personalTaskService.TogglePersonalTaskStatus({taskId: task._id});

//       if (!response) {
//         // Revert changes if API call failed
//         task.isCompleted = originalStatus;
//         task.completedOn = originalCompletedOn;
//         this.tasks = this.sortTasks(this.tasks);
//       }
//     } catch (error) {
//       console.error('Error toggling task status:', error);
//       // Revert changes if API call failed
//       task.isCompleted = originalStatus;
//       task.completedOn = originalCompletedOn;
//       this.tasks = this.sortTasks(this.tasks);
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
//       if (!confirmed) {
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
//     console.log('Toggling dropdown for task:', taskId);
//     console.log('Current activeDropdownId:', this.activeDropdownId);
    
//     this.activeDropdownId = this.activeDropdownId === taskId ? null : taskId;
    
//     console.log('New activeDropdownId:', this.activeDropdownId);
//   }

//   @HostListener('document:click', ['$event'])
//   onDocumentClick(event: MouseEvent): void {
//     const target = event.target as HTMLElement;
//     if (!target.closest('.dropdown-container')) {
//       console.log('Closing dropdown due to outside click');
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
//       console.log('Loading more tasks...');
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
// }



import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonalTaskService } from 'src/app/services/personal-task.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { swalHelper } from 'src/app/core/constants/swal-helper';

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
  userName: string = 'User';
  activeDropdownId: string | null = null;
  isSubmitting: boolean = false;
  showFullScreenLoader: boolean = false;

  constructor(
    private personalTaskService: PersonalTaskService,
    private storage: AppStorage
  ) { }

  async ngOnInit(): Promise<void> {
    this.userName = 'User';
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

  getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
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
      if (!confirmed) {
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
    console.log('Toggling dropdown for task:', taskId);
    console.log('Current activeDropdownId:', this.activeDropdownId);
    
    this.activeDropdownId = this.activeDropdownId === taskId ? null : taskId;
    
    console.log('New activeDropdownId:', this.activeDropdownId);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      console.log('Closing dropdown due to outside click');
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
      console.log('Loading more tasks...');
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
}