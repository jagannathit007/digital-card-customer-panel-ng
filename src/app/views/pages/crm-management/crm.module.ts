import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';

import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { CrmDashboardComponent } from './crm-dashboard/crm-dashboard.component';
import { LeadsManagementComponent } from './leads-management/leads-management.component';
import { CrmRoutingModule } from './crm-routing.module';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CrmRoutingModule,
    NgxPaginationModule,
    NgSelectModule,
    FormsModule,
    CrmDashboardComponent,
    LeadsManagementComponent
]
})
export class CrmModule {}
