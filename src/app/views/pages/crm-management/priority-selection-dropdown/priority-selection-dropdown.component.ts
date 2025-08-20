import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LeadPriority = 'cold' | 'warm' | 'hot';

@Component({
  selector: 'app-priority-selection-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './priority-selection-dropdown.component.html',
  styleUrl: './priority-selection-dropdown.component.scss'
})
export class PrioritySelectionDropdownComponent {
  @Input() selectedPriority: LeadPriority = 'warm';
  @Output() prioritySelected = new EventEmitter<LeadPriority>();

  priorities: { value: LeadPriority; label: string; color: string; icon: string }[] = [
    { value: 'cold', label: 'Cold', color: 'tw-bg-blue-100 tw-text-blue-800', icon: 'ri-snowy-line' },
    { value: 'warm', label: 'Warm', color: 'tw-bg-yellow-100 tw-text-yellow-800', icon: 'ri-sun-line' },
    { value: 'hot', label: 'Hot', color: 'tw-bg-red-100 tw-text-red-800', icon: 'ri-fire-line' }
  ];

  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectPriority(priority: LeadPriority) {
    this.selectedPriority = priority;
    this.prioritySelected.emit(priority);
    this.isOpen = false;
  }

  getSelectedPriority() {
    return this.priorities.find(p => p.value === this.selectedPriority);
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
