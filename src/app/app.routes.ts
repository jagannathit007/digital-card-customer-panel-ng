import { Routes } from '@angular/router';
import { SignInComponent } from './views/pages/auth/sign-in/sign-in.component';
import { HomeLayoutComponent } from './views/partials/home-layout/home-layout.component';
import { DashboardComponent } from './views/pages/dashboard/dashboard.component';
import { AdminComponent } from './views/pages/admin/admin.component';

import { MemberDetailComponent } from './views/pages/member-detail/member-detail.component';
import { BusinessCardDetailComponent } from './views/pages/business-card-detail/business-card-detail.component';
// child components of memberdetail component
import { ServiceComponent } from './views/pages/all-members/service/service.component';
import { GalleryComponent } from './views/pages/all-members/gallery/gallery.component';
import { SelectCardComponent } from './views/pages/all-members/select-card/select-card.component';
import { ViewInquiryComponent } from './views/pages/all-members/view-inquiry/view-inquiry.component';
import { BasicDetailComponent } from './views/pages/all-members/basic-detail/basic-detail.component';
import { BankDetailsComponent } from './views/pages/all-members/bank-details/bank-details.component';
import { ChangeMobilenoComponent } from './views/pages/all-members/change-mobileno/change-mobileno.component';
import { GeneralSettingsComponent } from './views/pages/all-members/general-settings/general-settings.component';


export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: 'auth/login', component: SignInComponent },
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      { path: 'admins', component: AdminComponent },
      { path: 'dashboard', component: DashboardComponent },

      {
        path: 'member-detail',
        component: MemberDetailComponent,
        children: [
          { path: 'gallery', component: GalleryComponent },
          { path: 'service', component: ServiceComponent },
          { path: 'select-card', component: SelectCardComponent },
          { path: 'basic-detail', component: BasicDetailComponent },
          { path: 'view-inquiry', component: ViewInquiryComponent },
          { path: 'bank-details', component: BankDetailsComponent },
          { path: 'bank-details', component: BankDetailsComponent },
          { path: 'change-mobileno', component: ChangeMobilenoComponent },
          { path: 'general-settings', component: GeneralSettingsComponent },
        ],
      },

      { path: 'business-card-detail', component: BusinessCardDetailComponent },
    ],
  },
];
