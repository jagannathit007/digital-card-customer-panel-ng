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

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent implements OnInit, AfterViewInit {

  currentBcardId: string = "";
  subscriptionData: any[] = [];
  filteredMenuList: any[] = [];

  constructor(
    private router: Router,
    private storage: AppStorage,
    public authService: AuthService,
    public sideBarService: SideBarService
  ) {
    this.currentBcardId = this.storage.get(common.BUSINESS_CARD);
  }

  async ngOnInit() {
    // console.log("Business Card ID from localStorage:", this.currentBcardId);
    // console.log("type of Business Card ID", typeof(this.currentBcardId));

    if (this.currentBcardId) {
      this.subscriptionData = await this.authService.getSubscriptionData(this.currentBcardId);
      console.log("Subscription data result:", this.subscriptionData);

      this.filteredMenuList = this.sideBarService.getMenusByProducts(this.subscriptionData);

    } else {
      console.log("No business card ID found in localStorage");

      this.filteredMenuList = [{
        moduleName: 'Member',
        menus: [{
          title: 'Account Settings',
          link: 'account-settings',
          icon: 'settings',
        }]
      }];
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
    if (confirm.isConfirmed) {
      this.storage.clearAll();
      window.location.href = '/';
    }
  };
}
