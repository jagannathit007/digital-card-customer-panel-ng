import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';

import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { AttendanceDashboardComponent } from './attendance-dashboard/attendance-dashboard.component';
import { EmployeesComponent } from './employees/employees.component';
import { OfficesComponent } from './offices/offices.component';
import { AttendanceRoutingModule } from './attendance-routing.module';
import { AtendanceReportComponent } from './atendance-report/atendance-report.component';
import { LeaveRequestsComponent } from './leave-requests/leave-requests.component';

@NgModule({
  declarations: [
    AttendanceDashboardComponent,
    EmployeesComponent,
    OfficesComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AttendanceRoutingModule,
    RouterModule,
    NgxPaginationModule,
    NgSelectModule,
    FormsModule,
    AtendanceReportComponent,
    LeaveRequestsComponent,
]
})
export class AttendanceModule {}
