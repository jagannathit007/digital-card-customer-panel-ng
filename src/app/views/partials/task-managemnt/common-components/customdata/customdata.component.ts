import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
import { ModalService } from 'src/app/core/utilities/modal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customdata',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customdata.component.html',
  styleUrl: './customdata.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomdataComponent implements OnInit {
  showModal: boolean = false;

  constructor(
    private storage: AppStorage,
    private modal: ModalService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkProfileData();
  }

  checkProfileData() {
    const teamMemberData = this.storage.get(teamMemberCommon.TEAM_MEMBER_DATA);
    if (teamMemberData) {
      const parsedData = typeof teamMemberData === 'string' ? JSON.parse(teamMemberData) : teamMemberData;
      const { skills, mobile, experience } = parsedData;

      // Check if skills, mobile, or experience is missing or empty
      const isProfileIncomplete = !skills?.length || !mobile || !experience;

      if (isProfileIncomplete) {
        this.showModal = true;
        this.cdr.detectChanges();
      }
    } else {
      // If no data exists, show the modal
      this.showModal = true;
      this.cdr.detectChanges();
    }
  }

  goToProfile() {
    this.showModal = false;
    this.router.navigate(['/task-management/profile']);
    this.cdr.detectChanges();
  }
}