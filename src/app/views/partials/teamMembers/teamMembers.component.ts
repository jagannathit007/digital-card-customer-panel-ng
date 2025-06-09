import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Member {
  _id: string;
  name: string;
  emailId: string;
  role: string;
  profileImage?: string;
  isDeleted: boolean;
}

interface TeamMember {
  _id: string;
  name: string;
  emailId: string;
  role: string;
  profileImage?: string;
  experience?: string;
  skills?: string[];
  isActive: boolean;
  isVerified: boolean;
}

@Component({
  selector: 'app-team-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teamMembers.component.html',
  styleUrl: './teamMembers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamMembersComponent {
  @Input() boardId: string = '';
  @Input() members: Member[] = [];
  @Input() availableTeamMembers: TeamMember[] = [];
  @Output() memberAdded = new EventEmitter<string>();
  @Output() memberRemoved = new EventEmitter<string>();
  @Output() memberRoleChanged = new EventEmitter<{ memberId: string, newRole: string }>();

  // Signals for reactive state
  showMembersModal = signal(false);
  showAddMemberModal = signal(false);
  hoveredMember = signal<Member | null>(null);
  showTooltip = signal(false);
  selectedRole = signal<string>('');

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

  onCountHover(event: MouseEvent) {
    event.stopPropagation();
    this.showTooltip.set(true);
  }

  onCountLeave() {
    this.showTooltip.set(false);
  }

  onShowMembers(event: Event) {
    event.stopPropagation(); // Prevent click from bubbling to board card or document
    this.showMembersModal.set(true);
  }

  onShowAddMember(event: Event) {
    event.stopPropagation(); // Prevent click from bubbling
    this.showMembersModal.set(false);
    this.showAddMemberModal.set(true);
  }

  onCloseModal() {
    this.showMembersModal.set(false);
    this.showAddMemberModal.set(false);
    this.selectedRole.set('');
  }

  onAddMemberToBoard(memberId: string) {
    this.memberAdded.emit(memberId);
    this.showAddMemberModal.set(false);
  }

  onRemoveMember(memberId: string) {
    this.memberRemoved.emit(memberId);
  }

  onRoleChange(memberId: string, newRole: string) {
    this.memberRoleChanged.emit({ memberId, newRole });
  }

  getMemberInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getDefaultProfileImage(): string {
    return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
  }
}