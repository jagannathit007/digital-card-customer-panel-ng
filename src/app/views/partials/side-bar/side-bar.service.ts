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

    const hasDigitalOrNFC = products.some(product =>
      product === "digital-card" || product === "nfc-card"
    );

    const hasWebsiteDetails = products.some(product =>
      product === "website-details"
    );

    const hasGoogleReview = products.some(product =>
      product === "google-standee"
    );

    let menus = [];

    menus.push(accountSettingsMenu);
    menus.push(customerMenu)

    if (hasDigitalOrNFC) {
      menus = [businessCardMenu, scannedCardsMenu, ...menus];
    }

    if (hasWebsiteDetails) {
      menus.splice(menus.length - 1, 0, websiteDetailsMenu);
    }

    if (hasGoogleReview) {
      menus.splice(menus.length - 1, 0, googleReviewMenu);
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