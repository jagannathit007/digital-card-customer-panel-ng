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
}

type TabType = 'myday' | 'today' | 'nodedate';

@Component({
  selector: 'app-mydaytask',
  templateUrl: './mydaytask.component.html',
  styleUrl: './mydaytask.component.scss',
})
export class MydaytaskComponent implements OnInit {
  @ViewChild('editTaskInput') editTaskInput!: ElementRef<HTMLTextAreaElement>;

  // Task Management Properties
  allTasks: PersonalTask[] = [];
  todayTasks: PersonalTask[] = [];
  noDateTasks: PersonalTask[] = [];
  newTaskTitle: string = '';
  editingTaskId: string | null = null;
  editingTaskTitle: string = '';

  // Tab Management
  activeTab: TabType = 'today';

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

  constructor(
    private personalTaskService: PersonalTaskService,
    private storage: AppStorage
  ) {}

  async ngOnInit(): Promise<void> {
    this.userName =
      this.storage.get(teamMemberCommon.TEAM_MEMBER_DATA)?.name || 'User';
    await this.fetchMyDayTasks();
    await this.loadTabData();
  }

  // Tab Management Methods
  async switchTab(tab: TabType): Promise<void> {
    if (this.activeTab === tab) return;

    this.activeTab = tab;
    this.activeDropdownId = null;
    await this.loadTabData();
  }

  async loadTabData(): Promise<void> {
    switch (this.activeTab) {
      case 'myday':
        await this.fetchMyDayTasks();
        break;
      case 'today':
        await this.fetchTodayTasks();
        break;
      case 'nodedate':
        await this.fetchNoDateTasks();
        break;
    }
  }

  getCurrentTabTasks(): PersonalTask[] {
    switch (this.activeTab) {
      case 'myday':
        return this.allTasks;
      case 'today':
        return this.todayTasks;
      case 'nodedate':
        return this.noDateTasks;
      default:
        return [];
    }
  }

  // Empty State Messages
  getEmptyStateTitle(): string {
    switch (this.activeTab) {
      case 'myday':
        return 'No tasks for today';
      case 'today':
        return 'No tasks created today';
      case 'nodedate':
        return 'No tasks without due date';
      default:
        return 'No tasks yet';
    }
  }

  getEmptyStateMessage(): string {
    switch (this.activeTab) {
      case 'myday':
        return 'Add your first task below to get started!';
      case 'today':
        return 'Tasks you create today will appear here';
      case 'nodedate':
        return 'Tasks without due dates will appear here';
      default:
        return 'Add your first task below to get started!';
    }
  }

