// import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { teamMemberCommon } from './../../../../../../../core/constants/team-members-common';
// import { PersonalTaskService } from 'src/app/services/personal-task.service';
// import { swalHelper } from 'src/app/core/constants/swal-helper';



// @Component({
//   selector: 'app-myweektask',
//   templateUrl: './myweektask.component.html',
//   styleUrl: './myweektask.component.scss'
// })
// export class MyweektaskComponent implements OnInit {

//     constructor(
//     private personalTaskService: PersonalTaskService,
//     private storage: AppStorage
//   ) { }

//   ngOnInit(): void {
//   }
// }


// import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
// import { PersonalTaskService } from 'src/app/services/personal-task.service';
// import { swalHelper } from 'src/app/core/constants/swal-helper';

// interface WeekTask {
//   _id: string;
//   title: string;
//   isCompleted: boolean;
//   completedOn: Date | null;
//   createdAt: Date;
//   dayIndex: number; // 0 = Today, 1 = Tomorrow, 2-6 = Next 5 days
// }

// interface DayColumn {
//   index: number;
//   name: string;
//   date: Date;
//   tasks: WeekTask[];
//   newTaskTitle: string;
//   isInputFocused: boolean;
//   isInputDisabled: boolean;
// }

// @Component({
//   selector: 'app-myweektask',
//   templateUrl: './myweektask.component.html',
//   styleUrl: './myweektask.component.scss'
// })
// export class MyweektaskComponent implements OnInit {
//   @ViewChild('kanbanContainer') kanbanContainer!: ElementRef<HTMLDivElement>;

//   // Day columns data
//   dayColumns: DayColumn[] = [];
  
//   // Task management
//   editingTask: { taskId: string; title: string; dayIndex: number } | null = null;
  
//   // UI State
//   activeDropdownId: string | null = null;
//   activeFocusedInput: number | null = null;
  
//   // Drag and Drop
//   draggedTask: WeekTask | null = null;
//   dragOverColumnIndex: number | null = null;
  
//   // Auto scroll
//   autoScrollInterval: any = null;

//   constructor(
//     private personalTaskService: PersonalTaskService,
//     private storage: AppStorage
//   ) { }

//   ngOnInit(): void {
//     this.initializeDayColumns();
//     this.loadSampleTasks(); // For demo purposes - replace with actual data loading
//   }

//   private initializeDayColumns(): void {
//     const today = new Date();
//     const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
//     this.dayColumns = [];
    
//     for (let i = 0; i < 7; i++) {
//       const date = new Date(today);
//       date.setDate(today.getDate() + i);
      
//       let displayName: string;
//       if (i === 0) {
//         displayName = 'Today';
//       } else if (i === 1) {
//         displayName = 'Tomorrow';
//       } else {
//         displayName = dayNames[date.getDay()];
//       }
      
//       this.dayColumns.push({
//         index: i,
//         name: displayName,
//         date: date,
//         tasks: [],
//         newTaskTitle: '',
//         isInputFocused: false,
//         isInputDisabled: false
//       });
//     }
//   }

//   private loadSampleTasks(): void {
//     // Sample tasks for demonstration
//     const sampleTasks: WeekTask[] = [
//       { _id: '1', title: 'Complete project proposal', isCompleted: false, completedOn: null, createdAt: new Date(), dayIndex: 0 },
//       { _id: '2', title: 'Review code changes', isCompleted: true, completedOn: new Date(), createdAt: new Date(), dayIndex: 0 },
//       { _id: '3', title: 'Team meeting', isCompleted: false, completedOn: null, createdAt: new Date(), dayIndex: 1 },
//       { _id: '4', title: 'Client presentation', isCompleted: false, completedOn: null, createdAt: new Date(), dayIndex: 2 }
//     ];

//     // Assign tasks to their respective columns
//     sampleTasks.forEach(task => {
//       this.dayColumns[task.dayIndex].tasks.push(task);
//     });

