// import { Component } from '@angular/core';
// import { TaskMemberAuthService } from 'src/app/services/task-member-auth.service';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { common } from 'src/app/core/constants/common';
// import { environment } from 'src/env/env.local';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.scss'
// })
// export class LoginComponent {

// }

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskMemberAuthService } from 'src/app/services/task-member-auth.service';
import { FcmService } from 'src/app/services/fcm.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { environment } from 'src/env/env.local';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
import { CommonModule } from '@angular/common';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AuthService } from 'src/app/services/auth.service';
import { common } from 'src/app/core/constants/common';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isLoading: boolean = false;
  showError: boolean = false;
  showLoginForm: boolean = false;
  errorMessage: string = '';
  whiteLabelName = environment.whiteLabelName;
  emailId = 'info@itfuturz.com';
  isPassword: boolean = false;
  token: string | null = null;

  loginForm = new FormGroup({
    emailId: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(3)])
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskMemberAuthService: TaskMemberAuthService,
    private storage: AppStorage,
    private fcmService: FcmService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token');

    if (this.token) {
      // User came with token in URL - verify it
      this.isLoading = true;
      await this.verifyToken(this.token);
    } else {
      // No token in URL - show login form directly
      this.showLoginForm = true;
    }
  }

  async verifyToken(token: string) {
    try {
      const response = await this.taskMemberAuthService.verifyToken({ token });
      this.isLoading = false;

      if (response && response.status === 200 && response.data) {
        // Token is valid - show login form
        this.showLoginForm = true;
        this.showError = false;
      } else {
        // Token is invalid - show error
        this.showError = true;
        this.showLoginForm = false;
        this.errorMessage = 'Invalid or expired token. Please use a valid login link.';
        swalHelper.showToast(this.errorMessage, 'error');
      }
    } catch (error) {
      this.isLoading = false;
      this.showError = true;
      this.showLoginForm = false;
      this.errorMessage = 'Token verification failed. Please try again.';
      swalHelper.showToast(this.errorMessage, 'error');
    }
  }

  goToLoginPage() {
    this.router.navigate(['/teammember/login']);
  }

  // fcm token 
  async getFcmToken(): Promise<string | null> {
    try {
      const token = await this.fcmService.requestPermissionAndGetTokenSimple();
      if (token) {
        return token;
      } else {
        console.warn('No FCM token received');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  async onSubmit() {
    if (!this.loginForm.valid) {
      this.errorMessage = 'Please fill in valid email and password.';
      swalHelper.showToast(this.errorMessage, 'error');
      return;
    }

    this.isLoading = true;
    try {
      const { emailId, password } = this.loginForm.value;

      const fcmToken = await this.getFcmToken();
      const payload = {
        emailId,
        password,
        fcm: fcmToken,
        ...(this.token && { token: this.token })
      };
      const response = await this.taskMemberAuthService.teamMemberSignin(payload);
      this.isLoading = false;

      if (response && response.status === 200 && response.data) {
        // Store user data but not token
        // this.storage.set(teamMemberCommon.TEAM_MEMBER_DATA, response.data.user);
        // this.storage.set(teamMemberCommon.TEAM_MEMBER_TOKEN, response.data.token);

        console.log(response.data)

        console.log(response.data.user.role, response.data.taskUserToken)
        if(response.data.user.role === "admin" && response.data.taskUserToken){
          await this.getProfile();
        }
        
        const userData = response.data.user;
        const isProfileComplete = userData.mobile &&
          userData.skills &&
          userData.skills.length > 0 &&
          userData.experience;

        if (isProfileComplete) {
          console.log('LoginComponent: Redirecting to /task-management/allmembers'); // Debug log

          this.router.navigate(['/task-management/allmembers']);
        } else {
          console.log('LoginComponent: Redirecting to /task-management/allmembers'); // Debug log
          console.log("here log");
          
          this.router.navigate(['/task-management/teamtask']);
        }

      } else {
        // this.showError = true;
        this.errorMessage = response?.message || 'Invalid credentials. Please try again.';
        swalHelper.showToast(this.errorMessage, 'error');
      }
    } catch (error) {
      this.isLoading = false;
      // this.showError = true;
      this.errorMessage = 'Login failed. Please try again.';
      swalHelper.showToast(this.errorMessage, 'error');
    }
  }

  getProfile = async () => {
    let data = await this.authService.getProfile({});
    console.log("data : ", data)
    if (data != null) {
      data.businessCards = data.businessCards.map((v: any, i: any) => {
        v.company = v.company || `Card ${i + 1}`;
        return v;
      });
      let card = this.storage.get(common.BUSINESS_CARD);
      if (card == null) {
        this.authService.selectedBusinessCard = data.businessCards[0]._id;
        this.storage.set(common.BUSINESS_CARD, data.businessCards[0]._id);
        console.log(data)
        // window.location.reload();
      }
      console.log(data);
      this.authService.profileData = data;
      let businessCardsSubject = new BehaviorSubject<any[]>(data.businessCards);
      this.authService.businessCards$ = businessCardsSubject.asObservable();
      this.storage.set(common.USER_DATA, data);
    }
  };
}