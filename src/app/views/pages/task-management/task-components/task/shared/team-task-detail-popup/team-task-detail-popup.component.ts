import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';
import { AddCommentsComponent } from 'src/app/views/partials/task-managemnt/common-components/add-comments/add-comments.component';
import { TaskService } from 'src/app/services/task.service';

interface TaskMember {
  _id: string;
  name: string;
  profileImage: string;
  role: string;
}

interface TaskComment {
  _id: string;
  text: string;
  mentionedMembers: string[];
  createdBy: TaskMember;
  createdAt: string;
  isDeleted: boolean;
}

interface TaskAttachment {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedFrom: 'storage' | 'url';
  uploadedBy: TaskMember;
  createdAt: string;
}

interface TeamTask {
  _id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string | null;
  assignedTo: TaskMember[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  board: string;
  category: string | null;
  visibility: 'public' | 'private';
  position: number;
  createdBy: TaskMember;
  createdAt: string;
  updatedAt: string;
}

interface TaskUpdate {
  field: string;
  value: any;
  taskId: string;
}

@Component({
  selector: 'app-team-task-detail-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEditorModule, AddCommentsComponent],
  templateUrl: './team-task-detail-popup.component.html',
  styleUrl: './team-task-detail-popup.component.scss',
})
export class TeamTaskDetailPopupComponent implements OnInit, OnDestroy {
  @Output() taskUpdated = new EventEmitter<TaskUpdate>();
  @Output() taskDeleted = new EventEmitter<string>();

  // Route and navigation
  taskId: string = '';
  private routeSubscription?: Subscription;
  private querySubscription?: Subscription;

  showCustomDatePicker = false;
  currentCalendarDate = new Date();
  dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  calendarDays: any[] = [];

  // Task data
  task: TeamTask = {
    _id: '',
    title: '',
    description: '',
    status: 'normal',
    dueDate: null,
    assignedTo: [],
    comments: [],
    attachments: [],
    board: '',
    category: null,
    visibility: 'public',
    position: 0,
    createdBy: {
      _id: '',
      name: '',
      profileImage: '',
      role: '',
    },
    createdAt: '',
    updatedAt: '',
  };

  // UI State
  currentTab: 'description' | 'comments' | 'attachments' = 'description';
  isEditingTitle = false;
  isEditingDescription = false;
  editTitle = '';
  isSavingTitle = false;
  isSavingDescription = false;
  isLoading = true;

  showNoDateButton: boolean = false;
  @ViewChild('dueDateInput') dueDateInput!: ElementRef<HTMLInputElement>;

  removeDueDate(): void {
    this.task.dueDate = null;
    this.showNoDateButton = false;

    // Clear the input value
    if (this.dueDateInput?.nativeElement) {
      this.dueDateInput.nativeElement.value = '';
    }

    // Emit the update
    this.emitTaskUpdate('dueDate', null);
    this.onDueDateRemoved();
  }

  // Optional: Handle due date removal
  onDueDateRemoved(): void {
    // Add your logic here for when due date is removed
    console.log('Due date removed');
  }

  // Description editor
  editor?: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link'],
    ['text_color', 'background_color'],
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
    {
      value: 'completed',
      label: 'Completed',
      color: 'tw-bg-green-100 tw-text-green-800',
    },
    {
      value: 'deleted',
      label: 'Deleted',
      color: 'tw-bg-red-100 tw-text-red-800',
    },
  ];

  // Backup for undo functionality
  private backupData: any = {};

  // Dummy data
  private dummyMembers: TaskMember[] = [
    {
      _id: '1',
      name: 'John Doe',
      profileImage: '/assets/avatars/john.jpg',
      role: 'Developer',
    },
    {
      _id: '2',
      name: 'Jane Smith',
      profileImage: '/assets/avatars/jane.jpg',
      role: 'Designer',
    },
    {
      _id: '3',
      name: 'Mike Johnson',
      profileImage: '/assets/avatars/mike.jpg',
      role: 'Manager',
    },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.initializeEditor();
    this.setupRouteSubscriptions();
    this.loadTaskData();
    this.currentCalendarDate = this.task.dueDate
      ? new Date(this.task.dueDate)
      : new Date();
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
    this.routeSubscription?.unsubscribe();
    this.querySubscription?.unsubscribe();
    this.showNoDateButton = false;
  }

