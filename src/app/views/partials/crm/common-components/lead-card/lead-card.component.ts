import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lead, CrmCategory } from '../../../../../core/constants/crm-types';
import { environment } from '../../../../../../env/env.local';

@Component({
  selector: 'app-lead-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lead-card.component.html',
  styleUrl: './lead-card.component.scss',
})
export class LeadCardComponent implements OnInit {
  @Input() lead!: Lead;
  @Input() isSelected = false;
  @Input() isDragging = false;
  @Input() categories: CrmCategory[] = [];

  @Output() leadClick = new EventEmitter<Event>();
  @Output() leadDoubleClick = new EventEmitter<void>();
  @Output() leadEdit = new EventEmitter<void>();
  @Output() leadDelete = new EventEmitter<void>();
  @Output() dragStarted = new EventEmitter<void>();
  @Output() dragEnded = new EventEmitter<void>();

  // Internal state
  showActions = signal<boolean>(false);
  showMenu = signal<boolean>(false);
  showTooltipForMember = signal<string | null>(null);
  imageBaseUrl = environment.imageURL;
  category = signal<any>(null);

  ngOnInit(): void {
    if (this.lead.category && this.categories.length > 0) {
      const categoryDetails = this.categories.find(cat => cat._id === this.lead.category);
      if (categoryDetails) {
        this.category.set(categoryDetails);
      }
    }
  }

  onLeadClick(event: Event) {
    this.leadClick.emit(event);
  }

  onLeadDoubleClick() {
    this.leadDoubleClick.emit();
  }

  onEditLead() {
    this.leadEdit.emit();
  }

  onDeleteLead() {
    this.leadDelete.emit();
  }

  onDragStart() {
    this.dragStarted.emit();
  }

  onDragEnd() {
    this.dragEnded.emit();
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'hot':
        return 'tw-bg-red-100 tw-text-red-800 tw-border-red-200';
      case 'warm':
        return 'tw-bg-orange-100 tw-text-orange-800 tw-border-orange-200';
      case 'cold':
        return 'tw-bg-blue-100 tw-text-blue-800 tw-border-blue-200';
      default:
        return 'tw-bg-gray-100 tw-text-gray-800 tw-border-gray-200';
    }
  }

  getPriorityText(priority: string): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  }

  formatAmount(amount: string): string {
    if (!amount) return 'N/A';
    return `$${amount}`;
  }

  getMemberInitials(member: any): string {
    if (!member.name) return '?';
    return member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getMemberTooltip(member: any): string {
    return `${member.name} (${member.role})`;
  }

  toggleActions() {
    this.showActions.set(!this.showActions());
  }

  toggleMenu() {
    this.showMenu.set(!this.showMenu());
  }

  showMemberTooltip(memberId: string) {
    this.showTooltipForMember.set(memberId);
  }

  hideMemberTooltip() {
    this.showTooltipForMember.set(null);
  }
}
