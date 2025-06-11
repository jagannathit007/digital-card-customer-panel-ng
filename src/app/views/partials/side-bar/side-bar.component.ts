import { Subscription } from 'rxjs';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SideBarService } from './side-bar.service';
import { CommonModule } from '@angular/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AuthService } from 'src/app/services/auth.service';
import { common } from 'src/app/core/constants/common';
import * as featherIcons from 'feather-icons';
import { environment } from 'src/env/env.local';
import { AppWorker } from 'src/app/core/workers/app.worker';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
import { TaskMemberAuthService } from 'src/app/services/task-member-auth.service';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent implements OnInit, AfterViewInit {
  currentBcardId: string = '';
  subscriptionData: any[] = [];
  filteredMenuList: any[] = [];

  teamMemberData: any;

  whiteLabelName: string = environment.whiteLabelName;

  constructor(
    private router: Router,
    private storage: AppStorage,
    public authService: AuthService,
    public taskMemberAuthService: TaskMemberAuthService,
    public sideBarService: SideBarService,
    public appWorker: AppWorker
  ) {
    this.currentBcardId = this.storage.get(common.BUSINESS_CARD);
  }

  async ngOnInit() {
    this.teamMemberData = this.storage.get(teamMemberCommon.TEAM_MEMBER_DATA);
    if (this.currentBcardId) {
      this.subscriptionData = await this.authService.getSubscriptionData(
        this.currentBcardId
      );

      this.filteredMenuList = await this.sideBarService.getMenusByProducts(
        this.subscriptionData
      );
    } else if (!this.currentBcardId && this.teamMemberData) {
      this.filteredMenuList = await this.sideBarService.getMenusByProducts([]);
    } else {
      this.filteredMenuList = [
        {
          moduleName: 'Member',
          menus: [
            {
              title: 'Account Settings',
              link: 'account-settings',
              icon: 'settings',
            },
          ],
        },
      ];
    }
  }

  ngAfterViewInit() {
    featherIcons.replace();
  }

  ngAfterViewChecked() {
    featherIcons.replace();
  }

  logout = async () => {
    let confirm = await swalHelper.confirmation(
      'Logout',
      'Do you really want to logout',
      'question'
    );
    // if (confirm.isConfirmed) {
    //   this.storage.clearAll();
    //   window.location.href = '/';
    // }
    if (confirm.isConfirmed) {
      // Preserve app_update_acknowledged before clearing
      const acknowledged = this.storage.get('app_update_acknowledged');
      const businessCardId = this.storage.get(common.BUSINESS_CARD);
      if (!businessCardId) {
        window.location.href = '/teammember/login';
      } else {
        window.location.href = '/';
      }
      this.storage.clearAll();
      if (acknowledged) {
        this.storage.set('app_update_acknowledged', acknowledged);
      }
    }
  };
}
