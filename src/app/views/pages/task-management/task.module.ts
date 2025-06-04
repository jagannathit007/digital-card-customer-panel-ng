import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaskRoutingModule } from './task-routing.module';


import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TooltipDirective } from '../../partials/tooltip/tooltip.directive';
import { ToggleComponent } from '../../partials/toggle/toggle.component';
import { DebounceDirective } from 'src/app/core/directives/debounce';


import { TaskComponent } from './task-components/task/task.component';
import { AllmembersComponent } from './task-components/task/shared/allmembers/allmembers.component';
import { PersonaltaskComponent } from './task-components/task/shared/personaltask/personaltask.component';
import { TeamtaskComponent } from './task-components/task/shared/teamtask/teamtask.component';
import { MydaytaskComponent } from './task-components/task/shared/mydaytask/mydaytask.component';
import { MyweektaskComponent } from './task-components/task/shared/myweektask/myweektask.component';
import { MyalltaskComponent } from './task-components/task/shared/myalltask/myalltask.component';
import { AddTeamMemberComponent } from "../../partials/task-managemnt/common-components/addTeamMember/addTeamMember.component";

@NgModule({
  declarations: [
    TaskComponent,
    AllmembersComponent,
    PersonaltaskComponent,
    TeamtaskComponent,
    MydaytaskComponent,
    MyweektaskComponent,
    MyalltaskComponent,
  ],
  imports: [
    CommonModule,
    TaskRoutingModule,
    RouterModule,
    NgxPaginationModule,
    NgSelectModule,
    FormsModule,
    TooltipDirective,
    ToggleComponent,
    DebounceDirective,
    AddTeamMemberComponent
]
})
export class TaskModule { }
