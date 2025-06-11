import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from 'src/env/env.local';
import { TaskPermissionsService } from 'src/app/services/task-permissions.service';

interface Member {
  _id: string;
  name: string;
  emailId: string;
  role: string;
  profileImage?: string;
  isDeleted: boolean;
}

@Component({
  selector: 'app-joined-members',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './joinedMembers.component.html',
  styleUrl: './joinedMembers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinedMembersComponent {
  @Input() members: Member[] = [];
  @Input() boardId: string = '';
  @Output() showAllMembers = new EventEmitter<Event>();
  @Output() addMember = new EventEmitter<Event>();

  constructor(public taskPermissionsService: TaskPermissionsService) {
    
  }

  // Signals for reactive state
  hoveredMember = signal<Member | null>(null);
  showTooltip = signal(false);
  imageURL = environment.imageURL

  // Computed values
  displayMembers = computed(() => {
    return this.members.filter(member => !member.isDeleted).slice(0, 2);
  });

  remainingCount = computed(() => {
    const activeMembers = this.members.filter(member => !member.isDeleted);
    return Math.max(0, activeMembers.length - 2);
  });

  totalMembers = computed(() => {
    return this.members.filter(member => !member.isDeleted).length;
  });

  onMemberHover(member: Member, event: MouseEvent) {
    event.stopPropagation();
    this.hoveredMember.set(member);
    this.showTooltip.set(true);
  }

  onMemberLeave() {
    this.hoveredMember.set(null);
    this.showTooltip.set(false);
  }

  onAddMemberClick(event: Event) {
    this.addMember.emit(event);
    this.showTooltip.set(false);
  }

  onCountClick(event: Event) {
    event.stopPropagation();
    this.showAllMembers.emit(event);
  }

  onCountHover(event: MouseEvent) {
    event.stopPropagation();
    // Show tooltip with remaining members info
    this.showTooltip.set(true);
  }

  onCountLeave() {
    this.showTooltip.set(false);
  }

  getDefaultProfileImage(): string {
    return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
  }

  getMemberInitials(name: string): string {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  }
}