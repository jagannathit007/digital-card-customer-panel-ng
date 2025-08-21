import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrmService } from 'src/app/services/crm.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { cr } from '@fullcalendar/core/internal-common';

@Component({
  selector: 'app-crm-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crm-dashboard.component.html',
  styleUrl: './crm-dashboard.component.scss'
})
export class CrmDashboardComponent implements OnInit {
  crmDetails: any = null;
  leads: any[] = [];
  dashboardStats: any = {};
  isLoading = true;

  // Category management
  showCategoryModal = false;
  categoryModalMode: 'add' | 'edit' = 'add';
  editingCategory: any = null;
  newCategoryName = '';

  // Team member management
  showTeamMemberModal = false;
  teamMemberModalMode: 'show' | 'update' | 'add' = 'show';
  selectedTeamMember: any = null;
  teamMembers: any[] = [];
  newTeamMember: any = {
    name: '',
    emailId: '',
    role: '',
    isDeleted: false
  };

  // Board-style team member management
  showAddMemberModal = false;
  allMembersDetails: any[] = [];
  membersLoading = false;
  selectedMemberIds: string[] = [];
  originalSelectedMemberIds: string[] = [];
  hasSelectedMembersChanged = false;

  // Sorting for closable leads
  todaysClosableLeadsSortBy: 'amount' | 'priority' | 'closingDate' = 'closingDate';
  todaysClosableLeadsSortOrder: 'asc' | 'desc' = 'asc';

  imageBaseUrl: string = environment.imageURL

