import { ChangeDetectorRef, Component, OnInit, HostListener, OnDestroy  } from '@angular/core';
import { environment } from 'src/env/env.local';
import { TaskPermissionsService } from 'src/app/services/task-permissions.service'; 
import { AppWorker } from '../../../core/workers/app.worker';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { RouterModule } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { AuthService } from 'src/app/services/auth.service';
import { TaskService } from 'src/app/services/task.service';
import { TaskMemberAuthService } from 'src/app/services/task-member-auth.service';
import { TeamMemberData } from '../task-managemnt/common-components/addTeamMember/addTeamMember.component';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BoardNotificationService } from 'src/app/services/board-notification.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule,RouterModule, FormsModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.scss'
})
export class AdminHeaderComponent implements OnInit {

  isDropdownOpen = false;
  showInstallButton: boolean = false;
  userName: string = '';
  showDefaultIcon: boolean = false; 
  imageUrl = environment.imageURL;
  memberDetails: any;
  
  // NEW PROPERTIES FOR BOARDS DROPDOWN
  isBoardsDropdownOpen = false;
  boardsList: any[] = [];
  currentBoardId: string = '';

    private destroy$ = new Subject<void>();
  shouldShowElements = false;

    constructor(
      public appWorker: AppWorker,
      private storage: AppStorage,
      public authService: AuthService,
      public TaskService: TaskService,
      public taskMemberAuthService: TaskMemberAuthService,
      private cdr: ChangeDetectorRef,
      private sharedService: SharedService,
      private router: Router,
      private boardNotificationService: BoardNotificationService
    ) {}
  
    async onInitFunction() {
      this.getProfile();
    }
  
