import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnDestroy,
  signal,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { TaskService } from 'src/app/services/task.service';
import { environment } from 'src/env/env.local';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { 
  trigger, 
  state, 
  style, 
  transition, 
  animate 
} from '@angular/animations';

interface TeamMember {
  _id: string;
  name: string;
  profileImage?: string;
  emailId: string;
  role: string;
  id?: string;
  isDeleted?: boolean;
}

@Component({
  selector: 'add-members-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-members-dropdown.component.html',
  styleUrl: './add-members-dropdown.component.scss',
   animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'translateY(-10px) scale(0.95)' 
        }),
        animate('300ms ease-out', style({ 
          opacity: 1, 
          transform: 'translateY(0) scale(1)' 
        }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ 
          opacity: 0, 
          transform: 'translateY(-10px) scale(0.95)' 
        }))
      ])
    ])
  ]
})
export class MemberDetailDropdownComponent implements OnInit, OnDestroy {
  @Output() selectedMembersChange = new EventEmitter<TeamMember[]>();
  @Output() onMemberAdded = new EventEmitter<TeamMember[]>();

  @Input() placement: Partial<string> = 'bottom';
  @Input() allignment: Partial<string> = 'left';
  @Input() size: Partial<string> = 'medium';
  @Input() type: Partial<string> = 'task_update';
  @Input() boardId: string | null = null;
  @Input() taskId: string | null = null;
  @Input() isModernMemberSelect: boolean = false;
  @Input() taskPermissions: boolean = true;

  teamMembers: TeamMember[] = [];
  selectedMembers: TeamMember[] = [];
  addedMembers: TeamMember[] = [];
  isDropdownOpen = false;
  isLoading = signal(false);
  currentPage = 1;
  hasMoreData = true;
  searchQuery = '';
  private searchTimeout: any;

showTooltip = false;
showProfileTooltip = false;
hoveredMember: TeamMember | null = null;
tooltipPosition = { top: 0, left: 0 };
profileTooltipPosition = { top: 0, left: 0 }; // Add this new property
private tooltipTimeout: any;


  constructor(
    private TaskService: TaskService,
    private storage: AppStorage,
    private cdr: ChangeDetectorRef // Added for manual change detection
  ) {}

  ngOnInit(): void {
    // Component initialization

    if (this.isModernMemberSelect) {
      console.log('Modern member select enabled');
      this.loadTeamMembers(1, true, true);
    }
  }

  toggleDropdown(): void {
    if (!this.taskPermissions) return;
    
    this.isDropdownOpen = !this.isDropdownOpen;

    if (this.isDropdownOpen && this.teamMembers.length === 0) {
      this.loadTeamMembers(1, true, true);
    }
  }

  async loadTeamMembers(
    page: number = 1,
    reset: boolean = false,
    firstTime = false
  ): Promise<void> {
    if (this.isLoading()) return;

    this.isLoading.set(true);

    const response = await this.TaskService.GetSelectableTeamMembers({
      page: page,
      limit: 10,
      search: this.searchQuery.trim(),
      boardId: this.boardId,
      taskId: this.taskId,
      type: this.type,
    });

    console.log('Team members response:', response);

    if (!response) {
      this.isLoading.set(false);
      return;
    }

    if (firstTime && response.assignedMembers.length > 0) {
      this.selectedMembers = response.assignedMembers;
      console.log('Selected members:', this.selectedMembers);
      this.addedMembers = [...this.selectedMembers];
      this.selectedMembersChange.emit([...this.selectedMembers]);
    }

    if (response?.users && Array.isArray(response.users)) {
      const newMembers = response.users;

      if (reset) {
        this.teamMembers = [...newMembers];
      } else {
        // Avoid duplicates when loading more
        const existingIds = new Set(this.teamMembers.map((m) => m._id));
        const uniqueNewMembers = newMembers.filter(
          (m: TeamMember) => !existingIds.has(m._id)
        );
        this.teamMembers = [...this.teamMembers, ...uniqueNewMembers];
      }

      if (response.pagination) {
        this.currentPage = parseInt(response.pagination.currentPage.toString());
        this.hasMoreData = response.pagination.hasNextPage === true;
      } else {
        this.currentPage = page;
        this.hasMoreData = newMembers.length >= 10;
      }

        this.isLoading.set(false);
    } else {
      if (reset) {
        this.teamMembers = [];
      }
      this.hasMoreData = false;
      this.isLoading.set(false);
    }
  }

  onScroll(event: any): void {
    if (this.isLoading() || !this.hasMoreData) return;

    const element = event.target;
    const threshold = 50;

    if (
      element.scrollHeight - element.scrollTop <=
      element.clientHeight + threshold
    ) {
      this.loadTeamMembers(this.currentPage + 1, false);
    }
  }

  async onSearch(): Promise<void> {
    // Clear existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Debounce search to avoid too many API calls
    this.searchTimeout = setTimeout(async () => {
      this.currentPage = 1;
      this.hasMoreData = true;
      this.teamMembers = [];
      await this.loadTeamMembers(1, true);
    }, 300);
  }

