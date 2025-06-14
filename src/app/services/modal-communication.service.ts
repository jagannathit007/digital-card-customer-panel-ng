// import { Injectable } from '@angular/core';
// import { Subject } from 'rxjs';
// import { TeamMemberData } from './../views/partials/task-managemnt/common-components/addTeamMember/addTeamMember.component';

// interface ModalData {
//   actionType: string;
//   keywords?: Partial<TeamMemberData>;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class ModalCommunicationService {
//   private modalTriggerSubject = new Subject<ModalData>();
//   modalTrigger$ = this.modalTriggerSubject.asObservable();

//   triggerModal(data: ModalData) {
//     this.modalTriggerSubject.next(data);
//   }
// }



// modal-communication.service.ts
// chandan - Improved service to handle all 4 modal types

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TeamMemberData } from './../views/partials/task-managemnt/common-components/addTeamMember/addTeamMember.component';

// chandan - Define interfaces for all modal types
export interface TeamMemberModalData extends Partial<TeamMemberData> {}

export interface ReportGenerationModalData {
  report_type?: string;
  member_name?: string;
  date_range?: string;
  format?: string;
  [key: string]: any;
}

export interface TeamTaskCreationModalData {
  task_title?: string;
  task_description?: string;
  assigned_to?: string;
  priority?: string;
  due_date?: string;
  [key: string]: any;
}

export interface PersonalTaskCreationModalData {
  task_title?: string;
  task_description?: string;
  priority?: string;
  due_date?: string;
  category?: string;
  [key: string]: any;
}

// chandan - Union type for all possible modal data
export type ModalKeywords = 
  | TeamMemberModalData 
  | ReportGenerationModalData 
  | TeamTaskCreationModalData 
  | PersonalTaskCreationModalData;

// chandan - Main interface for modal communication
interface ModalData {
  actionType: 'team_member_add' | 'report_generation' | 'team_task_creation' | 'personal_task_creation';
  keywords?: ModalKeywords;
}

@Injectable({
  providedIn: 'root'
})
export class ModalCommunicationService {
  private modalTriggerSubject = new Subject<ModalData>();
  modalTrigger$ = this.modalTriggerSubject.asObservable();

  // chandan - Generic method to trigger any modal
  triggerModal(data: ModalData) {
    console.log('chandan - Triggering modal:', data);
    this.modalTriggerSubject.next(data);
  }

  // chandan - Specific methods for each modal type (optional, for better type safety)
  triggerTeamMemberModal(keywords: TeamMemberModalData) {
    this.triggerModal({
      actionType: 'team_member_add',
      keywords
    });
  }

  triggerReportGenerationModal(keywords: ReportGenerationModalData) {
    this.triggerModal({
      actionType: 'report_generation',
      keywords
    });
  }

  triggerTeamTaskCreationModal(keywords: TeamTaskCreationModalData) {
    this.triggerModal({
      actionType: 'team_task_creation',
      keywords
    });
  }

  triggerPersonalTaskCreationModal(keywords: PersonalTaskCreationModalData) {
    this.triggerModal({
      actionType: 'personal_task_creation',
      keywords
    });
  }
}