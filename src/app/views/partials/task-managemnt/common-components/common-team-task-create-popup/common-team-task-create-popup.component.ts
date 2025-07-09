import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';
import { MemberDetailDropdownComponent } from '../add-members-dropdown/add-members-dropdown.component';
import { TaskService } from 'src/app/services/task.service';

interface TaskMember {
  _id: string;
  name: string;
  emailId: string;
  profileImage: string;
  role: string;
}

interface CreateTaskData {
  title: string;
  description: string;
  status: string;
  column: string;
  dueDate: string | null;
  assignedTo: TaskMember[];
  board: string;
  category: string | null;
  visibility: 'public' | 'private';
}

interface Column {
  _id: string;
  title: string;
  position: number;
  canEdit: boolean;
  canDelete: boolean;
}

@Component({
  selector: 'app-common-team-task-create-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxEditorModule,
    MemberDetailDropdownComponent,
  ],
  templateUrl: './common-team-task-create-popup.component.html',
  styleUrl: './common-team-task-create-popup.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CommonTeamTaskCreatePopupComponent implements OnInit, OnDestroy {
  @Input() boardId: string = '';
  @Input() isVisible: boolean = false;

  @Output() taskCreated = new EventEmitter<CreateTaskData>();
  @Output() popupClosed = new EventEmitter<void>();

  // Task creation form data
  taskData: CreateTaskData = {
    title: '',
    description: '',
    status: 'normal',
    column: '',
    dueDate: null,
    assignedTo: [],
    board: '',
    category: null,
    visibility: 'public',
  };

  // UI State
  isCreating = false;
  showCustomDatePicker = false;
  currentCalendarDate = new Date();
  dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  calendarDays: any[] = [];
  isLoading = true;
  columnOptions: Column[] = [];

  // Description editor
  editor?: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code'],
    ['ordered_list', 'bullet_list'],
    ['link'],
  ];

  // Status options
  statusOptions = [
    {
      value: 'normal',
      label: 'Normal',
      color: 'tw-bg-gray-100 tw-text-gray-800',
    },
    {
      value: 'ready',
      label: 'Ready',
      color: 'tw-bg-blue-100 tw-text-blue-800',
    },
    {
      value: 'in progress',
      label: 'In Progress',
      color: 'tw-bg-yellow-100 tw-text-yellow-800',
    },
    {
      value: 'need review',
      label: 'Need Review',
      color: 'tw-bg-purple-100 tw-text-purple-800',
    },
    {
      value: 'need rework',
      label: 'Need Rework',
      color: 'tw-bg-orange-100 tw-text-orange-800',
    },
    {
      value: 'on hold',
      label: 'On Hold',
      color: 'tw-bg-red-100 tw-text-red-800',
    },
    {
      value: 'blocked',
      label: 'Blocked',
      color: 'tw-bg-red-100 tw-text-red-800',
    },
  ];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadColumnOptions();
    this.initializeEditor();
    this.taskData.board = this.boardId;
  }

  async loadColumnOptions() {
    const response = await this.taskService.getColumns({
      type: 'board',
      boardId: this.boardId,
    });

    if (response) {
      const filteredColumns = response.filter((column: any) => column.canEdit);

      const sortedColumns = filteredColumns.sort(
        (a: any, b: any) => a.position - b.position
      );

      this.taskData.column = sortedColumns[0]._id;

      this.columnOptions = sortedColumns;

      console.log('Column options loaded:', this.columnOptions);
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  private initializeEditor(): void {
    this.editor = new Editor();
  }

  // Form validation
  isFormValid(): boolean {
    return this.taskData.title.trim().length > 0;
  }

  // Task creation
  async createTask(): Promise<void> {
    if (!this.isFormValid()) return;

    this.isCreating = true;

    try {
      // making this assignedTo to array of _id strings
      const assignedTo = this.taskData.assignedTo.map(
        (member: TaskMember) => member._id
      );

      let payload = {
        title: this.taskData.title,
        description: this.taskData.description,
        status: this.taskData.status,
        column: this.taskData.column,
        dueDate: this.taskData.dueDate,
        assignedTo: assignedTo,
        board: this.taskData.board,
        category: this.taskData.category,
        visibility: this.taskData.visibility,
      };

      // console.log('Creating task:', payload);

      // Make API call to create task
      const response = await this.taskService.createCompleteTeamTask(payload);

      if (response) {
        // Emit the task data to parent component
        this.taskCreated.emit(response);

        // Reset form and close popup
        this.resetForm();
        this.closePopup();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      this.isCreating = false;
    }
  }

  // Form reset
  resetForm(): void {
    this.taskData = {
      title: '',
      description: '',
      status: 'normal',
      column: this.columnOptions[0]._id,
      dueDate: null,
      assignedTo: [],
      board: this.boardId,
      category: null,
      visibility: 'public',
    };
  }

  // Popup management
  closePopup(): void {
    this.resetForm();
    this.popupClosed.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closePopup();
    }
  }

  // Member assignment
  onMembersUpdated(selectedMembers: TaskMember[] | any): void {
    this.taskData.assignedTo = selectedMembers;
  }

  // Date picker functionality
  toggleCustomDatePicker(): void {
    this.showCustomDatePicker = !this.showCustomDatePicker;
    if (this.showCustomDatePicker) {
      this.currentCalendarDate = this.taskData.dueDate
        ? new Date(this.taskData.dueDate)
        : new Date();
      this.generateCalendarDays();
      this.addDatePickerClickListener();
    }
  }

  generateCalendarDays(): void {
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    this.calendarDays = [];

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      this.calendarDays.push({
        date: day,
        fullDate: date,
        isCurrentMonth: true,
        isSelected: this.isDateSelected(date),
        isToday: this.isToday(date),
      });
    }
  }

  isDateSelected(date: Date): boolean {
    if (!this.taskData.dueDate) return false;
    const taskDate = new Date(this.taskData.dueDate);
    return date.toDateString() === taskDate.toDateString();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  getDateButtonClass(day: any): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastDate = day.fullDate < today;

    if (isPastDate) {
      return 'tw-text-gray-400 tw-cursor-not-allowed';
    } else if (day.isSelected) {
      return 'tw-bg-blue-500 tw-text-white tw-font-semibold';
    } else if (day.isToday) {
      return 'tw-border tw-border-blue-500 tw-text-blue-500 tw-font-semibold';
    } else {
      return 'tw-text-gray-700 hover:tw-bg-gray-100';
    }
  }

  selectDate(day: any): Promise<void> {
    if (!day.isCurrentMonth) return Promise.resolve();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (day.fullDate < today) {
      return Promise.resolve();
    }

    this.taskData.dueDate = day.fullDate.toISOString();
    this.showCustomDatePicker = false;
    this.currentCalendarDate = new Date(day.fullDate);

    return Promise.resolve();
  }

  previousMonth(): void {
    this.currentCalendarDate = new Date(
      this.currentCalendarDate.getFullYear(),
      this.currentCalendarDate.getMonth() - 1,
      1
    );
    this.generateCalendarDays();
  }

  nextMonth(): void {
    this.currentCalendarDate = new Date(
      this.currentCalendarDate.getFullYear(),
      this.currentCalendarDate.getMonth() + 1,
      1
    );
    this.generateCalendarDays();
  }

  clearDate(): void {
    this.taskData.dueDate = null;
    this.showCustomDatePicker = false;
  }

  setToday(): void {
    const today = new Date();
    this.taskData.dueDate = today.toISOString();
    this.showCustomDatePicker = false;
  }

  private addDatePickerClickListener(): void {
    setTimeout(() => {
      const handleClick = (event: Event) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.date-picker-popup')) {
          this.showCustomDatePicker = false;
          document.removeEventListener('click', handleClick);
        }
      };
      document.addEventListener('click', handleClick);
    }, 0);
  }

  getDueDateDisplay(): { text: string; color: string } {
    if (!this.taskData.dueDate) {
      return {
        text: 'Set due date',
        color: 'tw-bg-gray-50 tw-text-gray-700 tw-border tw-border-gray-200',
      };
    }

    const dueDate = new Date(this.taskData.dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dueDateOnly = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate()
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const tomorrowOnly = new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate()
    );

    if (dueDateOnly.getTime() === todayOnly.getTime()) {
      return {
        text: 'Due Today',
        color:
          'tw-bg-orange-50 tw-text-orange-700 tw-border tw-border-orange-200',
      };
    } else if (dueDateOnly.getTime() === tomorrowOnly.getTime()) {
      return {
        text: 'Due Tomorrow',
        color:
          'tw-bg-yellow-50 tw-text-yellow-700 tw-border tw-border-yellow-200',
      };
    } else {
      const month = dueDate
        .toLocaleDateString('en-US', { month: 'short' })
        .toUpperCase();
      const day = dueDate.getDate();
      const year =
        dueDate.getFullYear() !== today.getFullYear()
          ? ` ${dueDate.getFullYear()}`
          : '';
      return {
        text: `DUE ${month} ${day}${year}`,
        color: 'tw-bg-green-50 tw-text-green-700 tw-border tw-border-green-200',
      };
    }
  }

  getStatusOption(status: string) {
    return (
      this.statusOptions.find((option) => option.value === status) ||
      this.statusOptions[0]
    );
  }

  // Form field handlers
  onTitleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey && this.isFormValid()) {
      event.preventDefault();
      this.createTask();
    }
  }
}