  showMembersTooltip(event: MouseEvent): void {
  // Clear any existing timeout
  if (this.tooltipTimeout) {
    clearTimeout(this.tooltipTimeout);
  }
  
  this.setMembersTooltipPosition(event);
  this.showTooltip = true;
}

hideMembersTooltip(): void {
  console.log('Hiding members tooltip');
  // Set a 100 miliseconds delay before hiding
  this.tooltipTimeout = setTimeout(() => {
    this.showTooltip = false;
  }, 100);
}

keepMembersTooltipOpen(): void {
  // Clear the timeout when mouse enters the tooltip
  if (this.tooltipTimeout) {
    clearTimeout(this.tooltipTimeout);
  }
}

showIndividualProfileTooltip(event: MouseEvent, member: TeamMember): void {
  this.setProfileTooltipPosition(event);
  this.showProfileTooltip = true;
  this.hoveredMember = member;
}

hideIndividualProfileTooltip(): void {
  this.showProfileTooltip = false;
  this.hoveredMember = null;
}



setMembersTooltipPosition(event: MouseEvent): void {
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  this.tooltipPosition = {
    top: rect.top - 110, // Position tooltip above element (reduced height for icon grid)
    left: rect.right - 200 // Align tooltip's right corner to element's right side
  };
}

setProfileTooltipPosition(event: MouseEvent): void {
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  this.profileTooltipPosition = {
    top: rect.top - 65, // Position tooltip above profile
    left: rect.right - 200 // Align tooltip's right corner to profile's right side
  };
}

  toggleMember(member: TeamMember): void {
    const index = this.selectedMembers.findIndex((m) => m._id === member._id);

    if (index > -1) {
      this.selectedMembers.splice(index, 1);
    } else {
      this.selectedMembers.push(member);
    }

    // Create completely new array reference to force Angular change detection
    this.selectedMembers = JSON.parse(JSON.stringify(this.selectedMembers));

    // Force immediate UI update with multiple detection cycles
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    setTimeout(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }, 0);

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 10);

    // Emit the change
    // this.selectedMembersChange.emit([...this.selectedMembers]);
  }

  isMemberSelected(member: TeamMember): boolean {
    return this.selectedMembers.some((m) => m._id === member._id);
  }

  addSelectedMembers(): void {
    if (this.selectedMembers.length === 0) {
      swalHelper.showToast('Please select at least one member', 'warning');
      return;
    }

    this.closeDropdown();
    // swalHelper.showToast(
    //   `Added ${this.selectedMembers.length} member${
    //     this.selectedMembers.length > 1 ? 's' : ''
    //   } successfully`,
    //   'success'
    // );

    // Emit the selected members
    // this.selectedMembersChange.emit([...this.selectedMembers]);

    // Emit the added members
    this.addedMembers = [...this.selectedMembers];
    this.onMemberAdded.emit([...this.selectedMembers]);

    // Optional: Clear selection after adding
    // this.selectedMembers = [];
  }

  getProfileImageUrl(profileImage?: string): string {
    if (!profileImage) {
      return `${environment.imageURL}/task_management/profiles/default-profile-image.png`;
    }

    if (profileImage.startsWith('http')) {
      return profileImage;
    }

    const cleanPath = profileImage.startsWith('/')
      ? profileImage.substring(1)
      : profileImage;
    return `${environment.imageURL}/${cleanPath}`;
  }

  getRoleColor(role: string): string {
    const roleToCheck = role.toLowerCase().trim();

    // Minimal white and grey colors only
    switch (roleToCheck) {
      case 'admin':
        return 'tw-bg-white tw-text-gray-800 tw-border tw-border-gray-300 tw-font-medium';
      case 'manager':
        return 'tw-bg-gray-100 tw-text-gray-700 tw-border tw-border-gray-300 tw-font-medium';
      case 'leader':
        return 'tw-bg-white tw-text-gray-800 tw-border tw-border-gray-300 tw-font-medium';
      case 'editor':
        return 'tw-bg-gray-50 tw-text-gray-700 tw-border tw-border-gray-300 tw-font-medium';
      case 'member':
        return 'tw-bg-gray-100 tw-text-gray-600 tw-border tw-border-gray-300';
      default:
        return 'tw-bg-gray-50 tw-text-gray-600 tw-border tw-border-gray-300';
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  clearSelectionAndClose(): void {
    this.isDropdownOpen = false;
    this.selectedMembers = [...this.addedMembers];
  }

  clearSelection(): void {
    this.selectedMembers = [];
    this.searchQuery = ''; // Reset search query
    this.selectedMembersChange.emit([]);

    // Reset team members to initial state
    this.teamMembers = [];
    this.currentPage = 1;
    this.hasMoreData = true;

    // Force change detection
    this.cdr.detectChanges();

    // Reload members
    this.loadTeamMembers(1, true);
  }

  clearAllAndClose(): void {
    // emimit onMemberAdded with empty array
    this.onMemberAdded.emit([]);

    this.selectedMembers = [];
    this.addedMembers = [];
    this.searchQuery = ''; // Reset search query
    this.selectedMembersChange.emit([]);

    // Reset team members to initial state
    this.teamMembers = [];
    this.currentPage = 1;
    this.hasMoreData = true;

    // Force change detection
    this.cdr.detectChanges();

    // Don't close dropdown - just reload members
    this.closeDropdown();

    this.loadTeamMembers(1, true);
  }

  trackByMemberId(index: number, member: TeamMember): string {
    return member._id;
  }

  // Helper method to check if we should show the add button
  get shouldShowAddButton(): boolean {
    return this.selectedMembers && this.selectedMembers.length > 0;
  }

  ngOnDestroy(): void {
    // Clear timeout on component destroy
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    if (this.tooltipTimeout) {
    clearTimeout(this.tooltipTimeout);
  }
  }
}