  constructor(private crmService: CrmService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  async loadDashboardData() {
    try {
      this.isLoading = true;
      
      // Load CRM details
      const crmResponse = await this.crmService.getCrmDetails({});
      if (crmResponse) {
        this.crmDetails = crmResponse;
      }

      // Load dashboard statistics
      const statsResponse = await this.crmService.getCrmDashboardStats({});
      if (statsResponse) {
        this.dashboardStats = statsResponse;
      }

      // Load leads
      const leadsResponse = await this.crmService.getLeadsByCrmId({});
      if (leadsResponse) {
        this.leads = leadsResponse;
      }

      // Load team members from CRM details
      if (this.crmDetails?.members) {
        this.teamMembers = this.crmDetails.members;
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Basic statistics methods (fallback if API fails)
  getTotalLeads(): number {
    return this.dashboardStats.totalLeads || this.leads.length;
  }

  getWonLeads(): number {
    return this.dashboardStats.wonLeads || this.leads.filter(lead => lead.wonAt).length;
  }

  getLostLeads(): number {
    return this.dashboardStats.lostLeads || this.leads.filter(lead => lead.lostAt).length;
  }

  getActiveLeads(): number {
    return this.dashboardStats.activeLeads || this.leads.filter(lead => !lead.wonAt && !lead.lostAt).length;
  }

  getLeadsByPriority(priority: string): number {
    return this.dashboardStats[`${priority}Leads`] || this.leads.filter(lead => lead.priority === priority).length;
  }

  // Today's statistics
  getTodaysNewLeads(): number {
    return this.dashboardStats.todaysNewLeads || 0;
  }

  getTodaysWonLeads(): number {
    return this.dashboardStats.todaysWonLeads || 0;
  }

  getTodaysLostLeads(): number {
    return this.dashboardStats.todaysLostLeads || 0;
  }

  // Amount statistics
  getTotalAmount(): string {
    return this.dashboardStats.totalAmount || '0.00';
  }

  getWonAmount(): string {
    return this.dashboardStats.wonAmount || '0.00';
  }

  getConversionRate(): string {
    return this.dashboardStats.conversionRate || '0.0';
  }

  // Top leads
  getTopLeadsByAmount(): any[] {
    return this.dashboardStats.topLeadsByAmount || [];
  }

  // Recent activity
  getRecentActivity(): any[] {
    return this.dashboardStats.recentActivity || [];
  }

  // Category statistics
  getCategoryStats(): any {
    return this.dashboardStats.categoryStats || {};
  }

  // Monthly trends
  getMonthlyTrends(): any[] {
    return this.dashboardStats.monthlyTrends || [];
  }

  // Computed properties for template
  getActiveCategories(): any[] {
    return this.crmDetails?.categories?.filter((cat: any) => !cat.isDeleted) || [];
  }

  hasActiveCategories(): boolean {
    return this.getActiveCategories().length > 0;
  }

  // Category management methods
  openAddCategoryModal() {
    this.categoryModalMode = 'add';
    this.editingCategory = null;
    this.newCategoryName = '';
    this.showCategoryModal = true;
  }

  openEditCategoryModal(category: any) {
    this.categoryModalMode = 'edit';
    this.editingCategory = category;
    this.newCategoryName = category.name;
    this.showCategoryModal = true;
  }

  closeCategoryModal() {
    this.showCategoryModal = false;
    this.editingCategory = null;
    this.newCategoryName = '';
  }

  async saveCategory() {
    if (!this.newCategoryName.trim()) {
      swalHelper.showToast('Category name is required', 'warning');
      return;
    }

    try {
      let response;
      if (this.categoryModalMode === 'add') {
        response = await this.crmService.createCrmCategory({
          name: this.newCategoryName.trim()
        });
      } else {
        response = await this.crmService.updateCrmCategory({
          categoryId: this.editingCategory._id,
          name: this.newCategoryName.trim()
        });
      }

      if (response) {
        // Update local CRM details
        if (this.crmDetails) {
          this.crmDetails.categories = response;
        }
        
        swalHelper.showToast(
          `Category ${this.categoryModalMode === 'add' ? 'created' : 'updated'} successfully`, 
          'success'
        );
        this.closeCategoryModal();
      }
    } catch (error) {
      console.error('Error saving category:', error);
      swalHelper.showToast('Error saving category', 'error');
    }
  }

  async deleteCategory(category: any) {
    const confirm = await swalHelper.confirmation(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      'warning'
    );

    if (confirm.isConfirmed) {
      try {
        const response = await this.crmService.deleteCrmCategory({
          categoryId: category._id
        });

        if (response) {
          // Update local CRM details
          if (this.crmDetails) {
            this.crmDetails.categories = response;
          }
          
          swalHelper.showToast('Category deleted successfully', 'success');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        swalHelper.showToast('Error deleting category', 'error');
      }
    }
  }

  // Utility methods
  formatAmount(amount: string): string {
    if (!amount || amount === '0') return '₹ 0';
    return `₹ ${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'hot': return 'tw-text-red-600';
      case 'warm': return 'tw-text-yellow-600';
      case 'cold': return 'tw-text-blue-600';
      default: return 'tw-text-gray-600';
    }
  }

  getPriorityBgColor(priority: string): string {
    switch (priority) {
      case 'hot': return 'tw-bg-red-100';
      case 'warm': return 'tw-bg-yellow-100';
      case 'cold': return 'tw-bg-blue-100';
      default: return 'tw-bg-gray-100';
    }
  }

  // Today's closable leads methods
  getTodaysClosableLeads(): any[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let closableLeads = this.leads.filter(lead => {
      if (!lead.closingDate) return false;
      const closingDate = new Date(lead.closingDate);
      closingDate.setHours(0, 0, 0, 0);
      return closingDate.getTime() === today.getTime() && !lead.wonAt && !lead.lostAt;
    });

    // Sort leads
    return this.sortLeads(closableLeads, this.todaysClosableLeadsSortBy, this.todaysClosableLeadsSortOrder);
  }

  // Top 10 leads near closing date (without time consideration)
  getTop10LeadsNearClosing(): any[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let nearClosingLeads = this.leads.filter(lead => {
      if (!lead.closingDate || lead.wonAt || lead.lostAt) return false;
      const closingDate = new Date(lead.closingDate);
      closingDate.setHours(0, 0, 0, 0);
      return closingDate >= today;
    });

    // Sort by closing date (ascending - nearest first)
    nearClosingLeads.sort((a, b) => {
      const dateA = new Date(a.closingDate);
      const dateB = new Date(b.closingDate);
      return dateA.getTime() - dateB.getTime();
    });

    return nearClosingLeads.slice(0, 10);
  }

  // Sort leads helper method
  sortLeads(leads: any[], sortBy: string, sortOrder: 'asc' | 'desc'): any[] {
    return leads.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortBy) {
        case 'amount':
          valueA = parseFloat(a.amount || '0');
          valueB = parseFloat(b.amount || '0');
          break;
        case 'priority':
          const priorityOrder = { 'hot': 3, 'warm': 2, 'cold': 1 };
          valueA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          valueB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'closingDate':
          valueA = new Date(a.closingDate || 0).getTime();
          valueB = new Date(b.closingDate || 0).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });
  }

  // Sorting methods
  setSortForTodaysClosableLeads(sortBy: 'amount' | 'priority' | 'closingDate') {
    if (this.todaysClosableLeadsSortBy === sortBy) {
      this.todaysClosableLeadsSortOrder = this.todaysClosableLeadsSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.todaysClosableLeadsSortBy = sortBy;
      this.todaysClosableLeadsSortOrder = 'asc';
    }
  }

  getSortIcon(sortBy: string, currentSortBy: string, sortOrder: string): string {
    if (sortBy !== currentSortBy) return 'ri-expand-up-down-line';
    return sortOrder === 'asc' ? 'ri-arrow-up-line' : 'ri-arrow-down-line';
  }

  // Team member management methods
  openTeamMemberModal(mode: 'show' | 'update' | 'add', member?: any) {
    this.teamMemberModalMode = mode;
    this.selectedTeamMember = member || null;
    
    // Reset new team member form when opening add mode
    if (mode === 'add') {
      this.newTeamMember = {
        name: '',
        emailId: '',
        role: '',
        isDeleted: false
      };
    }
    
    this.showTeamMemberModal = true;
  }

  closeTeamMemberModal() {
    this.showTeamMemberModal = false;
    this.selectedTeamMember = null;
    this.newTeamMember = {
      name: '',
      emailId: '',
      role: '',
      isDeleted: false
    };
  }

  // async updateTeamMember(memberData: any) {
  //   try {
  //     const response = await this.crmService.updateCrmMembers({
  //       crmId: this.crmDetails._id,
  //       members: [memberData]
  //     });

  //     if (response) {
  //       // Update local team members
  //       const memberIndex = this.teamMembers.findIndex(m => m._id === memberData._id);
  //       if (memberIndex !== -1) {
  //         this.teamMembers[memberIndex] = { ...this.teamMembers[memberIndex], ...memberData };
  //       }
        
  //       // Update CRM details
  //       if (this.crmDetails) {
  //         this.crmDetails.members = this.teamMembers;
  //       }

  //       this.closeTeamMemberModal();
  //       swalHelper.showToast('Team member updated successfully', 'success');
  //     }
  //   } catch (error) {
  //     console.error('Error updating team member:', error);
  //     swalHelper.showToast('Error updating team member', 'error');
  //   }
  // }

  // async addTeamMember(memberData: any) {
  //   try {
  //     const response = await this.crmService.updateCrmMembers({
  //       members: [memberData]
  //     });

  //     if (response) {
  //       // Add new member to local team members
  //       if (response.length > 0) {
  //         const newMember = response[response.length - 1]; // Get the newly added member
  //         this.teamMembers.push(newMember);
  //       }
        
  //       // Update CRM details
  //       if (this.crmDetails) {
  //         this.crmDetails.members = this.teamMembers;
  //       }

  //       this.closeTeamMemberModal();
  //       swalHelper.showToast('Team member added successfully', 'success');
  //     }
  //   } catch (error) {
  //     console.error('Error adding team member:', error);
  //     swalHelper.showToast('Error adding team member', 'error');
  //   }
  // }

  // Board-style team member management methods
  async getAllAvailableMembersForCrm() {
    this.membersLoading = true;

    try {
      const result = await this.crmService.getAllAvailableMembersForCrm({});

      if (result) {
        this.allMembersDetails = result;

        // Initialize selected members with current CRM members
        const currentMemberIds = this.teamMembers
          .filter((m) => !m.isDeleted)
          .map((m) => m._id);

        this.selectedMemberIds = [...currentMemberIds];
        this.originalSelectedMemberIds = [...currentMemberIds];
        this.hasSelectedMembersChanged = false;

        this.membersLoading = false;
      } else {
        console.error('Failed to fetch available members');
        this.allMembersDetails = [];
        this.selectedMemberIds = [];
        this.originalSelectedMemberIds = [];
        this.membersLoading = false;
      }
    } catch (error) {
      console.error('Error fetching available members:', error);
      this.allMembersDetails = [];
      this.selectedMemberIds = [];
      this.originalSelectedMemberIds = [];
      this.membersLoading = false;
    }
  }

  onToggleMemberSelection(memberId: string) {
    if (this.selectedMemberIds.includes(memberId)) {
      // Remove member
      this.selectedMemberIds = this.selectedMemberIds.filter((id) => id !== memberId);
    } else {
      // Add member
      this.selectedMemberIds = [...this.selectedMemberIds, memberId];
    }
    this.checkForMemberChanges();
  }

  isMemberSelected(memberId: string): boolean {
    return this.selectedMemberIds.includes(memberId);
  }

  isMemberDisabled(member: any): boolean {
    // Disable current user from being deselected
    return false; // You can add logic here if needed
  }

  checkForMemberChanges() {
    const originalSet = new Set(this.originalSelectedMemberIds);
    const currentSet = new Set(this.selectedMemberIds);
    
    this.hasSelectedMembersChanged = 
      originalSet.size !== currentSet.size ||
      [...originalSet].some(id => !currentSet.has(id)) ||
      [...currentSet].some(id => !originalSet.has(id));
  }

  async updateCrmMembers() {
    if (!this.hasSelectedMembersChanged) {
      this.closeAddMemberModal();
      return;
    }

    try {
      // Get the selected member objects
      const selectedMembers = this.allMembersDetails.filter(member => 
        this.selectedMemberIds.includes(member._id)
      );

      const selectedMEmberIds = selectedMembers.map(member => member._id);

      const response = await this.crmService.updateCrmMembers({
        crmId: this.crmDetails._id,
        members: this.selectedMemberIds
      });

      if (response) {
        // Update local team members
        this.teamMembers = selectedMembers;
        
        // Update CRM details
        if (this.crmDetails) {
          this.crmDetails.members = this.teamMembers;
        }

        this.closeAddMemberModal();
        swalHelper.showToast('Team members updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating team members:', error);
      swalHelper.showToast('Error updating team members', 'error');
    }
  }

  openAddMemberModal() {
    this.showAddMemberModal = true;
    this.getAllAvailableMembersForCrm();
  }

  closeAddMemberModal() {
    this.showAddMemberModal = false;
    this.allMembersDetails = [];
    this.selectedMemberIds = [];
    this.originalSelectedMemberIds = [];
    this.hasSelectedMembersChanged = false;
  }

  trackByMemberId(index: number, member: any): string {
    return member._id;
  }

  getTeamMemberInitials(member: any): string {
    if (!member?.name) return 'U';
    return member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getDaysUntilClosing(closingDate: string): number {
    if (!closingDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const closing = new Date(closingDate);
    closing.setHours(0, 0, 0, 0);
    const diffTime = closing.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getClosingDateClass(closingDate: string): string {
    const days = this.getDaysUntilClosing(closingDate);
    if (days < 0) return 'tw-text-red-600';
    if (days === 0) return 'tw-text-orange-600';
    if (days <= 3) return 'tw-text-yellow-600';
    return 'tw-text-green-600';
  }
}
