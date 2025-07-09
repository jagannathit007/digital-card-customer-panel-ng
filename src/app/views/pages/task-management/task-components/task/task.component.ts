// import { Component, OnInit } from '@angular/core';
// import { TaskPermissionsService } from 'src/app/services/task-permissions.service';


// @Component({
//   selector: 'app-task',
//   templateUrl: './task.component.html',
//   styleUrl: './task.component.scss'
// })
// export class TaskComponent implements OnInit {

//   constructor(
//     public TaskPermissionsService: TaskPermissionsService

//   ){}

//   isAdmin = false;

//   ngOnInit(): void{
//     this.isAdmin = this.TaskPermissionsService.isAdminLevelPermission();
//   }
   
// }



// task.component.ts
// chandan - Updated to handle modal communication

import { Component, OnInit, OnDestroy } from '@angular/core';
import { TaskPermissionsService } from 'src/app/services/task-permissions.service';
import { ModalCommunicationService } from 'src/app/services/modal-communication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent implements OnInit, OnDestroy {
  
  constructor(
    public TaskPermissionsService: TaskPermissionsService,
    private modalCommunicationService: ModalCommunicationService
  ) {}

  isAdmin = false;
  
  isAddTeamMemberModalOpen = false;
  isReportGenerationModalOpen = false;
  isTeamTaskCreationModalOpen = false;
  isPersonalTaskCreationModalOpen = false;

  // ! This Properites for Personal task Creation modal
  isTaskClockModalOpen = false;
  taskClockModalData: any = {};
  
  currentModalData: any = {};
  
  private modalSubscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.isAdmin = this.TaskPermissionsService.isAdminLevelPermission();
    
    this.modalSubscription = this.modalCommunicationService.modalTrigger$.subscribe(
      (data) => {
        this.handleModalTrigger(data);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
  }

  // chandan - Handle modal opening based on action type
  private handleModalTrigger(data: any): void {
    
    // chandan - Close all modals first
    this.closeAllModals();
    
    // chandan - Set current modal data
    this.currentModalData = data.keywords || {};
    
    // chandan - Open appropriate modal based on action type
    switch (data.actionType) {
      case 'team_member_add':
        this.isAddTeamMemberModalOpen = true;
        break;
      case 'report_generation':
        this.isReportGenerationModalOpen = true;
        break;
      case 'team_task_creation':
        this.isTeamTaskCreationModalOpen = true;
        break;
      case 'personal_task_creation':
        this.openTaskClockModal(data.keywords || {});
        break;
      default:
    }
  }

  // chandan - Close all modals
  private closeAllModals(): void {
    this.isAddTeamMemberModalOpen = false;
    this.isReportGenerationModalOpen = false;
    this.isTeamTaskCreationModalOpen = false;
    this.isPersonalTaskCreationModalOpen = false;

    this.isTaskClockModalOpen = false; // NEW: Close TaskClock modal

  }

  // chandan - Modal close handlers
  onAddTeamMemberModalClose(): void {
    this.isAddTeamMemberModalOpen = false;
    this.currentModalData = {};
  }

  onReportGenerationModalClose(): void {
    this.isReportGenerationModalOpen = false;
    this.currentModalData = {};
  }

  onTeamTaskCreationModalClose(): void {
    this.isTeamTaskCreationModalOpen = false;
    console.log('Team task creation modal closed');
    this.currentModalData = {};
  }

  onPersonalTaskCreationModalClose(): void {
    this.isPersonalTaskCreationModalOpen = false;
    this.currentModalData = {};
  }

  // chandan - Handle when team member is added successfully
  onTeamMemberAdded(memberData: any): void {
    console.log('chandan - Team member added successfully:', memberData);
    this.onAddTeamMemberModalClose();
  }


 private openTaskClockModal(aiData: any): void {
    this.taskClockModalData = aiData;
    this.isTaskClockModalOpen = true;
    console.log('chandan - Opening TaskClock modal with data:', aiData);
  }


onTaskClockModalClose(): void {
    this.isTaskClockModalOpen = false;
    this.taskClockModalData = {};
    console.log('chandan - TaskClock modal closed');
  }

  onTaskAdded(): void {
    console.log('chandan - Personal task added successfully via AI');
    this.onTaskClockModalClose();
  }

}