//     // Sort tasks in each column
//     this.dayColumns.forEach(column => {
//       this.sortTasksInColumn(column);
//     });
//   }

//   private sortTasksInColumn(column: DayColumn): void {
//     column.tasks.sort((a, b) => {
//       // Incomplete tasks first, completed tasks at bottom
//       if (a.isCompleted && !b.isCompleted) return 1;
//       if (!a.isCompleted && b.isCompleted) return -1;
      
//       // Within same status, maintain creation order (newest first)
//       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
//     });
//   }

//   // Input Management
//   onInputFocus(columnIndex: number): void {
//     this.activeFocusedInput = columnIndex;
//     this.dayColumns[columnIndex].isInputFocused = true;
    
//     // Disable all other inputs
//     this.dayColumns.forEach((column, index) => {
//       if (index !== columnIndex) {
//         column.isInputDisabled = true;
//       }
//     });
//   }

//   onInputBlur(columnIndex: number): void {
//     this.dayColumns[columnIndex].isInputFocused = false;
    
//     // Enable all inputs
//     this.dayColumns.forEach(column => {
//       column.isInputDisabled = false;
//     });
    
//     this.activeFocusedInput = null;
//   }

//   onKeyDown(event: KeyboardEvent, columnIndex: number): void {
//     if (event.ctrlKey && event.key === 'Enter') {
//       event.preventDefault();
//       this.addTask(columnIndex);
//     }
//   }

//   // Task Management
//   addTask(columnIndex: number): void {
//     const column = this.dayColumns[columnIndex];
//     const taskTitle = column.newTaskTitle.trim();
    
//     if (!taskTitle) return;

//     const newTask: WeekTask = {
//       _id: `temp-${Date.now()}`,
//       title: taskTitle,
//       isCompleted: false,
//       completedOn: null,
//       createdAt: new Date(),
//       dayIndex: columnIndex
//     };

//     // Add to top of column
//     column.tasks.unshift(newTask);
//     column.newTaskTitle = '';
    
//     // Sort column to maintain order
//     this.sortTasksInColumn(column);
//   }

//   toggleTaskStatus(task: WeekTask): void {
//     task.isCompleted = !task.isCompleted;
//     task.completedOn = task.isCompleted ? new Date() : null;
    
//     // Sort the column after status change
//     const column = this.dayColumns[task.dayIndex];
//     this.sortTasksInColumn(column);
//   }

//   startEditTask(task: WeekTask): void {
//     this.editingTask = {
//       taskId: task._id,
//       title: task.title,
//       dayIndex: task.dayIndex
//     };
//     this.activeDropdownId = null;
//   }

//   saveEditTask(): void {
//     if (!this.editingTask) return;
    
//     const column = this.dayColumns[this.editingTask.dayIndex];
//     const task = column.tasks.find(t => t._id === this.editingTask!.taskId);
    
//     if (task && this.editingTask.title.trim()) {
//       task.title = this.editingTask.title.trim();
//     }
    
//     this.editingTask = null;
//   }

//   cancelEditTask(): void {
//     this.editingTask = null;
//   }

//   async deleteTask(task: WeekTask): Promise<void> {
//     try {
//       const confirmed = await swalHelper.confirmation(
//         'Delete',
//         'Are you sure you want to delete this task?',
//         'warning'
//       );
      
//       this.activeDropdownId = null;
      
//       if (!confirmed.isConfirmed) {
//         return;
//       }

//       const column = this.dayColumns[task.dayIndex];
//       column.tasks = column.tasks.filter(t => t._id !== task._id);
//     } catch (error) {
//       console.error('Error deleting task:', error);
//     }
//   }

//   moveTaskToDay(task: WeekTask, targetDayIndex: number): void {
//     if (task.dayIndex === targetDayIndex) return;
    
//     // Remove from current column
//     const currentColumn = this.dayColumns[task.dayIndex];
//     currentColumn.tasks = currentColumn.tasks.filter(t => t._id !== task._id);
    
