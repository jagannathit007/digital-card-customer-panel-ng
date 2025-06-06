import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { environment } from 'src/env/env.local';
import { TaskService } from 'src/app/services/task.service';

export interface User {
  _id: string;
  name: string;
  mobile: string;
  emailId: string;
  profileImage: string;
  role: 'admin' | 'editor' | 'manager' | 'leader' | 'member';
  skills: string[];
  experience: string;
  isVerified: boolean;
  isActive: boolean;
}

export interface RoleOption {
  value: string;
  label: string;
  disabled: boolean;
  hierarchy: number;
}

@Component({
  selector: 'app-change-member-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './changeMemberRole.component.html',
  styleUrl: './changeMemberRole.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeMemberRoleComponent implements OnInit {
  @Input() currentUser!: User;
  @Input() selectedMember!: User;
  @Input() isVisible: boolean = false;
  @Output() onChangeMemberRoleModalClose = new EventEmitter<void>();
  @Output() onRoleChanged = new EventEmitter<{
    member: User;
    newRole: string;
  }>();

  private http = inject(HttpClient);

  // Role hierarchy - higher number means higher privilege
  private readonly roleHierarchy = {
    admin: 5,
    editor: 4,
    manager: 3,
    leader: 2,
    member: 1,
  };

  // Available roles for change (excluding admin)
  private readonly availableRoles = [
    { value: 'editor', label: 'Editor', hierarchy: 4 },
    { value: 'manager', label: 'Manager', hierarchy: 3 },
    { value: 'leader', label: 'Leader', hierarchy: 2 },
    { value: 'member', label: 'Member', hierarchy: 1 },
  ];

  constructor(private taskService: TaskService) {}

  selectedRole: string = '';
  roleOptions: RoleOption[] = [];
  isLoading: boolean = false;
  error: string = '';
  canChangeRole: boolean = false;
  baseURL = environment.baseURL;

  ngOnInit() {
    this.initializeComponent();
  }

  ngOnChanges() {
    if (this.isVisible && this.currentUser && this.selectedMember) {
      this.initializeComponent();
    }
  }

  private initializeComponent() {
    this.selectedRole = this.selectedMember?.role || '';
    this.error = '';
    this.canChangeRole = this.checkCanChangeRole();
    this.setRoleOptions();
  }

  private checkCanChangeRole(): boolean {
    if (!this.currentUser || !this.selectedMember) return false;

    const currentUserLevel = this.roleHierarchy[this.currentUser.role];
    const targetUserLevel = this.roleHierarchy[this.selectedMember.role];

    // Only admin, editor, and manager can change roles
    if (['member', 'leader'].includes(this.currentUser.role)) {
      return false;
    }

    // Admin can change anyone's role (except to admin)
    if (this.currentUser.role === 'admin') {
      return this.selectedMember.role !== 'admin';
    }

    // Editor and Manager can only change roles of users with lower hierarchy
    return currentUserLevel > targetUserLevel;
  }

  private setRoleOptions() {
    if (!this.canChangeRole) {
      this.roleOptions = [];
      return;
    }

    const currentUserLevel = this.roleHierarchy[this.currentUser.role];

    this.roleOptions = this.availableRoles.map((role) => {
      let disabled = false;

      if (this.currentUser.role === 'admin') {
        // Admin can assign any role except admin
        disabled = false;
      } else {
        // Editor and Manager cannot assign roles equal or higher than their own
        disabled = role.hierarchy >= currentUserLevel;
      }

      return {
        value: role.value,
        label: role.label,
        disabled,
        hierarchy: role.hierarchy,
      };
    });
  }

  onRoleChange(newRole: string) {
    this.selectedRole = newRole;
    this.error = '';
  }

  async changeRole() {
    if (!this.selectedRole || this.selectedRole === this.selectedMember.role) {
      this.error = 'Please select a different role';
      return;
    }

    if (!this.canChangeRole) {
      this.error = "You do not have permission to change this user's role";
      return;
    }

    this.isLoading = true;
    this.error = '';

    const result = await this.taskService.ChangeRole({
      memberId: this.selectedMember._id,
      newRole: this.selectedRole,
    });

    if (result) {
      this.isLoading = false;
      const updatedUser = {
        ...this.selectedMember,
        role: this.selectedRole as any,
      };

      // Emit the role changed event
      this.onRoleChanged.emit({
        member: updatedUser,
        newRole: this.selectedRole,
      });

      // Close the modal
      this.closeModal();
    }
  }

  closeModal() {
    this.selectedRole = this.selectedMember?.role || '';
    this.error = '';
    this.onChangeMemberRoleModalClose.emit();
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'editor':
        return 'fas fa-pen-nib';
      case 'manager':
        return 'fas fa-user-tie';
      case 'leader':
        return 'fas fa-users';
      case 'member':
        return 'fas fa-user';
      default:
        return 'fas fa-user-circle';
    }
  }

  getRoleBadgeClass(role: string): string {
    const classes = {
      admin: 'tw-bg-purple-100 tw-text-purple-800 tw-border-purple-200',
      editor: 'tw-bg-blue-100 tw-text-blue-800 tw-border-blue-200',
      manager: 'tw-bg-green-100 tw-text-green-800 tw-border-green-200',
      leader: 'tw-bg-orange-100 tw-text-orange-800 tw-border-orange-200',
      member: 'tw-bg-gray-100 tw-text-gray-800 tw-border-gray-200',
    };
    return classes[role as keyof typeof classes] || classes.member;
  }
}
