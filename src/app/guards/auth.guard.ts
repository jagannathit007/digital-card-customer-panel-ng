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
    // First check if user is authenticated
    const token = this.storage.get(common.TOKEN);
    if (!token) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Get required product from route data
    const requiredProduct = route.data['requiredProduct'];
    
    // If no product requirement is specified, allow access (for routes like account settings)
    if (!requiredProduct) {
      return true;
    }

    // Get current business card ID
    const currentBcardId = this.storage.get(common.BUSINESS_CARD);
    
    // If no card ID and the route requires a product, redirect to account settings
    if (!currentBcardId && requiredProduct !== 'account-settings') {
      this.router.navigate(['/account-settings']);
      return false;
    }

    // No additional check needed for account settings
    if (requiredProduct === 'account-settings') {
      return true;
    }

    // Get subscription data
    const subscriptionData = await this.authService.getSubscriptionData(currentBcardId);
    
    // Extract product names
    const products = subscriptionData.map(item => item.product);
    
    // Check if user has access to this product
    let hasAccess = false;
    
    switch(requiredProduct) {
      case 'business-cards':
      case 'scanned-cards':
        hasAccess = products.some(product => 
          product === "digital-card" || product === "nfc-card");
        break;
      case 'website-details':
        hasAccess = products.some(product => product === "website-details");
        break;
      case 'google-standee':
        hasAccess = products.some(product => product === "google-standee");
        break;
      default:
        hasAccess = false;
    }

    if (!hasAccess) {
      // Redirect to account settings if no access
      this.router.navigate(['/account-settings']);
      return false;
    }

    return true;
  }
}