//     // Add to target column
//     task.dayIndex = targetDayIndex;
//     const targetColumn = this.dayColumns[targetDayIndex];
//     targetColumn.tasks.unshift(task); // Add to top
    
//     // Sort both columns
//     this.sortTasksInColumn(currentColumn);
//     this.sortTasksInColumn(targetColumn);
    
//     this.activeDropdownId = null;
//   }

//   // Dropdown Management
//   toggleDropdown(taskId: string): void {
//     this.activeDropdownId = this.activeDropdownId === taskId ? null : taskId;
//   }

//   @HostListener('document:click', ['$event'])
//   onDocumentClick(event: MouseEvent): void {
//     const target = event.target as HTMLElement;
//     if (!target.closest('.dropdown-container') && !target.closest('.task-options')) {
//       this.activeDropdownId = null;
//     }
//     if (!target.closest('.edit-task-container')) {
//       if (this.editingTask) {
//         this.saveEditTask();
//       }
//     }
//   }

//   // Drag and Drop
//   onDragStart(event: DragEvent, task: WeekTask): void {
//     this.draggedTask = task;
//     event.dataTransfer!.effectAllowed = 'move';
//   }

//   onDragOver(event: DragEvent, columnIndex: number): void {
//     event.preventDefault();
//     event.dataTransfer!.dropEffect = 'move';
//     this.dragOverColumnIndex = columnIndex;
    
//     // Auto-scroll logic
//     this.handleAutoScroll(event);
//   }

//   onDragLeave(event: DragEvent): void {
//     // Only clear if we're truly leaving the column
//     const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
//     const x = event.clientX;
//     const y = event.clientY;
    
//     if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
//       this.dragOverColumnIndex = null;
//     }
//   }

//   onDrop(event: DragEvent, targetColumnIndex: number): void {
//     event.preventDefault();
    
//     if (!this.draggedTask || this.draggedTask.dayIndex === targetColumnIndex) {
//       this.resetDragState();
//       return;
//     }

//     this.moveTaskToDay(this.draggedTask, targetColumnIndex);
//     this.resetDragState();
//   }

//   onDragEnd(): void {
//     this.resetDragState();
//   }

//   private resetDragState(): void {
//     this.draggedTask = null;
//     this.dragOverColumnIndex = null;
//     this.clearAutoScroll();
//   }

//   private handleAutoScroll(event: DragEvent): void {
//     if (!this.kanbanContainer) return;
    
//     const container = this.kanbanContainer.nativeElement;
//     const rect = container.getBoundingClientRect();
//     const scrollThreshold = 100;
//     const scrollSpeed = 5;
    
//     const x = event.clientX - rect.left;
    
//     this.clearAutoScroll();
    
//     if (x < scrollThreshold) {
//       // Scroll left
//       this.autoScrollInterval = setInterval(() => {
//         container.scrollLeft -= scrollSpeed;
//       }, 16);
//     } else if (x > rect.width - scrollThreshold) {
//       // Scroll right
//       this.autoScrollInterval = setInterval(() => {
//         container.scrollLeft += scrollSpeed;
//       }, 16);
//     }
//   }

//   private clearAutoScroll(): void {
//     if (this.autoScrollInterval) {
//       clearInterval(this.autoScrollInterval);
//       this.autoScrollInterval = null;
//     }
//   }

//   // Utility methods
//   trackByTaskId(index: number, task: WeekTask): string {
//     return task._id;
//   }

//   trackByColumnIndex(index: number, column: DayColumn): number {
//     return column.index;
//   }

//   getTasksForColumn(columnIndex: number): WeekTask[] {
//     return this.dayColumns[columnIndex]?.tasks || [];
//   }

//   ngOnDestroy(): void {
//     this.clearAutoScroll();
//   }
// }

// import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
// import { PersonalTaskService } from 'src/app/services/personal-task.service';
// import { swalHelper } from 'src/app/core/constants/swal-helper';

