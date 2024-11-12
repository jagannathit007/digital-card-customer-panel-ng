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
          title: 'Admins',
          link: 'admins',
          icon: 'users',
        },
        {
          title: 'Courses',
          link: 'courses',
          icon: 'folder-plus',
        },
        {
          title: 'Technologies',
          link: 'technologies',
          icon: 'cpu',
        },
        {
          title: 'Portfolio',
          link: 'portfolio',
          icon: 'globe',
        },
        {
          title: 'Expertise',
          link: 'expertise',
          icon: 'trello',
        },
        {
          title: 'Products',
          link: 'products',
          icon: 'archive',
        },
        {
          title: 'Testimonial',
          link: 'testimonial',
          icon: 'sliders',
        },
        {
          title: 'Hire Developers',
          link: 'hire-developers',
          icon: 'code',
        },
      ],
    },
    {
      moduleName: 'Website',
      menus: [
        {
          title: 'Job Applications',
          link: 'job-applications',
          icon: 'file-text',
        },
        {
          title: 'Hiring Inquires',
          link: 'hiring-inquires',
          icon: 'file-text',
        },
        {
          title: 'Course Inquires',
          link: 'course-inquires',
          icon: 'file-text',
        },
        {
          title: 'Contact Inquires',
          link: 'contact-inquires',
          icon: 'file-text',
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