    async ngOnInit() {
      this.setupRouterListener(); 
      this.onInitFunction();
      await this.getBoardsNames(); // Make sure this loads the boards
      this.getCurrentBoardFromStorage(); // Get current board ID

        // IMPORTANT: Subscribe to board changes for real-time updates
    this.boardNotificationService.currentBoard$
      .pipe(takeUntil(this.destroy$))
      .subscribe(boardId => {
        this.currentBoardId = boardId;
        this.cdr.detectChanges(); // Force change detection to update UI
      });
  
      this.sharedService.refreshHeader$.subscribe(() => {
        this.onInitFunction();
        this.getCurrentBoardFromStorage(); // Refresh current board on header refresh
      });
  
      // Add dropdown animation listeners after view init
      setTimeout(() => {
        this.initializeDropdownAnimations();
      }, 100);
    }
  private setupRouterListener() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.checkShouldShowElements(event.url);
      });
    
    // Initial check
    this.checkShouldShowElements(this.router.url);
  }

  private checkShouldShowElements(url: string) {
    // Exact match for /task-management/boards
    const isBoardsRoute = url === '/task-management/teamtask';
    
    // Check for /teamtask with boardId parameter
    const isTeamTaskWithBoardId = url.startsWith('/task-management/teamtask?') && 
                                new URLSearchParams(url.split('?')[1]).has('boardId');
    
    this.shouldShowElements = isBoardsRoute || isTeamTaskWithBoardId;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


    // NEW METHODS FOR BOARDS DROPDOWN
    toggleBoardsDropdown() {
      this.isBoardsDropdownOpen = !this.isBoardsDropdownOpen;
      // Close profile dropdown if open
      if (this.isBoardsDropdownOpen) {
        this.isDropdownOpen = false;
      }
    }

    closeBoardsDropdown() {
      this.isBoardsDropdownOpen = false;
    }

    // UPDATED Dropdown toggle functionality
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
      // Close boards dropdown if open
      if (this.isDropdownOpen) {
        this.isBoardsDropdownOpen = false;
      }
    }

    // Dropdown close functionality  
    closeDropdown() {
      this.isDropdownOpen = false;
    }

    // UPDATED Click outside to close dropdown
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
      const target = event.target as HTMLElement;
      
      // Check if click is outside profile dropdown
      if (!target.closest('.profile-dropdown-container') && !target.closest('[data-profile-button]')) {
        this.isDropdownOpen = false;
      }
      
      // Check if click is outside boards dropdown
      if (!target.closest('.boards-dropdown-container') && !target.closest('[data-boards-button]')) {
        this.isBoardsDropdownOpen = false;
      }
    }

    // UPDATED getBoardsNames method to store the results
    getBoardsNames = async () => {
      try {
        const result = await this.TaskService.GetBoardNames({});
        this.boardsList = result || []; // Store the boards list
        return result;
      } catch (error) {
        console.error('Error fetching board names:', error);
        this.boardsList = []; // Set empty array on error
      }
    };

    getProfile = async () => {
      try {
        let data = await this.taskMemberAuthService.getTeamMemberProfile({});
        if (data != null) {
          this.memberDetails = data;
          this.taskMemberAuthService.memberDetails = data;
          this.storage.set(teamMemberCommon.TEAM_MEMBER_DATA, data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
  
    logout = async () => {
      try {
        let confirm = await swalHelper.confirmation(
          'Logout',
          'Do you really want to logout?',
          'question'
        );
        if (confirm.isConfirmed) {
          this.storage.clearAll();
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error during logout:', error);
      }
    };
  
    handleImageError(event: Event) {
      const target = event.target as HTMLImageElement;
      this.showDefaultIcon = true;
      this.cdr.detectChanges();
    }
  
    private initializeDropdownAnimations() {
      const dropdownItems = document.querySelectorAll('.dropdown-item-modern');
      const dropdownButton = document.querySelector('.profile-button');
      const dropdownMenu = document.querySelector('.dropdown-menu-modern');
  
      // Add staggered animation delays to dropdown items
      dropdownItems.forEach((item, index) => {
        (item as HTMLElement).style.animationDelay = `${index * 0.1}s`;
      });
  
      // Enhanced dropdown behavior
      if (dropdownButton && dropdownMenu) {
        dropdownButton.addEventListener('click', () => {
          setTimeout(() => {
            if (dropdownMenu.classList.contains('show')) {
              dropdownMenu.classList.add('fade-in');
            }
          }, 10);
        });
      }
    }
  
    // Method to get user initials for default avatar
    getUserInitials(): string {
      if (this.memberDetails?.name) {
        return this.memberDetails.name
          .split(' ')
          .map((name: string) => name.charAt(0))
          .join('')
          .toUpperCase()
          .substring(0, 2);
      }
      return 'U';
    }
  
    // Method to get user status
    getUserStatus(): string {
      // You can implement your own logic here based on your requirements
      return 'Online';
    }
  
    // Method to handle profile click
    onProfileClick() {
      // Add any profile click logic here
      console.log('Profile clicked');
    }
  
    // Method to handle notification click
    onNotificationClick() {
      // Add notification logic here
      console.log('Notifications clicked');
    }
  
    // Method to handle settings click
    onSettingsClick() {
      // Add settings logic here
      console.log('Settings clicked');
    }
  
    // Method to check if user is online (you can implement your own logic)
    isUserOnline(): boolean {
      // Implement your online status logic here
      return true;
    }
  
    // Method to get profile image with fallback
    getProfileImageSrc(): string {
      if (this.memberDetails?.profileImage && !this.showDefaultIcon) {
        return this.imageUrl + this.memberDetails.profileImage;
      }
      return '';
    }
  
    // Method to handle profile image load success
    onImageLoad() {
      this.showDefaultIcon = false;
      this.cdr.detectChanges();
    }

    // NEW METHOD: Get current board from localStorage
    getCurrentBoardFromStorage() {
    try {
      const boardData = this.storage.get(teamMemberCommon.BOARD_DATA);
      if (boardData && boardData._id) {
        this.currentBoardId = boardData._id;
        // Also update the service to keep them in sync
        this.boardNotificationService.setCurrentBoard(boardData._id);
      } else {
        this.currentBoardId = '';
        this.boardNotificationService.clearCurrentBoard();
      }
    } catch (error) {
      console.error('Error getting board from storage:', error);
      this.currentBoardId = '';
      this.boardNotificationService.clearCurrentBoard();
    }
  }

  // Updated method to check if board is currently active
  isCurrentBoard(boardId: string): boolean {
    return this.currentBoardId === boardId && this.currentBoardId !== '';
  }

   onBoardSelect(board: any) {
    // Store board data
    this.storage.set(teamMemberCommon.BOARD_DATA, board);
    
    // Update current board immediately
    this.boardNotificationService.setCurrentBoard(board._id);
    
    // Close dropdown
    this.closeBoardsDropdown();
    
    // Navigate to board
    this.router.navigate(['/task-management/teamtask'], {
      queryParams: { boardId: board._id }
    });
  }


}