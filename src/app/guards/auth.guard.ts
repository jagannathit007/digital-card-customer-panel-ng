// src/app/guards/auth.guard.ts
// import { Injectable } from '@angular/core';
// import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
// import { AuthService } from 'src/app/services/auth.service';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { common } from 'src/app/core/constants/common';
// import { teamMemberCommon } from '../core/constants/team-members-common';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthGuard implements CanActivate {

//   constructor(
//     private router: Router,
//     private authService: AuthService,
//     private storage: AppStorage,
//   ) {}

//   async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
//     const token = this.storage.get(common.TOKEN);
//     const teamMemberToken = this.storage.get(teamMemberCommon.TEAM_MEMBER_TOKEN);
//     const teamMemberData = this.storage.get(teamMemberCommon.TEAM_MEMBER_DATA);
//     // when admin token is not present then move to adminlogin page
//     if (!token) {
//       this.router.navigate(['/auth/login']);
//       return false;
//     }

//     // when team member token is not present then move to team member login page
//     if (!teamMemberToken && !teamMemberData) {
//       this.router.navigate(['/teammember/login']);
//       return false;
//     }
    

//     const requiredProduct = route.data['requiredProduct'];
//     if (!requiredProduct) {
//       return true;
//     }

//        // Check for team member roles
//     const validRoles = ['member', 'leader', 'manager', 'editor', 'admin'];
//     if (teamMemberData && validRoles.includes(teamMemberData.role)) {
//       if (teamMemberData.role === 'admin') {
//         // Admin gets access to all routes
//         return true;
//       }
//       // Non-admin team members only get access to task-management
//       if (requiredProduct === 'task-management') {
//         return true;
//       }
//       // Redirect non-admin team members to task-management for other routes
//       this.router.navigate(['/task-management']);
//       return false;
//     }

//     const currentBcardId = this.storage.get(common.BUSINESS_CARD);
//     if (!currentBcardId ) {
//       this.router.navigate(['/auth/login']);
//       return false;
//     }
//     if (requiredProduct === 'account-settings') {
//       return true;
//     }

//     if (requiredProduct === 'profile') {
//       return true;
//     }

//     if (requiredProduct === 'customers') {
//       return true;
//     }

//     // let results = await this.authService.getWebsiteDetails(currentBcardId);

//     const subscriptionData = await this.authService.getSubscriptionData(currentBcardId);
//     const products = subscriptionData.map(item => item.product);

//     let hasAccess = false;
//     switch(requiredProduct) {
//       case 'business-cards':
//       case 'scanned-cards':
//       case 'shared-history': 
//         hasAccess = products.some(product => 
//           product === "digital-card" || product === "nfc-card");
//         break;
//       case 'website-details':
//         // ! REMOVE THIS GETWEBSITE DETAILS API CALL BEACUASE THIS API IS USED IN SLIDEBAR SERVICE SECTION WITH PROPER VAILDATION
//         // hasAccess = products.some(product => product === "website-details");
//         hasAccess = products.some(product => product === "website-details");
//                 // results.websiteVisible === true;
//         break;
//       case 'google-standee':
//         hasAccess = products.some(product => product === "google-standee");
//         break;
//       case 'task-management':
//         hasAccess = products.some(product => product === "task-management");
//          break;
//       default:
//         hasAccess = false;
//     }

//     if (!hasAccess) {
//       this.router.navigate(['/auth/login']);
//       return false;
//     }

//     return true;
//   }
// }


// import { Injectable } from '@angular/core';
// import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
// import { AuthService } from 'src/app/services/auth.service';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { common } from 'src/app/core/constants/common';
// import { teamMemberCommon } from 'src/app/core/constants/team-members-common';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthGuard implements CanActivate {

//   constructor(
//     private router: Router,
//     private authService: AuthService,
//     private storage: AppStorage
//   ) {}

//   async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
//     const token = this.storage.get(common.TOKEN); // Admin token
//     const teamMemberToken = this.storage.get(teamMemberCommon.TEAM_MEMBER_TOKEN); // Team member token
//     const teamMemberData = this.storage.get(teamMemberCommon.TEAM_MEMBER_DATA); // Team member data

//     console.log('AuthGuard: Checking access for route:', teamMemberToken,teamMemberData);

//     // Team member check
//     if (teamMemberToken && teamMemberData) {
//       const validRoles = ['member', 'leader', 'manager', 'editor', 'admin'];
//       if (validRoles.includes(teamMemberData.role)) {
//         if (teamMemberData.role === 'admin') {
//           // Admin gets access to all routes
//           return true;
//         }
//         // Non-admin team members only get access to task-management
//         const requiredProduct = route.data['requiredProduct'];
//         if (requiredProduct === 'task-management') {
//           return true;
//         }
//         // Redirect non-admin team members to team member login for other routes
//         this.router.navigate(['/teammember/login']);
//         return false;
//       }
//       // Invalid role, redirect to team member login
//       this.router.navigate(['/teammember/login']);
//       return false;
//     }

