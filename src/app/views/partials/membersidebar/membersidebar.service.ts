// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class MemberserviceService {

//   constructor() { }
// }


import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Membersidebar {
  constructor(private router: Router) {}

  // Simple menu structure with just Dashboard and Member Profile
  getSimpleMenus(): any[] {
    return [
      {
        title: 'Dashboard',
        link: 'teammember/dashboard',
        icon: 'home',
      },
      {
        title: 'Member Profile',
        link: 'teammember/myprofile',
        icon: 'user',
      }
    ];
  }

  // Navigation method
  navigateTo(link: string) {
    this.router.navigateByUrl(link);
  }

  // Mobile detection
  isMobile: boolean = false;
}