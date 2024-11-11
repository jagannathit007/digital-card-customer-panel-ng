import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  constructor(private router: Router) {}
  ngOnInit(): void {}

  list: any[] = [
    {
      moduleName: 'Modules',
      menus: [
        {
          title: 'Dashboard',
          link: 'dashboard',
          icon: 'monitor',
        },
        {
          title: 'Addresses',
          link: 'addresses',
          icon: 'folder-plus',
        },
        {
          title: 'Orders',
          link: 'orders',
          icon: 'archive',
        },
        {
          title: 'Ticket',
          link: 'tickets',
          icon: 'trello',
        },
        {
          title: 'Statistics',
          link: 'statistics',
          icon: 'bar-chart',
        },
      ],
    },
  ];
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
