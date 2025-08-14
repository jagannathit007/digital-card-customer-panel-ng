import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TaskService } from 'src/app/services/task.service';
import { trigger, transition, style, animate } from '@angular/animations';

export interface PriorityOption {
  value: string;
  label: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-task-priority-selection-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './task-priority-selection-dropdown.component.html',
  styleUrl: './task-priority-selection-dropdown.component.scss',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-5px)' }))
      ])
    ])
  ]
})
export class TaskPrioritySelectionDropdownComponent {
  @Output() onPriorityUpdated = new EventEmitter<string | null>();

  @Input() boardId: string | null = null;
  @Input() taskId: string | null = null;
  @Input() taskPermissions: boolean = true;
  @Input() selectedPriority: string | null = null;

  isDropdownOpen = false;

  priorities: PriorityOption[] = [
    {
      value: 'low',
      label: 'Low',
      icon: 'ri-arrow-down-double-line',
      color: 'tw-text-orange-600'
    },
    {
      value: 'medium',
      label: 'Medium',
      icon: 'ri-arrow-up-wide-line',
      color: 'tw-text-yellow-600'
    },
    {
      value: 'high',
      label: 'High',
      icon: 'ri-arrow-up-double-line ',
      color: 'tw-text-green-600'
    },
  ];

  constructor(
    private TaskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('selectedPriority', this.selectedPriority);
  }

  toggleDropdown(): void {
    if (!this.taskPermissions) return;
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  async selectPriority(priority: string | null): Promise<void> {
    this.closeDropdown();
    
    if (priority === this.selectedPriority) return;
    
    this.selectedPriority = priority;
    this.cdr.detectChanges();
    
    await this.updatePriority(priority);
  }

  async updatePriority(priority: string | null): Promise<void> {
    if (this.taskId) {
      try {
        const result = await this.TaskService.updateTeamTaskPriority({
          boardId: this.boardId,
          taskId: this.taskId,
          priority: priority,
        });
        if (result) {
          this.onPriorityUpdated.emit(priority);
        }
      } catch (error) {
        console.error('Error updating priority:', error);
        // Revert the selection if update fails
        this.selectedPriority = this.getPriorityValue(priority);
        this.cdr.detectChanges();
      }
    } else {
      this.onPriorityUpdated.emit(priority);
    }
  }

  getPriorityValue(priority: string | null): string | null {
    if (!priority) return null;
    return this.priorities.find(p => p.value === priority)?.value || null;
  }

  getPriorityOption(priority: string | null): PriorityOption | null {
    if (!priority) return null;
    return this.priorities.find(p => p.value === priority) || null;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    }
  }
}