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

// import { Injectable } from '@angular/core';
// import { Router } from '@angular/router';
// import { AuthService } from 'src/app/services/auth.service';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { common } from 'src/app/core/constants/common';
// import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
// import { TaskMemberAuthService } from 'src/app/services/task-member-auth.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class SideBarService {
//   constructor(
//     private router: Router,
//     public authService: AuthService,
//     public taskMemberAuthService: TaskMemberAuthService,
//     private storage: AppStorage
//   ) {}

//   async getMenusByProducts(subscriptionData: any[] ): Promise<any[]> {
//     const teamMemberData = this.storage.get(teamMemberCommon.TEAM_MEMBER_DATA); // Team member data
//     const validRoles = ['member', 'leader', 'manager', 'editor', 'admin'];

//     const userDetails = this.storage.get(teamMemberCommon.TEAM_MEMBER_DATA)

//     // Define task management menu (common for team members and admins)
//     let taskManagementMenu = {
//       title: 'Task Management',
//       link: 'task-management',
//       icon: 'file-text',
//       menu: [
//         {
//           title: 'Dashboard',
//           link: 'task-management/dashboard',
//           icon: 'table',
//         },
//         { title: 'Boards', link: 'task-management/boards', icon: 'pie-chart' },
//         { title: 'Team Task', link: 'task-management/teamtask', icon: 'grid' },
//       ],
//     };

//     if (userDetails && userDetails?.role !== 'member') {
//       taskManagementMenu.menu.splice(1, 0, {
//         title: 'All Members',
//         link: 'task-management/allmembers',
//         icon: 'users',
//       });
//     }

//     const personalTaskManagementMenu = {
//       title: 'Personal Tasks',
//       link: 'personal-task',
//       icon: 'file-text',
//       menu: [
//         { title: 'My Day', link: 'personal-task/my-day', icon: 'aperture' },
//         {
//           title: 'Next 7 Days',
//           link: 'personal-task/next-seven-days',
//           icon: 'calendar',
//         },
//         { title: 'All Tasks', link: 'personal-task/all', icon: 'codesandbox' },
//       ],
//     };

//     // Team member role check
//     if (teamMemberData && validRoles.includes(teamMemberData.role)) {
//       if (teamMemberData.role !== 'admin') {
//         // Non-admin team members get only task-management menu
//         return [
//           {
//             moduleName: 'Team Member',
//             menus: [taskManagementMenu],
//           },
//         ];
//       }
//       // Admin team member falls through to admin logic below
//     }

//     // Admin-specific menu logic (or admin team member)
//     const products = subscriptionData.map((item) => item.product);
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

//     const sharedHistoryMenu = {
//       title: 'Shared History',
//       link: 'shared-history',
//       icon: 'clock',
//     };

//     const customerMenu = {
//       title: 'Customers',
//       link: 'customers',
//       icon: 'user',
//     };

//     const hasDigitalOrNFC = products.some(
//       (product) => product === 'digital-card' || product === 'nfc-card'
//     );

//     const hasWebsiteDetails = products.some(
//       (product) => product === 'website-details'
//     );

//     const hasGoogleReview = products.some(
//       (product) => product === 'google-standee'
//     );

//     const hasTaskManagement = products.some(
//       (product) => product === 'task-management'
//     );

//     let menus = [];

//     menus.push(customerMenu);
//     menus.push(accountSettingsMenu);

//     if (hasDigitalOrNFC) {
//       menus = [businessCardMenu, scannedCardsMenu, sharedHistoryMenu, ...menus];
//     }

//     if (hasWebsiteDetails && currentBcardId) {
//       const websiteDetails = await this.authService.getWebsiteDetails(
//         currentBcardId
//       );
//       if (websiteDetails.websiteVisible === true) {
//         menus.splice(menus.length - 1, 0, websiteDetailsMenu);
//       }
//     }

//     if (hasGoogleReview) {
//       menus.splice(menus.length - 1, 0, googleReviewMenu);
//     }

