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
import { TeamMemberData } from './../../../../../../partials/task-managemnt/common-components/addTeamMember/addTeamMember.component';

@Component({
  selector: 'app-allmembers',
  templateUrl: './allmembers.component.html',
  styleUrl: './allmembers.component.scss'
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
  
  // Modal properties
  selectedMember: any = null;
  activeTab: string = 'details';
  modalTabs = [
    { id: 'details', label: 'Details', icon: 'fas fa-user' },
    { id: 'boards', label: 'Boards', icon: 'fas fa-clipboard-list' },
    { id: 'actions', label: 'Actions', icon: 'fas fa-cog' }
  ];

    // Add Team Member Modal
  showAddMemberModal: boolean = false;

  constructor(
    private storage: AppStorage,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    public modal: ModalService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
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
      isVerified: this.filterVerified ? this.filterVerified === 'verified' : undefined
    };

    console.log('Fetching members with request data:', requestData);

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
    const roleClasses:any = {
      'admin': 'tw-bg-red-100 tw-text-red-800',
      'manager': 'tw-bg-purple-100 tw-text-purple-800',
      'leader': 'tw-bg-orange-100 tw-text-orange-800',
      'editor': 'tw-bg-indigo-100 tw-text-indigo-800',
      'member': 'tw-bg-gray-100 tw-text-gray-800'
    };
    return roleClasses[role] || 'tw-bg-gray-100 tw-text-gray-800';
  }

  async reInviteUser(member: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      // Implement re-invite API call
      swalHelper.confirmation(
        'Re-invite User',
        `Are you sure you want to re-invite ${member.name}?`,
        'question'
      ).then(async (result) => {
        if (result.isConfirmed) {
          // Call your re-invite API here
          swalHelper.showToast(`Re-invitation sent to ${member.name}`, 'success');
        }
      });
    } catch (error) {
      console.error('Error re-inviting user:', error);
      swalHelper.showToast('Failed to re-invite user', 'error');
    }
  }

  async toggleUserStatus(member: any) {
    const action = member.isActive ? 'deactivate' : 'activate';
    const actionText = member.isActive ? 'Deactivate' : 'Activate';
    
    try {
      swalHelper.confirmation(
        `${actionText} User`,
        `Are you sure you want to ${action} ${member.name}?`,
        'question'
      ).then(async (result) => {
        if (result.isConfirmed) {
          // Call your toggle status API here
          member.isActive = !member.isActive;
          swalHelper.showToast(`${member.name} has been ${action}d`, 'success');
        }
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      swalHelper.showToast('Failed to update user status', 'error');
    }
  }

  addToBoard(member: any) {
    // Implement add to board functionality
    swalHelper.showToast('Add to board functionality to be implemented', 'info');
  }

  editMember(member: any) {
    // Implement edit member functionality
    swalHelper.showToast('Edit member functionality to be implemented', 'info');
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
    try {
      // Here you would call your API to add the member
      // Example API call:
      // const result = await this.taskService.addTeamMember(memberData);
      
      // For now, let's simulate the API call
      console.log('Adding member:', memberData);
      
      // Show success message
      swalHelper.showToast(`${memberData.fullName} has been added successfully!`, 'success');
      
      // Refresh the members list
      await this.fetchMembers();
      
      // Close the modal
      this.showAddMemberModal = false;
      
    } catch (error) {
      console.error('Error adding member:', error);
      swalHelper.showToast('Failed to add team member', 'error');
    }
  }
}