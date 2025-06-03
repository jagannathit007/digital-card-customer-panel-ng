import { ChangeDetectorRef, Component } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { common } from 'src/app/core/constants/common';
import { FormsModule } from '@angular/forms';
import { AvatarComponent } from '../avatar/avatar.component';
import { AppWorker } from 'src/app/core/workers/app.worker';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { SharedService } from 'src/app/services/shared.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { BehaviorSubject } from 'rxjs';
import { ModalService } from 'src/app/core/utilities/modal';
import { environment } from 'src/env/env.local';
import { TaskMemberAuthService } from 'src/app/services/task-member-auth.service';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';

@Component({
  selector: 'app-memberheader',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe, AvatarComponent],
  templateUrl: './memberheader.component.html',
  styleUrl: './memberheader.component.scss'
})
export class MemberheaderComponent {
  showInstallButton: boolean = false;
  userName: string = '';
  showDefaultIcon: boolean = false; 
  imageUrl = environment.baseURL + '/';
  memberDetails:any;
  
  constructor(
      public appWorker: AppWorker,
      private storage: AppStorage,
      public authService: AuthService,
      public taskMemberAuthService: TaskMemberAuthService,
      public modal: ModalService,
      private cdr: ChangeDetectorRef,
      private sharedService: SharedService
    ) {}


  async onInitFunction() {
    // await this.getProfile();
    // this.authService.selectedBusinessCard =
    //   this.storage.get(common.BUSINESS_CARD) ?? '';

    // let userData = this.storage.get(common.USER_DATA);

    // const matchedCard = userData.businessCards.find(
    //   (e: any) => e._id === this.authService.selectedBusinessCard
    // );
    // this.userName = matchedCard?.userName;

    this.getProfile();
  }

async ngOnInit() {
    this.onInitFunction();

    this.sharedService.refreshHeader$.subscribe(() => {
      this.onInitFunction();
    });
  }

  getProfile = async () => {
    let data = await this.taskMemberAuthService.getTeamMemberProfile({});
    if (data != null) {

      // let card = this.storage.get(common.BUSINESS_CARD);
      // if (card == null) {
      //   this.authService.selectedBusinessCard = data.businessCards[0]._id;
      //   this.storage.set(common.BUSINESS_CARD, data.businessCards[0]._id);
      //   window.location.reload();
      // }
      this.memberDetails = data
      // this.authService.taskMemberAuthService = data;
      // let businessCardsSubject = new BehaviorSubject<any[]>(data.businessCards);
      // this.authService.businessCards$ = businessCardsSubject.asObservable();
      this.storage.set(teamMemberCommon.TEAM_MEMBER_DATA, data);
    }
  };
  logout = async () => {
    let confirm = await swalHelper.confirmation(
      'Logout',
      'Do you really want to logout',
      'question'
    );
    if (confirm.isConfirmed) {
      this.storage.clearAll();
      window.location.href = '/';
    }
  };

  handleImageError(event: Event) {
    this.showDefaultIcon = true;
    this.cdr.detectChanges();
  }
}