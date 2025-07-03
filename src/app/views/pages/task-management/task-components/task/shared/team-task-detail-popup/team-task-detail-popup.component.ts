import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  signal,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';
import { AddCommentsComponent } from 'src/app/views/partials/task-managemnt/common-components/add-comments/add-comments.component';
import { TaskService } from 'src/app/services/task.service';
import { TaskPermissionsService } from 'src/app/services/task-permissions.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from 'src/env/env.local';
import { MemberDetailDropdownComponent } from '../../../../../../partials/task-managemnt/common-components/add-members-dropdown/add-members-dropdown.component';

interface TaskMember {
  _id: string;
  name: string;
  emailId: string;
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
  files: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadedFrom: 'storage' | 'url';
    _id: string;
  }>;
  uploadedBy: TaskMember;
  type: 'task' | 'board';
  taskId: string;
  boardId: string | null;
  createdAt: string;
  updatedAt: string;
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
  imports: [
    CommonModule,
    FormsModule,
    NgxEditorModule,
    AddCommentsComponent,
    MemberDetailDropdownComponent,
  ],
  templateUrl: './team-task-detail-popup.component.html',
  styleUrl: './team-task-detail-popup.component.scss',
})
export class TeamTaskDetailPopupComponent implements OnInit, OnDestroy {
  @ViewChild('addMembersDropdown')
  addMembersDropdown!: MemberDetailDropdownComponent;

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
      emailId: '',
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

  BoardMembers: any = [];
  imageBaseUrl = '';

