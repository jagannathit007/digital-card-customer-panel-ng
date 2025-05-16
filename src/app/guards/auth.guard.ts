// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService,
    private storage: AppStorage
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const token = this.storage.get(common.TOKEN);
    if (!token) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const requiredProduct = route.data['requiredProduct'];
    if (!requiredProduct) {
      return true;
    }

    const currentBcardId = this.storage.get(common.BUSINESS_CARD);
    if (!currentBcardId ) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    if (requiredProduct === 'account-settings') {
      return true;
    }

    if (requiredProduct === 'profile') {
      return true;
    }

    if (requiredProduct === 'customers') {
      return true;
    }

    let results = await this.authService.getWebsiteDetails(currentBcardId);

    const subscriptionData = await this.authService.getSubscriptionData(currentBcardId);
    const products = subscriptionData.map(item => item.product);

    let hasAccess = false;
    switch(requiredProduct) {
      case 'business-cards':
      case 'scanned-cards':
      case 'shared-history': 
        hasAccess = products.some(product => 
          product === "digital-card" || product === "nfc-card");
        break;
      case 'website-details':
        // hasAccess = products.some(product => product === "website-details");
        hasAccess = products.some(product => product === "website-details") && 
                results.websiteVisible === true;

        break;
      case 'google-standee':
        hasAccess = products.some(product => product === "google-standee");
        break;
      default:
        hasAccess = false;
    }

    if (!hasAccess) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    return true;
  }
}
