import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  constructor(private router: Router, public authService: AuthService, private storage: AppStorage) {
    let userData = this.storage.get(common.USER_DATA);
    if (userData != null) {
      this.isAdminLogin = (userData.emailId == "info@itfuturz.com");
      // this.isAdminLogin = (userData.emailId == "dgr@gmail.com");
    }
  }

  async getMenusByProducts(subscriptionData: any[]): Promise<any[]> {
    const products = subscriptionData.map(item => item.product);
    const currentBcardId = this.storage.get(common.BUSINESS_CARD);

    const businessCardMenu = {
      title: 'Business Card',
      link: 'business-cards',
      icon: 'briefcase',
    };

    const scannedCardsMenu = {
      title: 'Scanned Cards',
      link: 'scanned-cards',
      icon: 'credit-card',
    };

    const websiteDetailsMenu = {
      title: 'Website Builder',
      link: 'website-details',
      icon: 'layout',
    };

    const googleReviewMenu = {
      title: 'Google Review',
      link: 'google-reviews',
      icon: 'star',
    };

    const accountSettingsMenu = {
      title: 'Account Settings',
      link: 'account-settings',
      icon: 'settings',
    };

    const SharedHistoryMenu = {
      title: 'Shared History',
      link: 'shared-history',
      icon: 'clock',
    };

    const customerMenu = {
      title: 'Customers',
      link: 'customers',
      icon: 'user',
    };

    const attendanceManagementMenu = {
      title: 'Attendance',
      link: 'attendance',
      icon: 'users',
    };

    const taskManagementMenu = {
      title: 'Task Management',
      link: 'task-management',
      icon: 'file-text',
    };

    const hasDigitalOrNFC = products.some(product =>
      product === "digital-card" || product === "nfc-card"
    );

    const hasWebsiteDetails = products.some(product =>
      product === "website-details"
    );

    const hasGoogleReview = products.some(product =>
      product === "google-standee"
    );

    const hasTaskManagement = products.some(product =>
      product === "task-management"
    );

    let menus = [];

    menus.push(customerMenu);
    menus.push(accountSettingsMenu);

    if (hasDigitalOrNFC) {
      menus = [businessCardMenu, scannedCardsMenu, SharedHistoryMenu, ...menus];
    }

    if (hasWebsiteDetails && currentBcardId) {
      const websiteDetails = await this.authService.getWebsiteDetails(currentBcardId);
      if (websiteDetails.websiteVisible === true) {
        menus.splice(menus.length - 1, 0, websiteDetailsMenu);
      }
    }

    if (this.isAdminLogin) {

      //has attendance review
      let hasAttendance = menus.filter((e)=> e.title == attendanceManagementMenu.title);
      if(hasAttendance.length == 0){
        menus.splice(menus.length - 1, 0, attendanceManagementMenu);
      }
      
      //has task management
      let hasTask = menus.filter((e)=> e.title == taskManagementMenu.title);
      if(hasTask.length == 0){
        menus.splice(menus.length - 1, 0, taskManagementMenu);
      }

      //has google review
      let hasGoogleReview = menus.filter((e)=> e.title == googleReviewMenu.title);
      if(hasGoogleReview.length == 0){
        menus.splice(menus.length - 1, 0, googleReviewMenu);
      }
       
    }

    // if (hasGoogleReview) {
    //   menus.splice(menus.length - 1, 0, googleReviewMenu);
    // }

    return [{
      moduleName: 'Member',
      menus: menus
    }];
  }

  isAdminLogin: boolean = false;

  isMobile: boolean = false;
  activeSubMenuIndex: number | null = null;

  toggleSubMenu(index: number) {
    if (this.activeSubMenuIndex === index) {
      this.activeSubMenuIndex = null;
    } else {
      this.activeSubMenuIndex = index;
    }
  }

  navigateWithQueryParams(submenu: any) {
    this.router.navigate([submenu.link], { queryParams: submenu.queryParams });
  }

  onNavSwitch(item: string) {
    // console.log(item);
    this.router.navigateByUrl(`/${item}`);
  }
}