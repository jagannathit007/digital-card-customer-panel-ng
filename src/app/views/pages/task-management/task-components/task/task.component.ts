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
    console.log('chandan - Received modal trigger:', data);
    
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
        this.isPersonalTaskCreationModalOpen = true;
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
}