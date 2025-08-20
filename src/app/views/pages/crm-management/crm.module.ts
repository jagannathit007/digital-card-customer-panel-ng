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
import { LeadCardComponent } from './lead-card/lead-card.component';
import { CommonLeadCreatePopupComponent } from './common-lead-create-popup/common-lead-create-popup.component';
import { LeadDetailPopupComponent } from './lead-detail-popup/lead-detail-popup.component';
import { PrioritySelectionDropdownComponent } from './priority-selection-dropdown/priority-selection-dropdown.component';
import { CrmRoutingModule } from './crm-routing.module';

@NgModule({
  declarations: [
    LeadsManagementComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CrmRoutingModule,
    NgxPaginationModule,
    NgSelectModule,
    FormsModule,
    DragDropModule,
    FullCalendarModule,
    LeadCardComponent,
    CommonLeadCreatePopupComponent,
    LeadDetailPopupComponent,
    PrioritySelectionDropdownComponent,
    CrmDashboardComponent
  ]
})
export class CrmModule {}
