import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TeamMember {
  _id: string;
  name: string;
  emailId: string;
  role: string;
  profileImage: string;
}

export interface TaskCategory {
  _id: string;
  name: string;
  color: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  categories: TaskCategory[];
  assignedTo: TeamMember[];
  comments: number;
  attachments: number;
  position: number;
  dueDate?: Date;
  visibility: 'public' | 'private';
  columnId: string;
}

@Component({
  selector: 'app-team-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-task-card.component.html',
  styleUrl: './team-task-card.component.scss'
})
export class TeamTaskCardComponent {
  @Input() task!: Task;
  @Input() isSelected = false;
  @Input() isDragging = false;
  
  @Output() taskClick = new EventEmitter<Event>();
  @Output() taskDoubleClick = new EventEmitter<void>();
  @Output() taskComplete = new EventEmitter<void>();
  @Output() taskDelete = new EventEmitter<void>();
  @Output() taskOpen = new EventEmitter<void>();
  @Output() dragStarted = new EventEmitter<void>();
  @Output() dragEnded = new EventEmitter<void>();

  // Internal state
  showActions = signal<boolean>(false);

  // Computed properties for displaying limited items
  displayCategories = computed(() => {
    const categories = this.task?.categories || [];
    return categories.slice(0, 2);
  });

  additionalCategoriesCount = computed(() => {
    const categories = this.task?.categories || [];
    return Math.max(0, categories.length - 2);
  });

  displayMembers = computed(() => {
    const members = this.task?.assignedTo || [];
    return members.slice(0, 2);
  });

  additionalMembersCount = computed(() => {
    const members = this.task?.assignedTo || [];
    return Math.max(0, members.length - 2);
  });

  // Status color mapping
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'tw-bg-green-100 tw-text-green-800';
      case 'in progress':
        return 'tw-bg-blue-100 tw-text-blue-800';
      case 'blocked':
        return 'tw-bg-red-100 tw-text-red-800';
      case 'on hold':
        return 'tw-bg-yellow-100 tw-text-yellow-800';
      case 'need review':
        return 'tw-bg-purple-100 tw-text-purple-800';
      case 'need rework':
        return 'tw-bg-orange-100 tw-text-orange-800';
      case 'deleted':
        return 'tw-bg-gray-100 tw-text-gray-800';
      default:
        return 'tw-bg-gray-100 tw-text-gray-800';
    }
  }

  // Priority indicator based on due date
  getDueDateIndicator(): { show: boolean; color: string; text: string } {
    if (!this.task?.dueDate) {
      return { show: false, color: '', text: '' };
    }

    const today = new Date();
    const dueDate = new Date(this.task.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { show: true, color: 'tw-text-red-600', text: 'Overdue' };
    } else if (diffDays === 0) {
      return { show: true, color: 'tw-text-orange-600', text: 'Due today' };
    } else if (diffDays <= 3) {
      return { show: true, color: 'tw-text-yellow-600', text: `${diffDays}d left` };
    }

    return { show: false, color: '', text: '' };
  }

  // Check if actions should be shown based on column
  canShowCompleteAction(): boolean {
    return this.task.columnId !== 'col4'; // Not in completed column
  }

  canShowDeleteAction(): boolean {
    return this.task.columnId !== 'col5'; // Not in deleted column
  }

  canShowRestoreAction(): boolean {
    return this.task.columnId === 'col5'; // In deleted column
  }

  // Event handlers
  onCardClick(event: Event) {
    if (!this.isDragging) {
      this.taskClick.emit(event);
    }
  }

  onCardDoubleClick() {
    if (!this.isDragging) {
      this.taskDoubleClick.emit();
    }
  }

  onMouseEnter() {
    if (!this.isDragging) {
      this.showActions.set(true);
    }
  }

  onMouseLeave() {
    this.showActions.set(false);
  }

  onCompleteClick(event: Event) {
    event.stopPropagation();
    this.taskComplete.emit();
  }

  onDeleteClick(event: Event) {
    event.stopPropagation();
    this.taskDelete.emit();
  }

  onOpenClick(event: Event) {
    event.stopPropagation();
    this.taskOpen.emit();
  }

  onDragStart() {
    this.showActions.set(false);
    this.dragStarted.emit();
  }

  onDragEnd() {
    this.dragEnded.emit();
  }

  onImageError(event: Event) {
    const target = event.target as HTMLElement;
    const nextSibling = target.nextElementSibling as HTMLElement;
    
    if (target && nextSibling) {
      target.style.display = 'none';
      nextSibling.style.display = 'flex';
    }
  }

  // Utility methods
  getMemberInitials(member: TeamMember): string {
    return member.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getVisibilityIcon(): string {
    return this.task?.visibility === 'private' 
      ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.757 7.757m4.243 4.243L15.121 15.121m-3.243-3.243L9.88 9.88m0 0l-1.06-1.061M15.12 15.12l1.061 1.061M12 12l-1.06-1.061'
      : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z';
  }
}