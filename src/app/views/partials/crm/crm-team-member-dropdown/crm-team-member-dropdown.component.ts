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
import { CrmService } from 'src/app/services/crm.service';
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
  selector: 'crm-team-member-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crm-team-member-dropdown.component.html',
  styleUrl: './crm-team-member-dropdown.component.scss',
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
export class CrmTeamMemberDropdownComponent implements OnInit, OnDestroy {
  @Output() selectedMembersChange = new EventEmitter<TeamMember[]>();
  @Output() onMemberAdded = new EventEmitter<TeamMember[]>();

  @Input() placement: Partial<string> = 'bottom';
  @Input() allignment: Partial<string> = 'left';
  @Input() size: Partial<string> = 'medium';
  @Input() leadId: string | null = null;
  @Input() isModernMemberSelect: boolean = false;
  @Input() type: string = 'crm';

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
  profileTooltipPosition = { top: 0, left: 0 };
  private tooltipTimeout: any;

  public imageBaseUrl = environment.imageURL;

  constructor(
    private crmService: CrmService,
    private storage: AppStorage,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }
  }

  async loadTeamMembers(): Promise<void> {
    try {
      this.isLoading.set(true);
      const response = await this.crmService.getSelectableTeamMembers({});
      
      if (response && Array.isArray(response)) {
        this.teamMembers = response;
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      swalHelper.showToast('Error loading team members', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.loadTeamMembers();
    }
  }

  onMemberSelect(member: TeamMember): void {
    const index = this.selectedMembers.findIndex(m => m._id === member._id);
    
    if (index > -1) {
      this.selectedMembers.splice(index, 1);
    } else {
      this.selectedMembers.push(member);
    }
    
    this.selectedMembersChange.emit([...this.selectedMembers]);
    this.onMemberAdded.emit([...this.selectedMembers]);
  }

  isMemberSelected(member: TeamMember): boolean {
    return this.selectedMembers.some(m => m._id === member._id);
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.performSearch();
    }, 300);
  }

  performSearch(): void {
    // Filter team members based on search query
    // This is a simple client-side search, can be enhanced with backend search if needed
    if (!this.searchQuery.trim()) {
      this.loadTeamMembers();
      return;
    }
    
    const filteredMembers = this.teamMembers.filter(member =>
      member.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      member.emailId.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    
    this.teamMembers = filteredMembers;
    this.cdr.detectChanges();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadTeamMembers();
  }

  getFilteredMembers(): TeamMember[] {
    if (!this.searchQuery.trim()) {
      return this.teamMembers;
    }
    
    return this.teamMembers.filter(member =>
      member.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      member.emailId.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  onMemberHover(member: TeamMember, event: MouseEvent): void {
    this.hoveredMember = member;
    this.showTooltip = true;
    
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.tooltipPosition = {
      top: rect.top - 10,
      left: rect.left + rect.width / 2
    };
  }

  onMemberLeave(): void {
    this.tooltipTimeout = setTimeout(() => {
      this.showTooltip = false;
      this.hoveredMember = null;
    }, 200);
  }

  onProfileHover(member: TeamMember, event: MouseEvent): void {
    this.hoveredMember = member;
    this.showProfileTooltip = true;
    
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.profileTooltipPosition = {
      top: rect.top - 10,
      left: rect.left + rect.width / 2
    };
  }

  onProfileLeave(): void {
    this.tooltipTimeout = setTimeout(() => {
      this.showProfileTooltip = false;
      this.hoveredMember = null;
    }, 200);
  }
}
