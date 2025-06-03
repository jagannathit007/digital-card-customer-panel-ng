import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskComponent } from './task-components/task/task.component';
import { AllmembersComponent } from './task-components/task/shared/allmembers/allmembers.component';
import { PersonaltaskComponent } from './task-components/task/shared/personaltask/personaltask.component';
import { TeamtaskComponent } from './task-components/task/shared/teamtask/teamtask.component';
import { DashboardComponent } from './task-components/task/shared/dashboard/dashboard.component';


const routes: Routes = [
  {
      path: '',
      component: TaskComponent,
      children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'allmembers', component: AllmembersComponent },
      { path: 'boards', component: PersonaltaskComponent },
      { path: 'teamtask', component: TeamtaskComponent },
      { path: '', redirectTo: 'allmembers', pathMatch: 'full' },
    ],
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskRoutingModule { }
