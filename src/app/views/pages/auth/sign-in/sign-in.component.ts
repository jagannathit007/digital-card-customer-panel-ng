import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { environment } from 'src/env/env.local';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
import { TaskMemberAuthService } from 'src/app/services/task-member-auth.service';
declare var $: any;

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private taskMemberAuthService: TaskMemberAuthService, 
    private storage: AppStorage,
    private router: Router,
    private route: ActivatedRoute
  ) {
    document.body.style.backgroundColor = '#0e273c';
  }

  async ngOnInit(){
    let data = await this.authService.getRawInformation();
    console.log(data)
    if(data!=null){
      this.storage.set("apps", data);
      this.whileLabelName = data.name;
      this.emailId = data.emailId;
    }
  }

  whileLabelName = "";
  isPassword: boolean = false; 
  emailId = '';

  
  loginForm = new FormGroup({
    emailId: new FormControl('', [
      Validators.required,
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  isLoading: boolean = false;

  async redirectTologin() {
    await this.getProfile();
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 300);
    window.location.href = '/business-cards';
  }
  // Submit function
  onSubmit = async () => {
    this.isLoading = true;
    if (this.loginForm.valid) {
      try {
        const response = await this.authService.signIn(this.loginForm.value);
        this.isLoading = false;
        if (response) {
          this.redirectTologin();
        }
      } catch (error) {
        console.error('Sign-In failed', error);
        this.isLoading = false;
      }
    } else {
      console.error('Form is invalid');
      this.isLoading = false;
    }
  };

  getProfile = async () => {
    let result = await this.authService.getProfile({});

    const data = result?.profile;
    const memberData = result?.memberProfile;
    if (result != null) {
      data.businessCards = data.businessCards.map((v: any, i: any) => {
        v.company = v.company || `Card ${i + 1}`;
        return v;
      });
      let card = this.storage.get(common.BUSINESS_CARD);
      if (card == null) {
        this.authService.selectedBusinessCard = data.businessCards[0]._id;
        this.storage.set(common.BUSINESS_CARD, data.businessCards[0]._id);
        window.location.reload();
      }
      this.authService.profileData = data;
      let businessCardsSubject = new BehaviorSubject<any[]>(data.businessCards);
      this.authService.businessCards$ = businessCardsSubject.asObservable();
      this.storage.set(common.USER_DATA, data);

      if (data.taskAccountAdminId && memberData) {
        this.storage.set(teamMemberCommon.TEAM_MEMBER_DATA, memberData);
        this.taskMemberAuthService.memberDetails = memberData;
      }
    }
  };
}
