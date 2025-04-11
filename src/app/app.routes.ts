import { Routes } from '@angular/router';
import { SignInComponent } from './views/pages/auth/sign-in/sign-in.component';
import { HomeLayoutComponent } from './views/partials/home-layout/home-layout.component';
import { AdminComponent } from './views/pages/admin/admin.component';
import { BusinessCardDetailComponent } from './views/pages/business-card-detail/business-card-detail.component';
import { BusinessCardComponent } from './views/pages/business-card/business-card-compo/business-card.component';
import { AccountSettingsComponent } from './views/pages/account-settings/account-settings.component';
import { GoogleStandeeComponent } from './views/pages/google-standee/google-standee.component';
import { AuthGuard } from './guards/auth.guard';
import { WebsiteComponent } from './views/pages/website/website.component';
import { SharedHistoryComponent } from './views/pages/shared-history/shared-history.component';


export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: 'auth/login', component: SignInComponent },
  {
    path: '',
    component: HomeLayoutComponent,
    canActivate: [AuthGuard], // Protect the entire layout
    children: [
      {
        path: 'shared-history',
        component:SharedHistoryComponent,
        canActivate: [AuthGuard],
        data: { requiredProduct: 'shared-history' }
      },
      // {
      //   path: 'admins', 
      //   component: AdminComponent,
      //   canActivate: [AuthGuard],
      // },
      {
        path: 'business-cards',
        loadChildren:()=>import('./views/pages/business-card/business-card.module').then(m=>m.BusinessCardModule),
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
        path: 'website-details',
        component: WebsiteComponent,
        canActivate: [AuthGuard],
        data: { requiredProduct: 'website-details' }
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
      },
      
      {
        path: 'shared-history',
        loadComponent:()=>import('./views/pages/shared-history/shared-history.component').then(c=>c.SharedHistoryComponent),
        canActivate: [AuthGuard],
        data: { requiredProduct: 'shared-history' }
      },
    ],
  },
  // Catch-all redirect to account settings
  { path: '**', redirectTo: 'HomeLayoutComponent' }
];