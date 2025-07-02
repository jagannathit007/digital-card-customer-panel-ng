// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-myalltask',
//   templateUrl: './myalltask.component.html',
//   styleUrl: './myalltask.component.scss',
// })
// export class MyalltaskComponent {

// }




// personal taks modal compennet 
import { Component, OnInit, ViewChild } from '@angular/core';
import { PersonalTaskService } from 'src/app/services/personal-task.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
import { PersonalTaskComponent } from 'src/app/views/partials/task-managemnt/common-components/personal-task/personal-task.component';
@Component({
 selector: 'app-myalltask',
  templateUrl: './myalltask.component.html',
  styleUrl: './myalltask.component.scss',
})
export class MyalltaskComponent implements OnInit {

   @ViewChild('addTaskModal') addTaskModal!: PersonalTaskComponent;

   isTaskClockVisible: boolean = false;
   taskClockMode: 'add' | 'edit' = 'add';

   constructor(
    private personalTaskService: PersonalTaskService,
    private storage: AppStorage
  ) {}
  
async ngOnInit(): Promise<void> {

}

openAddTaskModal(): void {
  this.taskClockMode = 'add';
  this.isTaskClockVisible = true;
}




}
