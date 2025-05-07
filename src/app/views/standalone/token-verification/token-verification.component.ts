import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { common } from 'src/app/core/constants/common';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-token-verification',
  standalone: true,
  imports: [],
  templateUrl: './token-verification.component.html',
  styleUrl: './token-verification.component.scss'
})
export class TokenVerificationComponent implements OnInit{
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private storage: AppStorage
  ) {}

  async ngOnInit() {
    try {
      const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.handleError('Invalid or missing token');
      return;
    }
      const validToken = await this.authService.handleTokenLogin({token:token});
      if (!validToken) {
        this.handleError('Token verification failed');
        return;
      }
      this.storage.set(common.TOKEN, validToken);
      await this.getProfile();
      this.redirectAfterLogin();
    } catch (error) {
      console.error('Token verification error:', error);
      this.handleError('An error occurred during verification');
    }
  }

  private async getProfile() {
    const data = await this.authService.getProfile({});
    if (data != null) {
      data.businessCards = data.businessCards.map((v: any, i: any) => {
        v.company = v.company || `Card ${i + 1}`;
        return v;
      });

      let card = null
      if (card == null) {
        this.authService.selectedBusinessCard = data.businessCards[0]._id;
        this.storage.set(common.BUSINESS_CARD, data.businessCards[0]._id);
      }

      // Update service and storage
      this.authService.profileData = data;
      const businessCardsSubject = new BehaviorSubject<any[]>(data.businessCards);
      this.authService.businessCards$ = businessCardsSubject.asObservable();
      this.storage.set(common.USER_DATA, data);
    }
  }

  private redirectAfterLogin() {
    setTimeout(() => {
      this.router.navigate(['/business-cards']);
    }, 300);
  }

  private handleError(message: string) {
    this.isLoading = false;
    swalHelper.showToast(message,'error')
  }

}
