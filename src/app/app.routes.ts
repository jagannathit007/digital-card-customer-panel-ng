import { TaskRoutingModule } from './views/pages/task-management/task-routing.module';
import { Routes } from '@angular/router';
import { SignInComponent } from './views/pages/auth/sign-in/sign-in.component';
import { HomeLayoutComponent } from './views/partials/home-layout/home-layout.component';
import { AuthGuard } from './guards/auth.guard';
import { TokenVerificationComponent } from './views/standalone/token-verification/token-verification.component';
import { DemoTaskManagementComponent } from './views/pages/demo/demo-task-management/demo-task-management.component';
import { DemoGoogleReviewComponent } from './views/pages/demo/demo-google-review/demo-google-review.component';
import { DemoAttendanceComponent } from './views/pages/demo/demo-attendance/demo-attendance.component';
import { OfficesComponent } from './views/pages/offices/offices.component';
import { EmployeesComponent } from './views/pages/employees/employees.component';


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
      // {
      //   path: 'task-management',
      //   loadChildren:()=>import('./views/pages/task-management/task.module').then(m=>m.TaskModule),
      //   canActivate: [AuthGuard],
      //   data: { requiredProduct: 'task-management' }
      // },
      // {
      //   path: 'google-standee',
      //   loadComponent:()=>import('./views/pages/google-standee/google-standee.component').then(m=>m.GoogleStandeeComponent),
      //   canActivate: [AuthGuard],
      //   data: { requiredProduct: 'google-standee' }
      // },
      {
        path: 'attendance',
        component: DemoAttendanceComponent,
      },
      {
        path: 'offices',
        component: OfficesComponent
      },
      {
        path: 'employees',
        component: EmployeesComponent
      },
      {
        path: 'task-management',
        component: DemoTaskManagementComponent,
      },
      {
        path: 'google-reviews',
        component: DemoGoogleReviewComponent,
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