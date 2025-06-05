import { TaskMemberAuthService } from './../../../../../services/task-member-auth.service';
import { TaskService } from 'src/app/services/task.service';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-change-member-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './changeMemberRole.component.html',
  styleUrl: './changeMemberRole.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeMemberRoleComponent {
  @Input() isVisible: boolean = false;
  @Input() member: any = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() roleChanged = new EventEmitter<{
    member: any;
    newRole: string;
    reason?: string;
  }>();

  constructor(private taskService: TaskService, private taskMemberAuthService: TaskMemberAuthService) {}

  baseURL = environment.baseURL;
  selectedRole: string = '';
  changeReason: string = '';
  isLoading: boolean = false;
  roleHierarchy: any = {
    editor: 4,
    manager: 3,
    leader: 2,
    member: 1,
  };

  currentMemberDetails: any;

  isRoleHigherOrEqual(role1: string, role2: string): boolean {
    return (
      this.roleHierarchy[role1] >= this.roleHierarchy[role2]
    );
  }

  getRadioLabelClasses(role: any): string {
  const isDisabled = role.value === this.member?.role || 
                    this.isRoleHigherOrEqual(role.value, this.currentMemberDetails?.role);
  const isSelected = this.selectedRole === role.value;
  
  if (isDisabled) {
    return 'tw-cursor-not-allowed tw-border-gray-200 tw-bg-gray-50';
  } else if (isSelected) {
    return 'tw-cursor-pointer tw-border-blue-500 tw-bg-blue-50 tw-shadow-md';
  } else {
    return 'tw-cursor-pointer tw-border-gray-200 hover:tw-border-gray-300 hover:tw-bg-gray-50';
  }
}

  // Available roles with descriptions
  availableRoles = [
    {
      value: 'editor',
      label: 'Editor',
      description: 'Full access to all features and settings',
      icon: 'fas fa-crown',
      color: 'tw-text-red-600',
    },
    {
      value: 'manager',
      label: 'Manager',
      description: 'Manage teams and projects with elevated permissions',
      icon: 'fas fa-user-tie',
      color: 'tw-text-purple-600',
    },
    {
      value: 'leader',
      label: 'Team Leader',
      description: 'Lead specific teams and oversee project execution',
      icon: 'fas fa-users',
      color: 'tw-text-orange-600',
    },

    {
      value: 'member',
      label: 'Member',
      description: 'Standard access to assigned projects and tasks',
      icon: 'fas fa-user',
      color: 'tw-text-gray-600',
    },
  ];

  ngOnInit() {
    if (this.member) {
      this.selectedRole = this.member.role;
    }
    this.currentMemberDetails = this.taskMemberAuthService.memberDetails;
  }

  ngOnChanges() {
    if (this.member && this.isVisible) {
      this.selectedRole = this.member.role;
      this.changeReason = '';
    }
  }

  onClose() {
    this.closeModal.emit();
    this.resetForm();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  async onSubmit() {
    if (!this.selectedRole || this.selectedRole === this.member.role) {
      return;
    }

    this.isLoading = true;

    // Here you would typically call your API to update the role
    const result = await this.taskService.ChangeRole({
      memberId: this.member._id,
      newRole: this.selectedRole,
    });

    if (result) {
      this.roleChanged.emit({
        member: this.member,
        newRole: this.selectedRole,
        reason: this.changeReason,
      });
      this.isLoading = false;
      this.onClose();
    }
  }

  private resetForm() {
    this.selectedRole = '';
    this.changeReason = '';
    this.isLoading = false;
  }

  getRoleInfo(roleValue: string) {
    return this.availableRoles.find((role) => role.value === roleValue);
  }

  get isFormValid(): boolean {
    return !!this.selectedRole && this.selectedRole !== this.member?.role;
  }

  get currentRoleInfo() {
    return this.getRoleInfo(this.member?.role);
  }

  get selectedRoleInfo() {
    return this.getRoleInfo(this.selectedRole);
  }
}
