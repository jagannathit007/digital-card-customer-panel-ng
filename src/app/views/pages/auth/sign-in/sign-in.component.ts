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
import { Router } from '@angular/router';
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
    private storage:AppStorage,
    private router:Router
  ) {
    document.body.style.backgroundColor = '#0e273c';
  }

  ngOnInit(): void {}

  whileLabelName = environment.whiteLabelName;
  isPassword: boolean = false; 
  emailId = 'info@itfuturz.com';

  
  loginForm = new FormGroup({
    emailId: new FormControl('', [
      Validators.required, 
      Validators.email,
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6), 
    ]),
  });

  isLoading: boolean = false;

  // Submit function
  onSubmit = async () => {
    this.isLoading = true;
    if (this.loginForm.valid) {
      try {
        const response = await this.authService.signIn(this.loginForm.value);
        this.isLoading = false;
        if (response) {
         await this.getProfile()
         setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 300); 
          window.location.href = '/business-cards';
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
    let data = await this.authService.getProfile({});
    if (data != null) {
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
    }
  };
}
