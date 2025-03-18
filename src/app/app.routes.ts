import { Routes } from '@angular/router';
import { SignInComponent } from './views/pages/auth/sign-in/sign-in.component';
import { HomeLayoutComponent } from './views/partials/home-layout/home-layout.component';
import { AdminComponent } from './views/pages/admin/admin.component';
import { BusinessCardDetailComponent } from './views/pages/business-card-detail/business-card-detail.component';
import { BusinessCardComponent } from './views/pages/business-card/business-card.component';
import { AccountSettingsComponent } from './views/pages/account-settings/account-settings.component';
import { GoogleReviewComponent } from './views/pages/google-review/google-review.component';


export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: 'auth/login', component: SignInComponent },
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      // { path: 'admins', component: AdminComponent },
      { path: 'business-cards', component: BusinessCardComponent },
      { path: 'scanned-cards', component: BusinessCardDetailComponent },
      { path: 'google-review', component: GoogleReviewComponent },
      { path: 'account-settings', component: AccountSettingsComponent }
    ],
  },
];