// interface WeekTask {
//   _id: string;
//   title: string;
//   dueOn: Date | null;
//   isCompleted: boolean;
//   completedOn: Date | null;
//   createdAt: Date;
//   dayIndex: number;
// }

// interface DayColumn {
//   index: number;
//   name: string;
//   date: Date;
//   tasks: WeekTask[];
//   newTaskTitle: string;
//   isInputFocused: boolean;
//   isInputDisabled: boolean;
// }

// @Component({
//   selector: 'app-myweektask',
//   templateUrl: './myweektask.component.html',
//   styleUrl: './myweektask.component.scss'
// })
// export class MyweektaskComponent implements OnInit {
//   @ViewChild('kanbanContainer') kanbanContainer!: ElementRef<HTMLDivElement>;

//   // Day columns data
//   dayColumns: DayColumn[] = [];
//   isLoading: boolean = false;
  
//   // Task management
//   editingTask: { taskId: string; title: string; dayIndex: number } | null = null;
  
//   // UI State
//   activeDropdownId: string | null = null;
//   activeFocusedInput: number | null = null;
  
//   // Drag and Drop
//   draggedTask: WeekTask | null = null;
//   dragOverColumnIndex: number | null = null;
  
//   // Auto scroll
//   autoScrollInterval: any = null;
//   autoScrollSpeed: number = 15;

//   constructor(
//     private personalTaskService: PersonalTaskService,
//     private storage: AppStorage
//   ) { }

//   async ngOnInit(): Promise<void> {
//     this.initializeDayColumns();
//     await this.fetchWeekTasks();
//   }

//   private initializeDayColumns(): void {
//     const today = new Date();
//     const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
//     this.dayColumns = [];
    
//     for (let i = 0; i < 7; i++) {
//       const date = new Date(today);
//       date.setDate(today.getDate() + i);
      
//       let displayName: string;
//       if (i === 0) {
//         displayName = 'Today';
//       } else if (i === 1) {
//         displayName = 'Tomorrow';
//       } else {
//         displayName = dayNames[date.getDay()];
//       }
      
//       this.dayColumns.push({
//         index: i,
//         name: displayName,
//         date: date,
//         tasks: [],
//         newTaskTitle: '',
//         isInputFocused: false,
//         isInputDisabled: false
//       });
//     }
//   }

//   // Main API Call Implementation
//   async fetchWeekTasks(): Promise<void> {
//     if (this.isLoading) return;

//     this.isLoading = true;
//     try {
//       const response = await this.personalTaskService.getPersonalWeekTaskDetails();

//       if (response) {
//         this.mapApiDataToColumns(response);
//       }
//     } catch (error) {
//       console.error('Error fetching week tasks:', error);
//     } finally {
//       this.isLoading = false;
//     }
//   }

//   private mapApiDataToColumns(data: any): void {
//     // Clear existing tasks
//     this.dayColumns.forEach(column => column.tasks = []);

//     // Map API day keys to column indices
//     const dayKeyToIndex: { [key: string]: number } = {
//       'today': 0,
//       'tomorrow': 1,
//       'Monday': this.getDayIndex('Monday'),
//       'Tuesday': this.getDayIndex('Tuesday'),
//       'Wednesday': this.getDayIndex('Wednesday'),
//       'Thursday': this.getDayIndex('Thursday'),
//       'Friday': this.getDayIndex('Friday'),
//       'Saturday': this.getDayIndex('Saturday'),
//       'Sunday': this.getDayIndex('Sunday')
//     };

//     // Process each day from API response
//     Object.keys(data).forEach(dayKey => {
//       const tasks = data[dayKey] || [];
//       const columnIndex = dayKeyToIndex[dayKey];

//       if (columnIndex !== undefined && columnIndex < this.dayColumns.length) {
//         const mappedTasks = tasks.map((task: any) => ({
//           _id: task._id,
//           title: task.title,
//           dueOn: task.dueOn,
//           isCompleted: task.isCompleted,
//           completedOn: task.completedOn,
//           createdAt: task.createdAt,
//           dayIndex: columnIndex
//         }));

