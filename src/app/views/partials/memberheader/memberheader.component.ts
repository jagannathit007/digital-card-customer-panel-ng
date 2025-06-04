import { RouterModule } from '@angular/router';
// memberheader.component.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { common } from 'src/app/core/constants/common';
import { FormsModule } from '@angular/forms';
import { AvatarComponent } from '../avatar/avatar.component';
import { AppWorker } from 'src/app/core/workers/app.worker';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { SharedService } from 'src/app/services/shared.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { BehaviorSubject } from 'rxjs';
import { ModalService } from 'src/app/core/utilities/modal';
import { environment } from 'src/env/env.local';
import { TaskMemberAuthService } from 'src/app/services/task-member-auth.service';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';

@Component({
  selector: 'app-memberheader',
  standalone: true,
  imports: [CommonModule,RouterModule, FormsModule, AsyncPipe, AvatarComponent],
  templateUrl: './memberheader.component.html',
  styleUrl: './memberheader.component.scss'
})
export class MemberheaderComponent implements OnInit {
  showInstallButton: boolean = false;
  userName: string = '';
  showDefaultIcon: boolean = false; 
  imageUrl = environment.baseURL + '/';
  memberDetails: any;
  
  constructor(
    public appWorker: AppWorker,
    private storage: AppStorage,
    public authService: AuthService,
    public taskMemberAuthService: TaskMemberAuthService,
    public modal: ModalService,
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService
  ) {}

  async onInitFunction() {
    this.getProfile();
  }

  async ngOnInit() {
    this.onInitFunction();

    this.sharedService.refreshHeader$.subscribe(() => {
      this.onInitFunction();
    });

    // Add dropdown animation listeners after view init
    setTimeout(() => {
      this.initializeDropdownAnimations();
    }, 100);
  }

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
}