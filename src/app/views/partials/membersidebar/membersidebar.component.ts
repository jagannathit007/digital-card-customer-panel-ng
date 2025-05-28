// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-membersidebar',
//   standalone: true,
//   imports: [],
//   templateUrl: './membersidebar.component.html',
//   styleUrl: './membersidebar.component.scss'
// })
// export class MembersidebarComponent {

// }


import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {Membersidebar} from './membersidebar.service'
import { CommonModule } from '@angular/common';
import * as featherIcons from 'feather-icons';

@Component({
  selector: 'app-membersidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './membersidebar.component.html',
  styleUrl: './membersidebar.component.scss'

})
export class MembersidebarComponent implements OnInit, AfterViewInit {
  
  menuList: any[] = [];
  isCollapsed: boolean = false;

  constructor(
    private router: Router,
    public sideBarService: Membersidebar
  ) {}

  ngOnInit() {
    // Get simple menu structure
    this.menuList = this.sideBarService.getSimpleMenus();
  }

  ngAfterViewInit() {
    // Initialize feather icons
    featherIcons.replace();
  }

  ngAfterViewChecked() {
    // Refresh feather icons after view changes
    featherIcons.replace();
  }

  // Toggle sidebar collapse
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  // Navigate to menu item
  navigateToItem(item: any) {
    this.sideBarService.navigateTo(item.link);
  }
}