//         this.dayColumns[columnIndex].tasks = mappedTasks;
//         this.sortTasksInColumn(this.dayColumns[columnIndex]);
//       }
//     });
//   }

//   private getDayIndex(dayName: string): number {
//     const today = new Date();
//     const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//     const targetDayIndex = dayNames.indexOf(dayName);
    
//     for (let i = 0; i < 7; i++) {
//       const date = new Date(today);
//       date.setDate(today.getDate() + i);
//       if (date.getDay() === targetDayIndex) {
//         return i;
//       }
//     }
//     return -1;
//   }

//   private sortTasksInColumn(column: DayColumn): void {
//     column.tasks.sort((a, b) => {
//       // Incomplete tasks first, completed tasks at bottom
//       if (a.isCompleted && !b.isCompleted) return 1;
//       if (!a.isCompleted && b.isCompleted) return -1;
      
//       // Within same status, maintain creation order (newest first)
//       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
//     });
//   }

//   // Input Management
//   onInputFocus(columnIndex: number): void {
//     this.activeFocusedInput = columnIndex;
//     this.dayColumns[columnIndex].isInputFocused = true;
    
//     // Disable all other inputs
//     this.dayColumns.forEach((column, index) => {
//       if (index !== columnIndex) {
//         column.isInputDisabled = true;
//       }
//     });
//   }

//   onInputBlur(columnIndex: number): void {
//     setTimeout(() => {
//       this.dayColumns[columnIndex].isInputFocused = false;
//       this.dayColumns.forEach(column => {
//         column.isInputDisabled = false;
//       });
//       this.activeFocusedInput = null;
//     }, 100);
//   }

//   onKeyDown(event: KeyboardEvent, columnIndex: number): void {
//     if (event.ctrlKey && event.key === 'Enter') {
//       event.preventDefault();
//       this.addTask(columnIndex);
//     }
//   }

//   addTask(columnIndex: number): void {
//     const column = this.dayColumns[columnIndex];
//     const taskTitle = column.newTaskTitle.trim();
    
//     if (!taskTitle) return;

//     const newTask: WeekTask = {
//       _id: `temp-${Date.now()}`,
//       title: taskTitle,
//       dueOn: null,
//       isCompleted: false,
//       completedOn: null,
//       createdAt: new Date(),
//       dayIndex: columnIndex
//     };

//     // Add to top of column
//     column.tasks.unshift(newTask);
//     column.newTaskTitle = '';
    
//     // Explicitly set input focus state
//     column.isInputFocused = true;

//     // Sort column to maintain order
//     this.sortTasksInColumn(column);
    
//     // Keep input focused after adding task
//     setTimeout(() => {
//       const inputElement = document.querySelector(`textarea[data-column="${columnIndex}"]`) as HTMLTextAreaElement;
//       if (inputElement) {
//         inputElement.focus();
//       }
//     }, 50);
//   }

//   toggleTaskStatus(task: WeekTask): void {
//     task.isCompleted = !task.isCompleted;
//     task.completedOn = task.isCompleted ? new Date() : null;
    
//     // Sort the column after status change
//     const column = this.dayColumns[task.dayIndex];
//     this.sortTasksInColumn(column);
//   }

//   startEditTask(task: WeekTask): void {
//     this.editingTask = {
//       taskId: task._id,
//       title: task.title,
//       dayIndex: task.dayIndex
//     };
//     this.activeDropdownId = null;
//   }

//   saveEditTask(): void {
//     if (!this.editingTask) return;
    
//     const column = this.dayColumns[this.editingTask.dayIndex];
//     const task = column.tasks.find(t => t._id === this.editingTask!.taskId);
    
//     if (task && this.editingTask.title.trim()) {
//       task.title = this.editingTask.title.trim();
//     }
    
//     this.editingTask = null;
//   }

//   cancelEditTask(): void {
//     this.editingTask = null;
//   }

