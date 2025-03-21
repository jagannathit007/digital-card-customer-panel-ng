import { Routes } from '@angular/router';
import { SignInComponent } from './views/pages/auth/sign-in/sign-in.component';
import { HomeLayoutComponent } from './views/partials/home-layout/home-layout.component';
import { AdminComponent } from './views/pages/admin/admin.component';
import { BusinessCardDetailComponent } from './views/pages/business-card-detail/business-card-detail.component';
import { BusinessCardComponent } from './views/pages/business-card/business-card.component';
import { AccountSettingsComponent } from './views/pages/account-settings/account-settings.component';
import { GoogleStandeeComponent } from './views/pages/google-standee/google-standee.component';
import { AuthGuard } from './guards/auth.guard';


export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: 'auth/login', component: SignInComponent },
  {
    path: '',
    component: HomeLayoutComponent,
    canActivate: [AuthGuard], // Protect the entire layout
    children: [
      // {
      //   path: 'admins', 
      //   component: AdminComponent,
      //   canActivate: [AuthGuard],
      // },
      {
        path: 'business-cards',
        component: BusinessCardComponent,
        canActivate: [AuthGuard],
        data: { requiredProduct: 'business-cards' }
      },
      {
        path: 'scanned-cards',
        component: BusinessCardDetailComponent,
        canActivate: [AuthGuard],
        data: { requiredProduct: 'scanned-cards' }
      },
      {
        path: 'google-standee',
        component: GoogleStandeeComponent,
        canActivate: [AuthGuard],
        data: { requiredProduct: 'google-standee' }
      },
      {
        path: 'account-settings',
        component: AccountSettingsComponent,
        canActivate: [AuthGuard],
        data: { requiredProduct: 'account-settings' }
      }
    ],
  },
  // Catch-all redirect to account settings
  { path: '**', redirectTo: 'account-settings' }
];