//     if (hasTaskManagement) {
//       menus.splice(menus.length - 1, 0, personalTaskManagementMenu);
//       menus.splice(menus.length - 1, 0, taskManagementMenu);
//     }

//     return [
//       {
//         moduleName: 'Member',
//         menus: menus,
//       },
//     ];
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
//     this.router.navigateByUrl(`/${item}`);
//   }
// }

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
import { TaskMemberAuthService } from 'src/app/services/task-member-auth.service';

@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  constructor(
    public router: Router,
    public authService: AuthService,
    public taskMemberAuthService: TaskMemberAuthService,
    private storage: AppStorage
  ) {
    let userData = this.storage.get(common.USER_DATA);
    if (userData != null) {
      this.isAdminLogin = userData.emailId == 'info@itfuturz.com';
      // this.isAdminLogin = (userData.emailId == "dgr@gmail.com");
    }
  }

  autoExpandTaskManagement(menus: any[]): void {
    // Find Task Management menu index and auto-expand it
    for (let moduleIndex = 0; moduleIndex < menus.length; moduleIndex++) {
      const module = menus[moduleIndex];
      for (let menuIndex = 0; menuIndex < module.menus.length; menuIndex++) {
        const menu = module.menus[menuIndex];
        if (menu.title === 'Task Management' && menu.menu) {
          this.activeSubMenuIndex = menuIndex;
          return;
        }
      }
    }
  }

  async getMenusByProducts(subscriptionData: any[]): Promise<any[]> {
    const teamMemberData = this.storage.get(teamMemberCommon.TEAM_MEMBER_DATA);
    const validRoles = ['member', 'leader', 'manager', 'editor', 'admin'];
    const userDetails = this.storage.get(teamMemberCommon.TEAM_MEMBER_DATA);

    let taskManagementMenu: any = {
      title: 'Task Management',
      link: 'task-management',
      icon: 'file-text',
      menu: [
        {
          title: 'Dashboard',
          link: 'task-management/dashboard',
          icon: 'table',
        },
        { title: 'Boards', link: 'task-management/boards', icon: 'pie-chart' },
        { title: 'Team Task', link: 'task-management/teamtask', icon: 'grid' },
      ],
    };

    let attendanceManagementMenu: any = {
      title: 'Attendance',
      link: 'task-management',
      icon: 'file-text',
      menu: [
        {
          title: 'Dashboard',
          link: 'attendance/dashboard',
          icon: 'table',
        },
        {
          title: 'Offices',
          link: 'attendance/offices',
          icon: 'table',
        },
        {
          title: 'Employees',
          link: 'attendance/employees',
          icon: 'table',
        },
      ],
    };

    if (userDetails) {
      if (userDetails.role !== 'member' && userDetails.role !== 'leader') {
        taskManagementMenu.menu.splice(1, 0, {
          title: 'All Members',
          link: 'task-management/allmembers',
          icon: 'users',
        });
      }
      if (userDetails.role === 'admin' || userDetails.role === 'editor') {
        taskManagementMenu.menu.splice(taskManagementMenu.menu.length , 0, {
          title: 'Team Report',
          link: 'task-management/team-report',
          icon: 'pie-chart',
        });
      }
      if (userDetails.role === 'admin') {
        taskManagementMenu.menu.splice(0, 0, {
          title: 'Personal Tasks',
          icon: 'file-text',
          menu: [
            {
              title: 'My Day',
              link: 'task-management/personal-task/my-day',
              icon: 'aperture',
            },
            {
              title: 'Next 7 Days',
              link: 'task-management/personal-task/next-seven-days',
              icon: 'calendar',
            },
            {
              title: 'My Calendar',
              link: 'task-management/personal-task/mycalendar',
              icon: 'calendar',
            },
            {
              title: 'All Tasks',
              link: 'task-management/personal-task/all',
              icon: 'codesandbox',
            },
          ],
        });
      }
    }

    if (teamMemberData && validRoles.includes(teamMemberData.role)) {
      if (teamMemberData.role !== 'admin') {
        return [
          {
            moduleName: 'Team Member',
            menus: [taskManagementMenu],
          },
        ];
      }
    }

    const products = subscriptionData.map((item) => item.product);
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

    // const taskManagementMenu = {
    //   title: 'Task Management',
    //   link: 'task-management',
    //   icon: 'file-text',
    // };

    // const officeMenu = {
    //   title: 'Office',
    //   link: 'offices',
    //   icon: 'users',
    // };

    // const employeeMenu = {
    //   title: 'Employee',
    //   link: 'employees',
    //   icon: 'users',
    // };

    const hasDigitalOrNFC = products.some(
      (product) => product === 'digital-card' || product === 'nfc-card'
    );

    const hasWebsiteDetails = products.some(
      (product) => product === 'website-details'
    );

    const hasGoogleReview = products.some(
      (product) => product === 'google-standee'
    );

    const hasTaskManagement = products.some(
      (product) => product === 'task-management'
    );

    const hasAttendance = products.some(
      (product) => product === 'attendance-management'
    );

    let menus = [];

    menus.push(customerMenu);
    menus.push(accountSettingsMenu);

    if (hasDigitalOrNFC) {
      menus = [businessCardMenu, scannedCardsMenu, sharedHistoryMenu, ...menus];
    }

    if (hasWebsiteDetails && currentBcardId) {
      const websiteDetails = await this.authService.getWebsiteDetails(
        currentBcardId
      );
      // if (websiteDetails?.websiteVisible === true) {
      menus.splice(menus.length - 1, 0, websiteDetailsMenu);
      // }
    }
    if (hasTaskManagement) {
      menus.splice(menus.length - 1, 0, taskManagementMenu);
    }

    if (hasAttendance) {
      menus.splice(menus.length - 1, 0, attendanceManagementMenu);
      // menus.splice(menus.length - 1, 0, officeMenu);
      // menus.splice(menus.length - 1, 0, employeeMenu);
    }

    if (this.isAdminLogin) {
      //has attendance review
      let hasAttendance = menus.filter(
        (e) => e.title == attendanceManagementMenu.title
      );
      if (hasAttendance.length == 0) {
        menus.splice(menus.length - 1, 0, attendanceManagementMenu);
      }

      //has task management
      // let hasTask = menus.filter((e)=> e.title == taskManagementMenu.title);
      // if(hasTask.length == 0){
      //   menus.splice(menus.length - 1, 0, taskManagementMenu);
      // }

      //has google review
      let hasGoogleReview = menus.filter(
        (e) => e.title == googleReviewMenu.title
      );
      if (hasGoogleReview.length == 0) {
        menus.splice(menus.length - 1, 0, googleReviewMenu);
      }
    }

    if (hasGoogleReview) {
      menus.splice(menus.length - 1, 0, googleReviewMenu);
    }

    // if (hasTaskManagement) {
    //   menus.splice(menus.length - 1, 0, taskManagementMenu);
    // }

    return [
      {
        moduleName: 'Member',
        menus: menus,
      },
    ];
  }

  isAdminLogin: boolean = false;

  isMobile: boolean = false;
  activeSubMenuIndex: number | null = null;
  activeSubSubMenuIndex: number | null = null;

  toggleSubMenu(index: number) {
    if (this.activeSubMenuIndex === index) {
      this.activeSubMenuIndex = null;
    } else {
      this.activeSubMenuIndex = index;
      this.activeSubSubMenuIndex = null; // Reset sub-submenu when toggling a new menu
    }
  }

  toggleSubSubMenu(index: number) {
    if (this.activeSubSubMenuIndex === index) {
      this.activeSubSubMenuIndex = null;
    } else {
      this.activeSubSubMenuIndex = index;
    }
  }

  navigateWithQueryParams(submenu: any) {
    this.router.navigate([submenu.link], {
      queryParams: submenu.queryParams || {},
    });
  }

  onNavSwitch(item: string) {
    this.router.navigateByUrl(`/${item}`);
  }
}
