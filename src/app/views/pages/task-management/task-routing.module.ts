import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskComponent } from './task-components/task/task.component';
import { AllmembersComponent } from './task-components/task/shared/allmembers/allmembers.component';
import { PersonaltaskComponent } from './task-components/task/shared/personaltask/personaltask.component';
import { TeamtaskComponent } from './task-components/task/shared/teamtask/teamtask.component';
import { DashboardComponent } from './task-components/task/shared/dashboard/dashboard.component';
import { MyalltaskComponent } from './task-components/task/shared/myalltask/myalltask.component';
import { MyweektaskComponent } from './task-components/task/shared/myweektask/myweektask.component';
import { MydaytaskComponent } from './task-components/task/shared/mydaytask/mydaytask.component';
import { MemberprofileComponent } from './task-components/task/shared/memberprofile/memberprofile.component';
import { AllBoardsComponent } from './task-components/task/shared/allBoards/allBoards.component';
import { TeamTaskDetailPopupComponent } from './task-components/task/shared/team-task-detail-popup/team-task-detail-popup.component';
import { PublicChatPopupComponent } from '../../partials/task-managemnt/common-components/public-chat-popup/public-chat-popup.component';

const routes: Routes = [
  {
    path: '',
    component: TaskComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'allmembers', component: AllmembersComponent },
      { path: 'boards', component: AllBoardsComponent },
      {
        path: 'teamtask',
        component: TeamtaskComponent,
        children: [
          {
            path: 'detail/:taskId',
            component: TeamTaskDetailPopupComponent
          },
          {
            path: 'announcements',
            component: PublicChatPopupComponent
          }
        ]
      },
      { path: 'personal-task/my-day', component: MydaytaskComponent },
      { path: 'personal-task/next-seven-days', component: MyweektaskComponent },
      { path: 'personal-task/all', component: MyalltaskComponent },
      { path: 'profile', component: MemberprofileComponent },
      { path: '', redirectTo: 'allmembers', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TaskRoutingModule {}
