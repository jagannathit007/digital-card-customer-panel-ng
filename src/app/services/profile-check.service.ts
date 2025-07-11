import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';

@Injectable({
  providedIn: 'root'
})
export class ProfileCheckService {
  private showModalSubject = new BehaviorSubject<boolean>(false);
  public showModal$ = this.showModalSubject.asObservable();

  constructor(
    private router: Router,
    private storage: AppStorage
  ) {
    this.startListening();
  }

  startListening() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        if (url.includes('/task-management/') && !url.includes('/task-management/profile')) {
          this.checkProfileData();
        }
      }
    });
  }

  checkProfileData() {
    const teamMemberData = this.storage.get(teamMemberCommon.TEAM_MEMBER_DATA);
    
    if (teamMemberData) {
      const parsedData = typeof teamMemberData === 'string' ? JSON.parse(teamMemberData) : teamMemberData;
      const { skills, mobile, experience } = parsedData;

      const isProfileIncomplete = !skills?.length || !mobile;
      this.showModalSubject.next(isProfileIncomplete);
    } else {
      this.showModalSubject.next(true);
    }
  }

  hideModal() {
    this.showModalSubject.next(false);
  }
}