//   async deleteTask(task: WeekTask): Promise<void> {
//     try {
//       const confirmed = await swalHelper.confirmation(
//         'Delete',
//         'Are you sure you want to delete this task?',
//         'warning'
//       );
      
//       this.activeDropdownId = null;
      
//       if (!confirmed.isConfirmed) {
//         return;
//       }

//       const column = this.dayColumns[task.dayIndex];
//       column.tasks = column.tasks.filter(t => t._id !== task._id);

//      await this.personalTaskService.DeletePersonalTask({ taskId: task._id });



//     } catch (error) {
//       console.error('Error deleting task:', error);
//     }
//   }

//   moveTaskToDay(task: WeekTask, targetDayIndex: number): void {
//     if (task.dayIndex === targetDayIndex) return;
    
//     // Remove from current column
//     const currentColumn = this.dayColumns[task.dayIndex];
//     currentColumn.tasks = currentColumn.tasks.filter(t => t._id !== task._id);
    
//     // Add to target column
//     task.dayIndex = targetDayIndex;
//     const targetColumn = this.dayColumns[targetDayIndex];
//     targetColumn.tasks.unshift(task);
    
//     // Sort both columns
//     this.sortTasksInColumn(currentColumn);
//     this.sortTasksInColumn(targetColumn);
    
//     this.activeDropdownId = null;
//   }

//   // Dropdown Management
//   toggleDropdown(taskId: string): void {
//     this.activeDropdownId = this.activeDropdownId === taskId ? null : taskId;
//   }

//   @HostListener('document:click', ['$event'])
//   onDocumentClick(event: MouseEvent): void {
//     const target = event.target as HTMLElement;
//     if (!target.closest('.dropdown-container') && !target.closest('.task-options')) {
//       this.activeDropdownId = null;
//     }
//     if (!target.closest('.edit-task-container')) {
//       if (this.editingTask) {
//         this.saveEditTask();
//       }
//     }
//   }

//   // Drag and Drop
//   onDragStart(event: DragEvent, task: WeekTask): void {
//     this.draggedTask = task;
//     event.dataTransfer!.effectAllowed = 'move';
//     this.kanbanContainer.nativeElement.classList.add('dragging');
    
//     const dragElement = event.target as HTMLElement;
//     const clone = dragElement.cloneNode(true) as HTMLElement;
    
//     clone.style.position = 'absolute';
//     clone.style.top = '-1000px';
//     clone.style.left = '-1000px';
//     clone.style.width = dragElement.offsetWidth + 'px';
//     clone.style.transform = 'rotate(3deg)';
//     clone.style.opacity = '0.95';
//     clone.style.backgroundColor = '#ffffff';
//     clone.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
//     clone.style.border = '2px solid #3b82f6';
//     clone.style.borderRadius = '8px';
//     clone.style.zIndex = '9999';
    
//     document.body.appendChild(clone);
//     event.dataTransfer!.setDragImage(clone, dragElement.offsetWidth / 2, 25);
    
//     setTimeout(() => {
//       if (document.body.contains(clone)) {
//         document.body.removeChild(clone);
//       }
//     }, 1);
//   }

//   onDragOver(event: DragEvent, columnIndex: number): void {
//     event.preventDefault();
//     event.dataTransfer!.dropEffect = 'move';
//     this.dragOverColumnIndex = columnIndex;
//     this.handleAutoScroll(event);
//   }

//   onDragLeave(event: DragEvent): void {
//     const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
//     const x = event.clientX;
//     const y = event.clientY;
    
//     if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
//       this.dragOverColumnIndex = null;
//     }
//   }

//   onDrop(event: DragEvent, targetColumnIndex: number): void {
//     event.preventDefault();
    
//     if (!this.draggedTask || this.draggedTask.dayIndex === targetColumnIndex) {
//       this.resetDragState();
//       return;
//     }

//     this.moveTaskToDay(this.draggedTask, targetColumnIndex);
//     this.resetDragState();
//   }

//   onDragEnd(): void {
//     this.resetDragState();
//     this.kanbanContainer.nativeElement.classList.remove('dragging');
//   }

