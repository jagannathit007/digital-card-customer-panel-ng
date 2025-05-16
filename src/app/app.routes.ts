import { Routes } from '@angular/router';
import { SignInComponent } from './views/pages/auth/sign-in/sign-in.component';
import { HomeLayoutComponent } from './views/partials/home-layout/home-layout.component';
import { AuthGuard } from './guards/auth.guard';
import { TokenVerificationComponent } from './views/standalone/token-verification/token-verification.component';


export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: 'auth/login', component: SignInComponent },
  { path: 'token/authToken', component: TokenVerificationComponent },
  {
    path: '',
    component: HomeLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'business-cards',
        loadChildren:()=>import('./views/pages/business-card/business-card.module').then(m=>m.BusinessCardModule),
        canActivate: [AuthGuard],
        data: { requiredProduct: 'business-cards' }
      },
      {
        path: 'scanned-cards',
        loadComponent:()=>import('./views/pages/business-card-detail/business-card-detail.component').then(c=>c.BusinessCardDetailComponent),
        canActivate: [AuthGuard],
        data: { requiredProduct: 'scanned-cards' }
      },
      {
        path: 'website-details',
        loadChildren:()=>import('./views/pages/website/website.module').then(m=>m.WebsiteModule),
        canActivate: [AuthGuard],
        data: { requiredProduct: 'website-details' }
      },
      {
        path: 'google-standee',
        loadComponent:()=>import('./views/pages/google-standee/google-standee.component').then(m=>m.GoogleStandeeComponent),
        canActivate: [AuthGuard],
        data: { requiredProduct: 'google-standee' }
      },
      {
        path: 'profile',
        loadComponent:()=>import('./views/pages/profile-page/profile-page.component').then(m=>m.ProfilePageComponent),
        canActivate: [AuthGuard],
        data: { requiredProduct: 'profile' }
      },
      {
        path: 'account-settings',
        loadComponent:()=>import('./views/pages/account-settings/account-settings.component').then(m=>m.AccountSettingsComponent),
        canActivate: [AuthGuard],
        data: { requiredProduct: 'account-settings' }
      },
      {
        path: 'shared-history',
        loadComponent:()=>import('./views/pages/shared-history/shared-history.component').then(c=>c.SharedHistoryComponent),
        canActivate: [AuthGuard],
        data: { requiredProduct: 'shared-history' }
      },
      {
        path: 'customers',
        loadComponent:()=>import('./views/pages/customers/customers.component').then(c=>c.CustomersComponent),
        canActivate: [AuthGuard],
        data: { requiredProduct: 'customers' }
      },
    ],
  },
  // Catch-all redirect to account settings
  { path: '**', redirectTo: 'business-cards' }
];