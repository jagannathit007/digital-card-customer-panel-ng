import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { HeaderComponent } from '../header/header.component';
import { MemberheaderComponent } from '../../partials/memberheader/memberheader.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';
import { FormsModule } from '@angular/forms';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { TaskPermissionsService } from 'src/app/services/task-permissions.service';
import { Router, NavigationEnd } from '@angular/router';



@Component({
  selector: 'app-home-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SideBarComponent,
    HeaderComponent,
    MemberheaderComponent,
    FooterComponent,
    AdminHeaderComponent,
    FormsModule
  ],
  templateUrl: './home-layout.component.html',
  styleUrls: ['./home-layout.component.scss'],
})
export class HomeLayoutComponent implements OnInit {
  
  constructor(
    private storage:AppStorage,
    private TaskPermissionsService:TaskPermissionsService,
    private router: Router
  ){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
      }
    });
  }

  businessId:any
  isAdmin = false;
  currentRoute: string = '';


  ngOnInit(): void {
    this.businessId=this.storage.get(common.BUSINESS_CARD);
    this.isAdmin = this.TaskPermissionsService.isAdminLevelPermission();
    this.currentRoute = this.router.url;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (
      (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) &&
      event.key.toLowerCase() == 'i'
    ) {
      // Prevents Ctrl+Shift+I or Cmd+Shift+I
      event.preventDefault();
    } else if (event.key === 'F12') {
      // Prevents F12
      event.preventDefault();
    }
  }
}
