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
  }

  // Add this to SideBarService
  getMenusByProducts(subscriptionData: any[]): any[] {
    // Extract product names from subscription data
    const products = subscriptionData.map(item => item.product);

    // Define menu items
    const businessCardMenu = {
      title: 'Business Card',
      link: 'business-cards',
      icon: 'user',
    };

    const scannedCardsMenu = {
      title: 'Scanned Cards',
      link: 'scanned-cards',
      icon: 'credit-card',
    };

    const googleReviewMenu = {
      title: 'Google Reviews',
      link: 'google-review',
      icon: 'star',
    };

    const accountSettingsMenu = {
      title: 'Account Settings',
      link: 'account-settings',
      icon: 'settings',
    };

    // Check for specific product types
    const hasDigitalOrNFC = products.some(product =>
      product === "digital-card" || product === "nfc-card"
    );

    const hasGoogleReview = products.some(product =>
      product === "google-review"
    );

    // Define menus based on conditions
    let menus = [];

    // Always include Account Settings
    menus.push(accountSettingsMenu);

    // Add Business Card and Scanned Cards for digital-card or nfc-card
    if (hasDigitalOrNFC) {
      menus = [businessCardMenu, scannedCardsMenu, ...menus];
    }

    // Add Google Reviews for google-review
    if (hasGoogleReview) {
      // Insert Google Review before Account Settings
      menus.splice(menus.length - 1, 0, googleReviewMenu);
    }

    // Return the final menu structure
    return [{
      moduleName: 'Member',
      menus: menus
    }];
  }
  // list: any[] = [
  //   {
  //     moduleName: 'Member',
  //     menus: [
  //       {
  //         title: 'Business Card',
  //         link: 'business-cards',
  //         icon: 'user',
  //       },
  //       {
  //         title: 'Scanned Cards',
  //         link: 'scanned-cards',
  //         icon: 'credit-card',
  //       },
  //       {
  //         title: 'Google Reviews',
  //         link: 'google-review',
  //         icon: 'star',
  //       },
  //       {
  //         title: 'Account Settings',
  //         link: 'account-settings',
  //         icon: 'settings',
  //       },
  //     ],
  //   },

  // ];
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


// {
//   moduleName: 'Modules',
//   menus: [
//     {
//       title: 'Dashboard',
//       link: 'dashboard',
//       icon: 'monitor',
//     },
//     {
//       title: 'Admins',
//       link: 'admins',
//       icon: 'users',
//     },
//     {
//       title: 'Courses',
//       link: 'courses',
//       icon: 'folder-plus',
//     },
//     {
//       title: 'Technologies',
//       link: 'technologies',
//       icon: 'cpu',
//     },
//     {
//       title: 'Portfolio',
//       link: 'portfolio',
//       icon: 'globe',
//     },
//     {
//       title: 'Expertise',
//       link: 'expertise',
//       icon: 'trello',
//     },
//     {
//       title: 'Products',
//       link: 'products',
//       icon: 'archive',
//     },
//     {
//       title: 'Testimonial',
//       link: 'testimonial',
//       icon: 'sliders',
//     },
//     {
//       title: 'Hire Developers',
//       link: 'hire-developers',
//       icon: 'code',
//     },
//   ],
// },
// {
//   moduleName: 'Website',
//   menus: [
//     {
//       title: 'Job Applications',
//       link: 'job-applications',
//       icon: 'file-text',
//     },
//     {
//       title: 'Hiring Inquires',
//       link: 'hiring-inquires',
//       icon: 'file-text',
//     },
//     {
//       title: 'Course Inquires',
//       link: 'course-inquires',
//       icon: 'file-text',
//     },
//     {
//       title: 'Contact Inquires',
//       link: 'contact-inquires',
//       icon: 'file-text',
//     },
//   ],
// },