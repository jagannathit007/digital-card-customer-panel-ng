import { Component, OnInit } from '@angular/core';
import { PersonalTaskService } from 'src/app/services/personal-task.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';

@Component({
  selector: 'app-mydaytask',
  templateUrl: './mydaytask.component.html',
  styleUrl: './mydaytask.component.scss'
})
export class MydaytaskComponent implements OnInit {

  constructor(
    private personalTaskService: PersonalTaskService, 
    private storage: AppStorage
  ) {}
  
async ngOnInit(): Promise<void> {
  try {
    const data = await this.personalTaskService.getPersonalTaskDetailsCount();
    console.log('Task Count Response:', data);
  } catch (error) {
    console.error('Error fetching task count:', error);
  }
}


}