//     // If no team member token, check admin token
//     if (!token) {
//       this.router.navigate(['/auth/login']);
//       return false;
//     }

//     // Admin-specific checks
//     const requiredProduct = route.data['requiredProduct'];
//     if (!requiredProduct) {
//       return true;
//     }

//     const currentBcardId = this.storage.get(common.BUSINESS_CARD);
//     if (!currentBcardId) {
//       this.router.navigate(['/auth/login']);
//       return false;
//     }

//     if (requiredProduct === 'account-settings' || requiredProduct === 'profile' || requiredProduct === 'customers') {
//       return true;
//     }

//     const subscriptionData = await this.authService.getSubscriptionData(currentBcardId);
//     const products = subscriptionData.map(item => item.product);

//     let hasAccess = false;
//     switch (requiredProduct) {
//       case 'business-cards':
//       case 'scanned-cards':
//       case 'shared-history':
//         hasAccess = products.some(product => 
//           product === 'digital-card' || product === 'nfc-card');
//         break;
//       case 'website-details':
//         hasAccess = products.some(product => product === 'website-details');
//         break;
//       case 'google-standee':
//         hasAccess = products.some(product => product === 'google-standee');
//         break;
//       case 'task-management':
//         hasAccess = products.some(product => product === 'task-management');
//         break;
//       default:
//         hasAccess = false;
//     }

//     if (!hasAccess) {
//       this.router.navigate(['/auth/login']); // Admin redirects to auth/login
//       return false;
//     }

//     return true;
//   }
// }



import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';

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
    const token = this.storage.get(common.TOKEN); // Admin token
    const teamMemberToken = this.storage.get(teamMemberCommon.TEAM_MEMBER_TOKEN); // Team member token
    const teamMemberData = this.storage.get(teamMemberCommon.TEAM_MEMBER_DATA); // Team member data
    
    const currentUrl = state.url;
    // console.log('AuthGuard: Checking access for URL:', currentUrl);

    // ==== TEAM MEMBER AUTHENTICATION ====
    if (teamMemberToken && teamMemberData) {
      // console.log('AuthGuard: Team member found:', teamMemberData.role);
      
      const validRoles = ['member', 'leader', 'manager', 'editor', 'admin'];
      
      // if (!validRoles.includes(teamMemberData.role)) {
      //   console.log('AuthGuard: Invalid team member role');
      //   this.router.navigate(['/teammember/login']);
      //   return false;
      // }

      // Admin team member gets access to everything
      if (teamMemberData.role === 'admin') {
        // console.log('AuthGuard: Admin team member - full access granted');
        return true;
      }

      // Regular team members can only access task-management routes
      if (currentUrl.includes('task-management')) {
        // console.log('AuthGuard: Team member accessing task-management - access granted');
        return true;
      }

      // If team member tries to access non-task-management, redirect to task-management
      // console.log('AuthGuard: Team member trying non-task-management route - redirecting');
      this.router.navigate(['/task-management/teamtask']);
      return false;
    }

    // ==== ADMIN AUTHENTICATION ====
    if (!token) {
      // console.log('AuthGuard: No tokens found - redirecting to admin login');
      this.router.navigate(['/auth/login']);
      return false;
    }

    // console.log('AuthGuard: Admin token found - checking permissions');

    // Get required product from route data
    const requiredProduct = route.data['requiredProduct'];
    // console.log('AuthGuard: Required product:', requiredProduct);

    // Routes that don't need subscription check
    if (!requiredProduct || 
        requiredProduct === 'account-settings' || 
        requiredProduct === 'profile' || 
        requiredProduct === 'customers') {
      // console.log('AuthGuard: Admin accessing free route - access granted');
      return true;
    }

    // Check if we have business card ID for subscription check
    const currentBcardId = this.storage.get(common.BUSINESS_CARD);
    if (!currentBcardId) {
      // console.log('AuthGuard: No business card ID - redirecting to admin login');
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Check subscription for paid features
    try {
      const subscriptionData = await this.authService.getSubscriptionData(currentBcardId);
      const products = subscriptionData.map(item => item.product);
      // console.log('AuthGuard: User products:', products);

      let hasAccess = false;

      switch (requiredProduct) {
        case 'business-cards':
        case 'scanned-cards':
        case 'shared-history':
          hasAccess = products.some(product => 
            product === 'digital-card' || product === 'nfc-card');
          break;
        case 'website-details':
          hasAccess = products.some(product => product === 'website-details');
          break;
        case 'google-standee':
          hasAccess = products.some(product => product === 'google-standee');
          break;
        case 'task-management':
          hasAccess = products.some(product => product === 'task-management');
          break;
        default:
          hasAccess = false;
      }

      if (!hasAccess) {
        // console.log('AuthGuard: Admin lacks required subscription - access denied');
        this.router.navigate(['/auth/login']);
        return false;
      }

      // console.log('AuthGuard: Admin has required subscription - access granted');
      return true;

    } catch (error) {
      console.error('AuthGuard: Error checking subscription:', error);
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}