  private initializeEditor(): void {
    this.editor = new Editor();
  }

  private setupRouteSubscriptions(): void {
    this.routeSubscription = this.route.params.subscribe((params) => {
      this.taskId = params['taskId'];
      console.log('Task ID:', this.taskId);
      if (this.taskId) {
        this.loadTaskData();
      }
    });

    this.querySubscription = this.route.queryParams.subscribe((params) => {
      this.currentTab = params['tab'] || 'description';
    });
  }

  private async loadTaskData() {
    // Simulate API call with dummy data
    const response = await this.taskService.getTeamTaskDetailsById({
      taskId: this.taskId,
    });

    console.log('Task details response:', response);

    if (response) {
      setTimeout(() => {
        this.task = response;
        this.isLoading = false;
      }, 1000);
    }
    // this.task = {
    //   _id: this.taskId,
    //   title: 'Implement user authentication system',
    //   description:
    //     '<p>Create a comprehensive user authentication system with login, register, and password reset functionality.</p>',
    //   status: 'in progress',
    //   dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    //   assignedTo: [this.dummyMembers[0], this.dummyMembers[1]],
    //   comments: [
    //     {
    //       _id: 'c1',
    //       text: 'Started working on the login component',
    //       mentionedMembers: [],
    //       createdBy: this.dummyMembers[0],
    //       createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    //       isDeleted: false,
    //     },
    //     {
    //       _id: 'c2',
    //       text: 'Great progress! Let me know if you need help with the backend integration',
    //       mentionedMembers: [this.dummyMembers[0]._id],
    //       createdBy: this.dummyMembers[2],
    //       createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    //       isDeleted: false,
    //     },
    //   ],
    //   attachments: [
    //     {
    //       _id: 'a1',
    //       fileName: 'auth-wireframes.pdf',
    //       fileUrl: '/uploads/auth-wireframes.pdf',
    //       fileType: 'application/pdf',
    //       uploadedFrom: 'storage',
    //       uploadedBy: this.dummyMembers[1],
    //       createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    //     },
    //   ],
    //   board: 'board1',
    //   category: null,
    //   visibility: 'public',
    //   position: 1,
    //   createdBy: this.dummyMembers[2],
    //   createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    //   updatedAt: new Date().toISOString(),
    // };

    this.createBackup();
  }

  // Title editing methods
  startEditingTitle(): void {
    this.isEditingTitle = true;
    this.editTitle = this.task.title;
    this.createBackup('title');
  }

  async saveTitle(): Promise<void> {
    if (!this.editTitle.trim()) return;

    this.isSavingTitle = true;

    const response = await this.taskService.updateTeamTaskTitle({
      taskId: this.taskId,
      title: this.editTitle.trim(),
    });

    if (response) {
      this.task.title = this.editTitle.trim();
      this.isEditingTitle = false;
      this.isSavingTitle = false;
      this.emitTaskUpdate('title', this.task.title);
    } else {
      this.undoChanges('title');
      this.isSavingTitle = false;
    }
  }

  cancelTitleEdit(): void {
    this.isEditingTitle = false;
    this.editTitle = this.task.title;
  }

  onTitleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.saveTitle();
    } else if (event.key === 'Escape') {
      this.cancelTitleEdit();
    }
  }

  // Status methods
  async updateStatus(status: string): Promise<void> {
    this.createBackup('status');

    const response = await this.taskService.updateTeamTaskStatus({
      taskId: this.taskId,
      status: status,
    });

    if (response) {
      this.task.status = status;
      this.emitTaskUpdate('status', status);
    } else {
      this.undoChanges('status');
    }
  }

  getStatusOption(status: string) {
    return (
      this.statusOptions.find((option) => option.value === status) ||
      this.statusOptions[0]
    );
  }

  toggleCustomDatePicker(): void {
    this.showCustomDatePicker = !this.showCustomDatePicker;
    if (this.showCustomDatePicker) {
      this.generateCalendarDays();
      this.addDatePickerClickListener();
    }
  }

  generateCalendarDays(): void {
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    this.calendarDays = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      this.calendarDays.push({
        date: date.getDate(),
        fullDate: new Date(date),
        isCurrentMonth: date.getMonth() === month,
        isSelected: this.isDateSelected(date),
        isToday: this.isToday(date),
      });
    }
  }

  isDateSelected(date: Date): boolean {
    if (!this.task.dueDate) return false;
    const taskDate = new Date(this.task.dueDate);
    return date.toDateString() === taskDate.toDateString();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  getDateButtonClass(day: any): string {
    let classes = '';

    if (!day.isCurrentMonth) {
      classes += 'tw-text-gray-300 tw-cursor-not-allowed';
    } else if (day.isSelected) {
      classes += 'tw-bg-red-500 tw-text-white tw-font-semibold';
    } else if (day.isToday) {
      classes += 'tw-bg-blue-500 tw-text-white tw-font-semibold';
    } else {
      classes += 'tw-text-gray-700 hover:tw-bg-gray-100';
    }

    return classes;
  }

  selectDate(day: any): void {
    if (!day.isCurrentMonth) return;

    this.task.dueDate = day.fullDate.toISOString();
    this.emitTaskUpdate('dueDate', this.task.dueDate);
    this.showCustomDatePicker = false;
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
    this.task.dueDate = null;
    this.emitTaskUpdate('dueDate', null);
    this.showCustomDatePicker = false;
  }

  setToday(): void {
    const today = new Date();
    this.task.dueDate = today.toISOString();
    this.emitTaskUpdate('dueDate', this.task.dueDate);
    this.showCustomDatePicker = false;
  }

  private addDatePickerClickListener(): void {
    setTimeout(() => {
      const handleClick = (event: Event) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.tw-absolute')) {
          this.showCustomDatePicker = false;
          document.removeEventListener('click', handleClick);
        }
      };
      document.addEventListener('click', handleClick);
    }, 0);
  }

  getDueDateDisplay(): { text: string; color: string } {
    if (!this.task.dueDate) {
      return {
        text: 'Set due date',
        color: 'tw-bg-gray-50 tw-text-gray-700 tw-border tw-border-gray-200',
      };
    }

    const dueDate = new Date(this.task.dueDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Reset time for comparison
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
    const yesterdayOnly = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
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
          'tw-bg-orange-50 tw-text-orange-700 tw-border tw-border-orange-200 hover:tw-bg-orange-100 hover:tw-text-orange-800 tw-transition-colors tw-duration-200',
      };
    } else if (dueDateOnly.getTime() === yesterdayOnly.getTime()) {
      return {
        text: 'Due Yesterday',
        color:
          'tw-bg-red-50 tw-text-red-700 tw-border tw-border-red-200 hover:tw-bg-red-100 hover:tw-text-red-800 tw-transition-colors tw-duration-200',
      };
    } else if (dueDateOnly.getTime() === tomorrowOnly.getTime()) {
      return {
        text: 'Due Tomorrow',
        color:
          'tw-bg-yellow-50 tw-text-yellow-700 tw-border tw-border-yellow-200 hover:tw-bg-yellow-100 hover:tw-text-yellow-800 tw-transition-colors tw-duration-200',
      };
    } else if (dueDateOnly < todayOnly) {
      // Past date - overdue
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
        color:
          'tw-bg-red-50 tw-text-red-700 tw-border tw-border-red-200 hover:tw-bg-red-100 hover:tw-text-red-800 tw-transition-colors tw-duration-200',
      };
    } else {
      // Future date
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
        color:
          'tw-bg-green-50 tw-text-green-700 tw-border tw-border-green-200 hover:tw-bg-green-100 hover:tw-text-green-800 tw-transition-colors tw-duration-200',
      };
    }
  }

  // Description methods
  startEditingDescription(): void {
    this.isEditingDescription = true;
    this.createBackup('description');
  }

  saveDescription(): void {
    this.isSavingDescription = true;

    // Simulate API call
    setTimeout(() => {
      try {
        this.isEditingDescription = false;
        this.emitTaskUpdate('description', this.task.description);
      } catch (error) {
        this.undoChanges('description');
      } finally {
        this.isSavingDescription = false;
      }
    }, 500);
  }

  cancelDescriptionEdit(): void {
    this.isEditingDescription = false;
    this.undoChanges('description');
  }

  // Tab methods
  setTab(tab: string): void {
    this.currentTab = tab as 'description' | 'comments' | 'attachments';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
  }

  // TrackBy functions for ngFor
  trackByCommentId(index: number, comment: TaskComment): string {
    return comment._id;
  }

  trackByAttachmentId(index: number, attachment: TaskAttachment): string {
    return attachment._id;
  }

  // Filter functions
  getActiveCommentsCount(): number {
    return this.task.comments.filter((c) => !c.isDeleted).length;
  }

  getActiveComments(): TaskComment[] {
    return this.task.comments.filter((c) => !c.isDeleted);
  }

  // Comment methods
  onCommentAdded(comment: any): void {
    const newComment: TaskComment = {
      _id: Date.now().toString(),
      text: comment.text,
      mentionedMembers: comment.mentionedMembers,
      createdBy: this.dummyMembers[0], // Current user
      createdAt: new Date().toISOString(),
      isDeleted: false,
    };

    this.task.comments.push(newComment);
    this.emitTaskUpdate('comments', this.task.comments);
  }

  deleteComment(commentId: string): void {
    const comment = this.task.comments.find((c) => c._id === commentId);
    if (comment) {
      this.createBackup('comments');

      // Simulate API call
      setTimeout(() => {
        try {
          comment.isDeleted = true;
          this.emitTaskUpdate('comments', this.task.comments);
        } catch (error) {
          this.undoChanges('comments');
        }
      }, 300);
    }
  }

  // Attachment methods
  onFileUpload(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Simulate file upload
      for (let file of files) {
        const newAttachment: TaskAttachment = {
          _id: Date.now().toString() + Math.random(),
          fileName: file.name,
          fileUrl: `/uploads/${file.name}`,
          fileType: file.type,
          uploadedFrom: 'storage',
          uploadedBy: this.dummyMembers[0],
          createdAt: new Date().toISOString(),
        };

        this.task.attachments.push(newAttachment);
      }

      this.emitTaskUpdate('attachments', this.task.attachments);
    }
  }

  deleteAttachment(attachmentId: string): void {
    this.createBackup('attachments');

    // Simulate API call
    setTimeout(() => {
      try {
        this.task.attachments = this.task.attachments.filter(
          (a) => a._id !== attachmentId
        );
        this.emitTaskUpdate('attachments', this.task.attachments);
      } catch (error) {
        this.undoChanges('attachments');
      }
    }, 300);
  }

  // Utility methods
  private createBackup(field?: string): void {
    if (field) {
      this.backupData[field] = JSON.parse(
        JSON.stringify((this.task as any)[field])
      );
    } else {
      this.backupData = JSON.parse(JSON.stringify(this.task));
    }
  }

  private undoChanges(field: string): void {
    if (this.backupData[field] !== undefined) {
      (this.task as any)[field] = this.backupData[field];
    }
  }

  private emitTaskUpdate(field: string, value: any): void {
    this.taskUpdated.emit({
      field,
      value,
      taskId: this.taskId,
    });
  }

  closePopup(): void {
    this.router.navigate(['/task-management/teamtask']);
  }

  getCurrentUser(): TaskMember {
    return this.dummyMembers[0]; // Simulate current user
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  }

  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return 'fa-file-pdf';
    if (fileType.includes('image')) return 'fa-file-image';
    if (fileType.includes('word')) return 'fa-file-word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet'))
      return 'fa-file-excel';
    return 'fa-file';
  }
}
