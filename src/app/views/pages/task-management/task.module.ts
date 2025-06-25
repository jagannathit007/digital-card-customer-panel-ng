import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TaskRoutingModule } from './task-routing.module';


import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TooltipDirective } from '../../partials/tooltip/tooltip.directive';
import { ToggleComponent } from '../../partials/toggle/toggle.component';
import { DebounceDirective } from 'src/app/core/directives/debounce';

import { DragDropModule } from '@angular/cdk/drag-drop';


import { TaskComponent } from './task-components/task/task.component';
import { AllmembersComponent } from './task-components/task/shared/allmembers/allmembers.component';
import { PersonaltaskComponent } from './task-components/task/shared/personaltask/personaltask.component';
import { TeamtaskComponent } from './task-components/task/shared/teamtask/teamtask.component';
import { MydaytaskComponent } from './task-components/task/shared/mydaytask/mydaytask.component';
import { MyweektaskComponent } from './task-components/task/shared/myweektask/myweektask.component';
import { MyalltaskComponent } from './task-components/task/shared/myalltask/myalltask.component';
import { MemberprofileComponent } from './task-components/task/shared/memberprofile/memberprofile.component';
import { AddTeamMemberComponent } from "../../partials/task-managemnt/common-components/addTeamMember/addTeamMember.component";
import { SendingMailComponent } from "../../partials/task-managemnt/common-components/sendingMail/sendingMail.component";
import { ChangeMemberRoleComponent } from '../../partials/task-managemnt/common-components/changeMEmberRole/changeMEmberRole.component';
import { CustomdataComponent } from '../../partials/task-managemnt/common-components/customdata/customdata.component';
import { MemberDetailDropdownComponent } from '../../partials/task-managemnt/common-components/add-members-dropdown/add-members-dropdown.component';
import { AddCommentsComponent } from '../../partials/task-managemnt/common-components/add-comments/add-comments.component';
// ! AI COMPENENTS
import { AiassistantComponent } from '../../partials/task-managemnt/common-components/aiassistant/aiassistant.component';
import { TeamTaskCardComponent } from "../../partials/task-managemnt/common-components/team-task-card/team-task-card.component";
import { PersonalTaskComponent } from '../../partials/task-managemnt/common-components/personal-task/personal-task.component';

@NgModule({
  declarations: [
    TaskComponent,
    AllmembersComponent,
    PersonaltaskComponent,
    TeamtaskComponent,
    MydaytaskComponent,
    MyweektaskComponent,
    MyalltaskComponent,
    MemberprofileComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TaskRoutingModule,
    RouterModule,
    NgxPaginationModule,
    NgSelectModule,
    FormsModule,
    DragDropModule,
    TooltipDirective,
    ToggleComponent,
    DebounceDirective,
    AddTeamMemberComponent,
    SendingMailComponent,
    ChangeMemberRoleComponent,
    CustomdataComponent,
    AiassistantComponent,
    MemberDetailDropdownComponent,
    AddCommentsComponent,
    TeamTaskCardComponent,
    PersonalTaskComponent
]
})
export class TaskModule { }