  // Date and Time Helper Methods
  getCurrentDate(): string {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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

    // Only show next task for "My Day" tab
    // if (this.activeTab !== 'myday') return null;

    // Filter tasks that have due date in future and are not completed
    const futureTasks = this.allTasks.filter((task) => {
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
      hour12: true,
    });
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatCompletedTime(completedOn: Date | null): string {
    if (!completedOn) return '';
    const d = new Date(completedOn);
    return (
      'at ' +
      d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    );
  }

  isDueOverdue(dueOn: Date | string | null): boolean {
    if (!dueOn) return false;
    return new Date(dueOn).getTime() < Date.now();
  }

  // Input Event Handlers
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

  canSendTask(): boolean {
    return this.newTaskTitle.trim().length > 0 && !this.isSubmitting;
  }

  // Data Fetching Methods
  async fetchMyDayTasks(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      const response = await this.personalTaskService.getPersonalTaskDetails(
        {}
      );

      if (response && response.tasks && Array.isArray(response.tasks)) {
        this.allTasks = response.tasks;
      }
    } catch (error) {
      console.error('Error fetching my day tasks:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async fetchTodayTasks(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      const response =
        await this.personalTaskService.getPersonalAllTodayTaskDetails({});

      if (response && response.tasks && Array.isArray(response.tasks)) {
        this.todayTasks = response.tasks;
      }
    } catch (error) {
      console.error('Error fetching today tasks:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async fetchNoDateTasks(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      const response = await this.personalTaskService.getAllTasksWithoutDueDate(
        {}
      );

      if (response && Array.isArray(response)) {
        this.noDateTasks = response;
      } else if (response && response.tasks && Array.isArray(response.tasks)) {
        this.noDateTasks = response.tasks;
      }
    } catch (error) {
      console.error('Error fetching no date tasks:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Task Management Methods
  async addTask(): Promise<void> {
    if (!this.canSendTask()) return;

    this.isSubmitting = true;
    const taskTitle = this.newTaskTitle.trim();

    // const tempTask: PersonalTask = {
    //   _id: `temp-${Date.now()}`,
    //   title: taskTitle,
    //   dueOn: null,
    //   isCompleted: false,
    //   completedOn: null,
    //   createdAt: new Date(),
    // };

    // // Add to current tab's task list
    const currentTasks = this.getCurrentTabTasks();
    // currentTasks.unshift(tempTask);
    this.newTaskTitle = '';

    try {
      const response = await this.personalTaskService.AddPersonalTask({
        title: taskTitle,
      });

      if (response) {
        // const tempIndex = currentTasks.findIndex((t) => t._id === tempTask._id);
        // if (tempIndex !== -1) {
        //   currentTasks[tempIndex] = response;
        // }

        // Refresh the current tab data to ensure proper ordering
        await this.loadTabData();
      } else {
        // Remove temp task if API failed
        // const filteredTasks = currentTasks.filter(
        //   (t) => t._id !== tempTask._id
        // );
        // this.updateCurrentTabTasks(filteredTasks);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      // Remove temp task if API failed
      // const filteredTasks = currentTasks.filter((t) => t._id !== tempTask._id);
      // this.updateCurrentTabTasks(filteredTasks);
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

    const currentTasks = this.getCurrentTabTasks();
    const taskIndex = currentTasks.findIndex(
      (t) => t._id === this.editingTaskId
    );
    if (taskIndex !== -1) {
      currentTasks[taskIndex].title = updatedTitle;
    }

    try {
      const response = await this.personalTaskService.UpdatePersonalTask({
        taskId: this.editingTaskId,
        title: updatedTitle,
      });

      if (response) {
        this.cancelEdit();
        await this.loadTabData();
      } else {
        if (taskIndex !== -1) {
          currentTasks[taskIndex].title = originalTitle;
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      if (taskIndex !== -1) {
        currentTasks[taskIndex].title = originalTitle;
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

    const currentTasks = this.getCurrentTabTasks();

    // Move task to appropriate position
    if (task.isCompleted) {
      // Move task to the top of all completed task and bottom of incomplete tasks
      let filteredTasks = currentTasks.filter((t) => t._id !== task._id);

      const filteredIncompleteTasks = filteredTasks.filter(
        (t) => !t.isCompleted
      );
      const filteredCompletedTasks = filteredTasks.filter((t) => t.isCompleted);
      filteredCompletedTasks.unshift(task);

      filteredTasks = [...filteredIncompleteTasks, ...filteredCompletedTasks];
      this.updateCurrentTabTasks(filteredTasks);
    } else {
      // Move incomplete task to top
      console.log(
        'duedate : ',
        task.dueOn,
        ',current date : ',
        new Date().getDate(),
        'task date : ',
        new Date(task.dueOn || task.createdAt).getDate()
      );
      if (
        this.activeTab !== 'myday' ||
        (task.dueOn && new Date(task.dueOn).getDate() === new Date().getDate())
      ) {
        let filteredTasks = currentTasks.filter((t) => t._id !== task._id);

        let filteredCompletedTasks = filteredTasks.filter((t) => t.isCompleted);
        let filteredIncompleteTasks = filteredTasks.filter(
          (t) => !t.isCompleted
        );
        const tasksWithDueDate = filteredIncompleteTasks.filter(
          (task) => task.dueOn
        );
        const tasksWithoutDueDate = filteredIncompleteTasks.filter(
          (task) => !task.dueOn
        );

        if (task.dueOn) {
          tasksWithDueDate.unshift(task);

          tasksWithDueDate.sort((a, b) => {
            const timeA = new Date(a.dueOn || a.createdAt).getTime();
            const timeB = new Date(b.dueOn || b.createdAt).getTime();
            return timeA - timeB;
          });
        } else {
          tasksWithoutDueDate.unshift(task);

          tasksWithoutDueDate.sort((a, b) => {
            const timeA = new Date(a.updatedAt).getTime();
            const timeB = new Date(b.updatedAt).getTime();
            return timeA - timeB;
          });
        }

        filteredTasks = [
          ...tasksWithDueDate,
          ...tasksWithoutDueDate,
          ...filteredCompletedTasks,
        ];

        this.updateCurrentTabTasks(filteredTasks);
      } else {
        // remove from the list
        const filteredTasks = currentTasks.filter((t) => t._id !== task._id);
        this.updateCurrentTabTasks(filteredTasks);
      }
    }

    try {
      const response = await this.personalTaskService.TogglePersonalTaskStatus({
        taskId: task._id,
      });

      if (!response) {
        // Revert changes if API failed
        task.isCompleted = originalStatus;
        task.completedOn = originalCompletedOn;
        // Reload fresh data
        await this.loadTabData();
      }
    } catch (error) {
      console.error('Error toggling task status:', error);
      // Revert changes if API failed
      task.isCompleted = originalStatus;
      task.completedOn = originalCompletedOn;
      // Reload fresh data
      await this.loadTabData();
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

      const currentTasks = this.getCurrentTabTasks();
      const originalTasks = [...currentTasks];
      const filteredTasks = currentTasks.filter(
        (t: PersonalTask) => t._id !== taskId
      );
      this.updateCurrentTabTasks(filteredTasks);

      const response = await this.personalTaskService.DeletePersonalTask({
        taskId: taskId,
      });

      if (response) {
        await this.loadTabData();
      } else {
        this.showFullScreenLoader = true;
        this.updateCurrentTabTasks(originalTasks);
        await this.loadTabData();
        this.showFullScreenLoader = false;
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      this.showFullScreenLoader = true;
      await this.loadTabData();
      this.showFullScreenLoader = false;
    }
  }

  // Helper method to update current tab's tasks
  private updateCurrentTabTasks(tasks: PersonalTask[]): void {
    switch (this.activeTab) {
      case 'myday':
        this.allTasks = tasks;
        break;
      case 'today':
        this.todayTasks = tasks;
        break;
      case 'nodedate':
        this.noDateTasks = tasks;
        break;
    }
  }

  // UI Event Handlers
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
    const currentTasks = this.getCurrentTabTasks();
    const taskIndex = currentTasks.findIndex(
      (t) => t._id === this.selectedTaskId
    );
    if (taskIndex !== -1) {
      currentTasks[taskIndex].dueOn = newDateTime;
    }

    this.closeDateTimePicker();

    // Refresh data to get proper order
    this.loadTabData();
  }
}