//   private resetDragState(): void {
//     this.draggedTask = null;
//     this.dragOverColumnIndex = null;
//     this.clearAutoScroll();
//   }

//   private handleAutoScroll(event: DragEvent): void {
//     if (!this.kanbanContainer) return;

//     const container = this.kanbanContainer.nativeElement;
//     const rect = container.getBoundingClientRect();
//     const scrollThreshold = 250;

//     const x = event.clientX - rect.left;

//     this.clearAutoScroll();

//     const scrollStep = () => {
//       if (x < scrollThreshold) {
//         container.scrollLeft -= this.autoScrollSpeed;
//         if (container.scrollLeft > 0) {
//           this.autoScrollInterval = requestAnimationFrame(scrollStep);
//         }
//       } else if (x > rect.width - scrollThreshold) {
//         container.scrollLeft += this.autoScrollSpeed;
//         if (container.scrollLeft < container.scrollWidth - container.clientWidth) {
//           this.autoScrollInterval = requestAnimationFrame(scrollStep);
//         }
//       }
//     };

//     this.autoScrollInterval = requestAnimationFrame(scrollStep);
//   }

//   private clearAutoScroll(): void {
//     if (this.autoScrollInterval) {
//       cancelAnimationFrame(this.autoScrollInterval);
//       this.autoScrollInterval = null;
//     }
//   }

//   // Utility methods
//   trackByTaskId(index: number, task: WeekTask): string {
//     return task._id;
//   }

//   trackByColumnIndex(index: number, column: DayColumn): number {
//     return column.index;
//   }

//   getTasksForColumn(columnIndex: number): WeekTask[] {
//     return this.dayColumns[columnIndex]?.tasks || [];
//   }

//   isTaskBeingDragged(task: WeekTask): boolean {
//     return this.draggedTask?._id === task._id;
//   }

//   shouldHideTask(task: WeekTask): boolean {
//     return this.isTaskBeingDragged(task);
//   }

//   ngOnDestroy(): void {
//     this.clearAutoScroll();
//   }
// }




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
    column.tasks.sort((a, b) => {
      // Incomplete tasks first, completed tasks at bottom
      if (a.isCompleted && !b.isCompleted) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;
      
      // Within same status, maintain creation order (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      this.addTask(columnIndex);
    }
  }

  addTask(columnIndex: number): void {
    const column = this.dayColumns[columnIndex];
    const taskTitle = column.newTaskTitle.trim();
    
    if (!taskTitle) return;

    const newTask: WeekTask = {
      _id: `temp-${Date.now()}`,
      title: taskTitle,
      dueOn: null,
      isCompleted: false,
      completedOn: null,
      createdAt: new Date(),
      dayIndex: columnIndex
    };

    // Add to top of column
    column.tasks.unshift(newTask);
    column.newTaskTitle = '';
    
    // Explicitly set input focus state
    column.isInputFocused = true;

    // Sort column to maintain order
    this.sortTasksInColumn(column);
    
    // Keep input focused after adding task
    setTimeout(() => {
      const inputElement = document.querySelector(`textarea[data-column="${columnIndex}"]`) as HTMLTextAreaElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 50);
  }

  toggleTaskStatus(task: WeekTask): void {
    task.isCompleted = !task.isCompleted;
    task.completedOn = task.isCompleted ? new Date() : null;
    
    // Sort the column after status change
    const column = this.dayColumns[task.dayIndex];
    this.sortTasksInColumn(column);
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

  moveTaskToDay(task: WeekTask, targetDayIndex: number): void {
    if (task.dayIndex === targetDayIndex) return;
    
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

  onDrop(event: DragEvent, targetColumnIndex: number): void {
    event.preventDefault();
    
    if (!this.draggedTask || this.draggedTask.dayIndex === targetColumnIndex) {
      this.resetDragState();
      return;
    }

    this.moveTaskToDay(this.draggedTask, targetColumnIndex);
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