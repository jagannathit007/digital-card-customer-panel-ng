import { Component, OnInit, ViewChild } from '@angular/core';
import { PersonalTaskService } from 'src/app/services/personal-task.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
import { PersonalTaskComponent } from 'src/app/views/partials/task-managemnt/common-components/personal-task/personal-task.component';
@Component({
  selector: 'app-mydaytask',
  templateUrl: './mydaytask.component.html',
  styleUrl: './mydaytask.component.scss'
})
export class MydaytaskComponent implements OnInit {

   @ViewChild('addTaskModal') addTaskModal!: PersonalTaskComponent;

   constructor(
    private personalTaskService: PersonalTaskService,
    private storage: AppStorage
  ) {}
  
async ngOnInit(): Promise<void> {

}
  openAddTaskModal() {
    this.addTaskModal.openModal();
  }

  onTaskAdded() {
    // Refresh your task list or show success message
    console.log('Task added successfully!');
  }

}
