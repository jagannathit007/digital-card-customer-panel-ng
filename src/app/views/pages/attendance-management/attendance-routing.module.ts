import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendanceDashboardComponent } from './attendance-dashboard/attendance-dashboard.component';
import { OfficesComponent } from './offices/offices.component';
import { EmployeesComponent } from './employees/employees.component';

const routes: Routes = [
    { path: 'dashboard', component: AttendanceDashboardComponent },
    { path: 'offices', component: OfficesComponent },
    { path: 'employees', component: EmployeesComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AttendanceRoutingModule { }
