// import { Injectable } from '@angular/core';
// import { Router } from '@angular/router';
// import { AuthService } from 'src/app/services/auth.service';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { common } from 'src/app/core/constants/common';
// import { Subscription } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class SideBarService {
//   constructor(private router: Router, public authService: AuthService, private storage: AppStorage) {}

//   async getMenusByProducts(subscriptionData: any[]): Promise<any[]> {
//     const products = subscriptionData.map(item => item.product);
//     const currentBcardId = this.storage.get(common.BUSINESS_CARD);

//     const businessCardMenu = {
//       title: 'Business Card',
//       link: 'business-cards',
//       icon: 'briefcase',
//     };

//     const scannedCardsMenu = {
//       title: 'Scanned Cards',
//       link: 'scanned-cards',
//       icon: 'credit-card',
//     };

//     const websiteDetailsMenu = {
//       title: 'Website Builder',
//       link: 'website-details',
//       icon: 'layout',
//     };

//     const googleReviewMenu = {
//       title: 'Google Review',
//       link: 'google-standee',
//       icon: 'star',
//     };

//     const accountSettingsMenu = {
//       title: 'Account Settings',
//       link: 'account-settings',
//       icon: 'settings',
//     };

//     const SharedHistoryMenu = {
//       title: 'Shared History',
//       link: 'shared-history',
//       icon: 'clock',
//     };

//     const customerMenu = {
//       title: 'Customers',
//       link: 'customers',
//       icon: 'user',
//     };

//   const taskManagementMenu = {
//   title: 'Task Management',
//   link: 'task-management',
//   icon: 'file-text',
//   menu: [
//     { title: 'All Members', link: 'task-management/allmembers', icon: 'users' },
//     { title: 'Personal Task', link: 'task-management/personaltask', icon: 'user-check' },
//     { title: 'Team Task', link: 'task-management/teamtask', icon: 'users' },
//   ],
// };

//     const hasDigitalOrNFC = products.some(product => 
//       product === "digital-card" || product === "nfc-card"
//     );

//     const hasWebsiteDetails = products.some(product => 
//       product === "website-details"
//     );

//     const hasGoogleReview = products.some(product => 
//       product === "google-standee"
//     );
   
//     const hasTaskManagement = products.some(product => 
//       product === "task-management"
//     );

//     let menus = [];

//     menus.push(customerMenu);
//     menus.push(accountSettingsMenu);

//     if (hasDigitalOrNFC) {
//       menus = [businessCardMenu, scannedCardsMenu, SharedHistoryMenu, ...menus];
//     }

//     if (hasWebsiteDetails && currentBcardId) {
//       const websiteDetails = await this.authService.getWebsiteDetails(currentBcardId);
//       if (websiteDetails.websiteVisible === true) {
//         menus.splice(menus.length - 1, 0, websiteDetailsMenu);
//       }
//     }

//     // if (hasGoogleReview) {
//     //   menus.splice(menus.length - 1, 0, googleReviewMenu);
//     // }

//     if (hasTaskManagement) {
//     menus.splice(menus.length - 1, 0, taskManagementMenu);
//   }

//     return [{
//       moduleName: 'Member',
//       menus: menus
//     }];
//   }

//   isMobile: boolean = false;
//   activeSubMenuIndex: number | null = null;

//   toggleSubMenu(index: number) {
//     if (this.activeSubMenuIndex === index) {
//       this.activeSubMenuIndex = null;
//     } else {
//       this.activeSubMenuIndex = index;
//     }
//   }

//   navigateWithQueryParams(submenu: any) {
//     this.router.navigate([submenu.link], { queryParams: submenu.queryParams });
//   }

//   onNavSwitch(item: string) {
//     // console.log(item);
//     this.router.navigateByUrl(`/${item}`);
//   }
// }


import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';

@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  constructor(
    private router: Router,
    public authService: AuthService,
    private storage: AppStorage
  ) {}

  async getMenusByProducts(subscriptionData: any[]): Promise<any[]> {
    const teamMemberData = this.storage.get(teamMemberCommon.TEAM_MEMBER_DATA); // Team member data
    const validRoles = ['member', 'leader', 'manager', 'editor', 'admin'];

    // Define task management menu (common for team members and admins)
    const taskManagementMenu = {
      title: 'Task Management',
      link: 'task-management',
      icon: 'file-text',
      menu: [
        { title: 'All Members', link: 'task-management/allmembers', icon: 'users' },
        { title: 'Personal Task', link: 'task-management/personaltask', icon: 'user-check' },
        { title: 'Team Task', link: 'task-management/teamtask', icon: 'users' },
      ],
    };

    // Team member role check
    if (teamMemberData && validRoles.includes(teamMemberData.role)) {
      if (teamMemberData.role !== 'admin') {
        // Non-admin team members get only task-management menu
        return [{
          moduleName: 'Team Member',
          menus: [taskManagementMenu]
        }];
      }
      // Admin team member falls through to admin logic below
    }

    // Admin-specific menu logic (or admin team member)
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
      link: 'google-standee',
      icon: 'star',
    };

    const accountSettingsMenu = {
      title: 'Account Settings',
      link: 'account-settings',
      icon: 'settings',
    };

    const sharedHistoryMenu = {
      title: 'Shared History',
      link: 'shared-history',
      icon: 'clock',
    };

    const customerMenu = {
      title: 'Customers',
      link: 'customers',
      icon: 'user',
    };

    const hasDigitalOrNFC = products.some(product => 
      product === 'digital-card' || product === 'nfc-card'
    );

    const hasWebsiteDetails = products.some(product => 
      product === 'website-details'
    );

    const hasGoogleReview = products.some(product => 
      product === 'google-standee'
    );

    const hasTaskManagement = products.some(product => 
      product === 'task-management'
    );

    let menus = [];

    menus.push(customerMenu);
    menus.push(accountSettingsMenu);

    if (hasDigitalOrNFC) {
      menus = [businessCardMenu, scannedCardsMenu, sharedHistoryMenu, ...menus];
    }

    if (hasWebsiteDetails && currentBcardId) {
      const websiteDetails = await this.authService.getWebsiteDetails(currentBcardId);
      if (websiteDetails.websiteVisible === true) {
        menus.splice(menus.length - 1, 0, websiteDetailsMenu);
      }
    }

    if (hasGoogleReview) {
      menus.splice(menus.length - 1, 0, googleReviewMenu);
    }

    if (hasTaskManagement) {
      menus.splice(menus.length - 1, 0, taskManagementMenu);
    }

    return [{
      moduleName: 'Member',
      menus: menus
    }];
  }

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
    this.router.navigateByUrl(`/${item}`);
  }
}