  // Task permissions
  taskPermissions = false;

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
    ['code'],
    ['ordered_list', 'bullet_list'],
    // [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link'],
    // ['text_color', 'background_color'],
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
      emailId: '9Fb3I@example.com',
      profileImage: '/assets/avatars/john.jpg',
      role: 'Developer',
    },
    {
      _id: '2',
      name: 'Jane Smith',
      emailId: 'I5x4y@example.com',
      profileImage: '/assets/avatars/jane.jpg',
      role: 'Designer',
    },
    {
      _id: '3',
      name: 'Mike Johnson',
      emailId: 'k5FgM@example.com',
      profileImage: '/assets/avatars/mike.jpg',
      role: 'Manager',
    },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService,
    public taskPermissionsService: TaskPermissionsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.imageBaseUrl = environment.imageURL;
    this.initializeEditor();
    this.setupRouteSubscriptions();
    this.loadTaskData();
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

  isTAskCreator(userId: any): boolean {
    console.log(
      'Checking if user is task creator:',
      userId,
      this.task.createdBy._id
    );
    return this.task.createdBy._id === userId;
  }

  private async loadTaskData() {
    // Simulate API call with dummy data
    const response = await this.taskService.getTeamTaskDetailsById({
      taskId: this.taskId,
    });

    console.log('Task details response:', response);

    if (response) {
      const users = await this.loadAvailableUsers(response.board);
      if (users) {
        setTimeout(async () => {
          this.task = response;

          this.taskPermissions =
            await this.taskPermissionsService.isTeamTaskCardAccessible(
              response
            );

          this.isLoading = false;
        }, 1000);
      } else {
        this.isLoading = false;
      }
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

  async loadAvailableUsers(boardId: string): Promise<boolean> {
    const users = await this.taskService.GetAllAvailableMembersForBoard({
      boardId: boardId,
    });
    if (users) {
      this.BoardMembers = users;
      console.log('Available users loaded:', users);
      return true;
    } else {
      return false;
    }
  }

  toggleDropdown(): void {
    this.addMembersDropdown.toggleDropdown();
  }

  async onMembersUpdated(selectedMembers: any): Promise<void> {
    console.log('Selected members updated:', selectedMembers);
    this.task.assignedTo = selectedMembers;

    const response = await this.taskService.updateTeamTaskAssignedTo({
      taskId: this.taskId,
      assignedTo: selectedMembers.map((member: TaskMember) => member._id),
    });

    if (!response) {
      // failed to update assigned members
    }
    this.emitTaskUpdate('assignedTo', this.task.assignedTo);
  }

  // Title editing methods
  startEditingTitle(): void {
    if (!this.taskPermissions) return;

    setTimeout(() => {
      const titleInput = document.getElementById(
        'editTitleInput'
      ) as HTMLInputElement;
      if (titleInput) {
        console.log('Focusing on title input');
        titleInput.focus();
        // titleInput.select();
      }
    }, 10);
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
    if (!this.taskPermissions) return;

    this.showCustomDatePicker = !this.showCustomDatePicker;
    if (this.showCustomDatePicker) {
      // Set currentCalendarDate to the due date's month if it exists, otherwise use current month
      this.currentCalendarDate = this.task.dueDate
        ? new Date(this.task.dueDate)
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

    // Only add days of the current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);

      this.calendarDays.push({
        date: day,
        fullDate: date,
        isCurrentMonth: true, // Always true since we're only showing current month
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
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
    const isPastDate = day.fullDate < today;

    if (!day.isCurrentMonth) {
      classes += 'tw-text-gray-300 tw-cursor-not-allowed';
    } else if (isPastDate) {
      classes += 'tw-text-gray-400 tw-cursor-not-allowed';
    } else if (day.isSelected) {
      classes += 'tw-bg-blue-500 tw-text-white tw-font-semibold';
    } else if (day.isToday) {
      classes +=
        'tw-border tw-border-blue-500 tw-text-blue-500 tw-font-semibold';
    } else {
      classes += 'tw-text-gray-700 hover:tw-bg-gray-100';
    }

    return classes;
  }

  async selectDate(day: any): Promise<void> {
    console.log('Selected day:', day);
    if (!day.isCurrentMonth) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only

    // Check if the selected date is in the past
    if (day.fullDate < today) {
      return; // Don't allow selecting past dates
    }

    this.task.dueDate = day.fullDate.toISOString();
    this.emitTaskUpdate('dueDate', this.task.dueDate);
    this.showCustomDatePicker = false;
    // Update currentCalendarDate to the selected date
    this.currentCalendarDate = new Date(day.fullDate);

    const response = await this.taskService.updateTeamTaskDueDate({
      taskId: this.taskId,
      dueDate: this.task.dueDate,
    });
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

    // api call
    const response = this.taskService.updateTeamTaskDueDate({
      taskId: this.taskId,
      dueDate: this.task.dueDate,
    });
  }

  setToday(): void {
    const today = new Date();
    this.task.dueDate = today.toISOString();
    this.emitTaskUpdate('dueDate', this.task.dueDate);
    this.showCustomDatePicker = false;

    // api call
    const response = this.taskService.updateTeamTaskDueDate({
      taskId: this.taskId,
      dueDate: this.task.dueDate,
    });
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
    if (!this.taskPermissions) return;

    this.isEditingDescription = true;
    this.createBackup('description');
  }

  async saveDescription(): Promise<void> {
    this.isSavingDescription = true;

    const response = await this.taskService.updateTeamTaskDescription({
      taskId: this.taskId,
      description: this.task.description,
    });

    if (response) {
      this.isEditingDescription = false;
      this.emitTaskUpdate('description', this.task.description);
      this.isSavingDescription = false;
    } else {
      this.undoChanges('description');
      this.isSavingDescription = false;
    }
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
    this.scrollToBottom();
    console.log('Comment added in chat component:', comment);
    const newComment: TaskComment = {
      _id: comment._id,
      text: comment.text,
      mentionedMembers: comment.mentionedMembers,
      createdBy: comment.createdBy,
      createdAt: comment.createdAt,
      isDeleted: false,
    };
    this.task.comments.push(newComment);
    this.emitTaskUpdate('comments', this.task.comments);
  }

  formatComment(
    text: string,
    mentionedMembers: string[],
    createdBy: string
  ): SafeHtml {
    let tooltipPlacement = 'left';

    if (createdBy === this.taskPermissionsService.getCurrentUser()._id) {
      tooltipPlacement = 'right';
    }

    let mentionIndex = 0;

    const formatted = text.replace(/\*(.*?)\*/g, (match, p1) => {
      const userId = mentionedMembers[mentionIndex++] || 'Unknown';
      const member = this.BoardMembers.find((m: any) => m._id === userId);

      const name = member?.name || 'Unknown';
      const email = member?.emailId || 'Not available';
      const image =
        member?.profileImage ||
        '/task_management/profiles/default-profile-image.png';

      return `
      <span 
        style="background-color:${
          tooltipPlacement === 'left' ? '#d3d3d38a' : '#0d6efd33'
        }; padding: 2px 6px; border-radius: 10px; position: relative; cursor: pointer;"
        onmouseover="this.querySelector('.tooltip').style.visibility='visible'; this.querySelector('.tooltip').style.opacity='1';"
        onmouseout="this.querySelector('.tooltip').style.visibility='hidden'; this.querySelector('.tooltip').style.opacity='0';"
        class="mention"
        data-user-id="${userId}"
      >
        ${p1}
        <span 
          style="
            visibility: hidden;
            background-color: #333;
            color: #fff;
            text-align: center;
            padding: 5px 8px;
            border-radius: 6px;
            position: absolute;
            z-index: 1;
            bottom: 125%;
            ${tooltipPlacement}: 0%;
            // transform: translateX(-50%);
            font-size: 13px;
            opacity: 0;
            transition: opacity 0.3s;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            max-width: 300px; /* Optional: prevents overly wide tooltips */
            width: max-content; /* Allows dynamic width based on content */
          "
          class="tooltip"
        >
          <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
            <img 
              src="${this.imageBaseUrl + image}" 
              alt="${name}" 
              style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;"
            />
            <div style="text-align: start; overflow-wrap: break-word;">
              <div style="font-weight: bold;">${name}</div>
              <div style="font-size: 12px; color: #dfdfdf;">${email}</div>
            </div>
          </div>
        </span>
      </span> 
    `;
    });

    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }

  deleteComment(commentId: string): void {
    const comment = this.task.comments.find((c) => c._id === commentId);
    if (comment) {
      this.createBackup('comments');

      swalHelper
        .delete()
        .then(async (result) => {
          if (result.isConfirmed) {
            const response = await this.taskService.deleteComment({
              taskId: this.taskId,
              commentId: comment._id,
              type: 'task',
            });
            comment.isDeleted = true;
            this.emitTaskUpdate('comments', this.task.comments);
          }
        })
        .catch((error) => {
          this.undoChanges('comments');
        });

      // Simulate API call
      // setTimeout(() => {
      //   try {
      //     comment.isDeleted = true;
      //     this.emitTaskUpdate('comments', this.task.comments);
      //   } catch (error) {
      //     this.undoChanges('comments');
      //   }
      // }, 300);
    }
  }

  // Attachment methods
  async onFileUpload(event: any): Promise<void> {
    const files = event.target.files;
    if (files && files.length > 0) {
      var formData = new FormData();

      for (let file of files) {
        formData.append('files', file);
      }
      formData.append('taskId', this.taskId);
      formData.append('boardId', this.task.board);
      formData.append('type', 'task');

      const response = await this.taskService.addAttachment(formData);

      if (response) {
        // Simulate file upload

        this.task.attachments.push(response);

        this.emitTaskUpdate('attachments', this.task.attachments);
      }
    }
  }

  async deleteAttachment(fileId: string, attachmentId: string): Promise<void> {
    this.createBackup('attachments');
    
    let confirm = await swalHelper.confirmation(
      'Are you sure?',
      'This action will permanently delete the file.',
      'question'
    );

    if(confirm.isConfirmed){
const response = await this.taskService.deleteAttachment({
      taskId: this.taskId,
      fileId: fileId,
      attachmentId: attachmentId,
      type: 'task',
    });

    if (response) {
      const attachmentIndex = this.task.attachments.findIndex(
        (attachment) => attachment._id === attachmentId
      );

      if (attachmentIndex !== -1) {
        const attachment = this.task.attachments[attachmentIndex];

        // Check if attachment has multiple files
        if (attachment.files.length > 1) {
          // Remove only the specific file from the attachment
          attachment.files = attachment.files.filter(
            (file) => file._id !== fileId
          );
        } else {
          // Remove the entire attachment if it has only one file
          this.task.attachments.splice(attachmentIndex, 1);
        }

        // Emit the updated attachments
        this.emitTaskUpdate('attachments', this.task.attachments);
      }
    } else {
      // Revert to backup if the deletion fails
      this.undoChanges('attachments');
    }
    }
    
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

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.getElementById(`commentsList`) as HTMLElement;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 10);
  }
}
