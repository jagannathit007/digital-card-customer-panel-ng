import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrmDashboardComponent } from './crm-dashboard/crm-dashboard.component';
import { LeadsManagementComponent } from './leads-management/leads-management.component';
import { LeadDetailPopupComponent } from './lead-detail-popup/lead-detail-popup.component';

const routes: Routes = [
    { path: 'dashboard', component: CrmDashboardComponent },
    {
    path: 'leads',
    component: LeadsManagementComponent,
    children: [
      {
        path: ':leadId',
        component: LeadDetailPopupComponent,
      },
    ],
  },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CrmRoutingModule { }
