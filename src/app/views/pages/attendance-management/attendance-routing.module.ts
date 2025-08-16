import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendanceDashboardComponent } from './attendance-dashboard/attendance-dashboard.component';
import { OfficesComponent } from './offices/offices.component';
import { EmployeesComponent } from './employees/employees.component';
import { AtendanceReportComponent } from './atendance-report/atendance-report.component';
import { LeaveRequestsComponent } from './leave-requests/leave-requests.component';

const routes: Routes = [
    { path: 'dashboard', component: AttendanceDashboardComponent },
    { path: 'offices', component: OfficesComponent },
    { path: 'employees', component: EmployeesComponent },
    { path: 'reports', component:  AtendanceReportComponent},
    { path: 'leave-requests', component:  LeaveRequestsComponent},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AttendanceRoutingModule { }
