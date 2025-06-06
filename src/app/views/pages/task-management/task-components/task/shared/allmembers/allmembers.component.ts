import { TaskPermissionsService } from './../../../../../../../services/task-permissions.service';
// allmembers.component.ts
import { TaskMemberAuthService } from './../../../../../../../services/task-member-auth.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';
import { TaskService } from 'src/app/services/task.service';
import { TeamMemberData } from 'src/app/views/partials/task-managemnt/common-components/addTeamMember/addTeamMember.component';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';

@Component({
  selector: 'app-allmembers',
  templateUrl: './allmembers.component.html',
  styleUrl: './allmembers.component.scss',
})
export class AllmembersComponent implements OnInit {
  baseURL = environment.baseURL;
  members: any[] = [];
  page: number = 1;
  limit: number = 12; // Increased for better grid layout
  totalPages: number = 1;
  search: string = '';
  loading: boolean = false;

  // Filter properties
  filterRole: string = '';
  filterStatus: string = '';
  filterVerified: string = '';
  showSendingMailModal: boolean = false;
  showChangeMemberRoleModal: boolean = false;
  selectedMemberForMail: any = null;
  currentUser: any = null;

  // Modal properties
  selectedMember: any = null;
  activeTab: string = 'details';
  modalTabs = [
    { id: 'details', label: 'Details', icon: 'fas fa-user' },
    { id: 'boards', label: 'Boards', icon: 'fas fa-clipboard-list' },
    { id: 'actions', label: 'Actions', icon: 'fas fa-cog' },
  ];

  // Add Team Member Modal
  showAddMemberModal: boolean = false;

  constructor(
    private storage: AppStorage,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    public modal: ModalService,
    private taskService: TaskService,
    private taskMemberAuthService: TaskMemberAuthService,
    public taskPermissionsService: TaskPermissionsService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.storage.get(teamMemberCommon.TEAM_MEMBER_DATA);
    this.fetchMembers();
  }

  async fetchMembers() {
    this.loading = true;
    const requestData = {
      page: this.page,
      limit: this.limit,
      search: this.search,
      role: this.filterRole || undefined,
      isActive: this.filterStatus ? this.filterStatus === 'active' : undefined,
      isVerified: this.filterVerified
        ? this.filterVerified === 'verified'
        : undefined,
    };

    try {
      const result = await this.taskService.GetAllMembers(requestData);
      if (result && result.docs) {
        this.members = result.docs;
        this.totalPages = result.totalPages;
      } else {
        this.members = [];
        this.totalPages = 1;
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      this.members = [];
      this.totalPages = 1;
    } finally {
      this.loading = false;
    }
  }

  onSearchChange(event: any) {
    this.page = 1;
    this.fetchMembers();
  }

  onFilterChange() {
    this.page = 1;
    this.fetchMembers();
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.fetchMembers();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.fetchMembers();
    }
  }

  // Modal methods
  openMemberModal(member: any) {
    this.selectedMember = member;
    this.activeTab = 'details';
  }

  closeMemberModal() {
    this.selectedMember = null;
  }

  // Role badge styling
  getRoleBadgeClass(role: string): string {
    const roleClasses: any = {
      admin: 'tw-bg-red-100 tw-text-red-800',
      manager: 'tw-bg-purple-100 tw-text-purple-800',
      leader: 'tw-bg-orange-100 tw-text-orange-800',
      editor: 'tw-bg-indigo-100 tw-text-indigo-800',
      member: 'tw-bg-gray-100 tw-text-gray-800',
    };
    return roleClasses[role] || 'tw-bg-gray-100 tw-text-gray-800';
  }

  async reInviteUser(member: any, event?: Event) {
    console.log('Re-inviting user:', member);
    if (event) {
      event.stopPropagation();
    }

    this.selectedMemberForMail = member;
    this.showSendingMailModal = true;
  }

  closeSendingMailModal(event: any) {
    this.showSendingMailModal = false;
    this.selectedMemberForMail = null;
  }

  async toggleUserStatus(member: any) {
    const action = member.isActive ? 'deactivate' : 'activate';
    const actionText = member.isActive ? 'Deactivate' : 'Activate';

    swalHelper
      .confirmation(
        `${actionText} User`,
        `Are you sure you want to ${action} ${member.name}?`,
        'question'
      )
      .then(async (result) => {
        if (result.isConfirmed) {
          // Call your toggle status API here
          const response = await this.taskService.toggleMemberStatus({
            memberId: this.selectedMember._id,
          });
          if (response) {
            member.isActive = response.isActive;
          }
        }
      });
  }

  addToBoard(member: any) {
    // Implement add to board functionality
    swalHelper.showToast(
      'Add to board functionality to be implemented',
      'info'
    );
  }

  // Update the changeMemberRole method in allmembers.component.ts
  changeMemberRole(member: any) {
    this.selectedMember = member; // Set the selected member for the role change modal
    this.showChangeMemberRoleModal = true;
  }

  // Add new method to handle role change completion
  onRoleChanged(event: { member: any; newRole: string }) {
    const memberIndex = this.members.findIndex(
      (m) => m._id === event.member._id
    );
    if (memberIndex !== -1) {
      this.members[memberIndex] = event.member;
    }

    swalHelper.showToast(
      `${event.member.name}'s role has been updated to ${event.newRole}`,
      'success'
    );

    this.showChangeMemberRoleModal = false;
    this.selectedMember = null;
  }

  // Add method to handle modal close
  onChangeMemberRoleModalClose() {
    this.showChangeMemberRoleModal = false;
    // this.selectedMember = null;
  }

  async deleteMember(member: any) {
    const action = member.isActive ? 'deactivate' : 'activate';
    const actionText = member.isActive ? 'Deactivate' : 'Activate';

    swalHelper
      .confirmation(
        `Delete User`,
        `Are you sure you want to Delete ${member.name}?`,
        'question'
      )
      .then(async (result) => {
        if (result.isConfirmed) {
          // Call your toggle status API here
          const response = await this.taskService.DeleteTeamMember({
            memberId: this.selectedMember._id,
          });
          if (response) {
            this.selectedMember = null; 
            this.members = this.members.filter((m) => m._id !== member._id);
          }
        }
      });
  }

  // Utility methods
  getMemberStatusText(member: any): string {
    if (!member.isActive) return 'Inactive';
    if (!member.isVerified) return 'Pending Verification';
    return 'Active';
  }

  getMemberStatusClass(member: any): string {
    if (!member.isActive) return 'tw-text-red-600';
    if (!member.isVerified) return 'tw-text-yellow-600';
    return 'tw-text-green-600';
  }

  // Keyboard navigation for accessibility
  onKeyDown(event: KeyboardEvent, member: any) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openMemberModal(member);
    }
  }

  onModalKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeMemberModal();
    }
  }

  // Updated openAddMemberModal method
  openAddMemberModal() {
    this.showAddMemberModal = true;
  }

  // New method to handle modal close
  onAddMemberModalClose() {
    this.showAddMemberModal = false;
  }

  // New method to handle member addition
  async onMemberAdded(memberData: TeamMemberData) {
    await this.fetchMembers();
    this.showAddMemberModal = false;
  }
}
