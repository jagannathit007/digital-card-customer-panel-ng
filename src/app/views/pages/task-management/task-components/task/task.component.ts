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

import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { TaskPermissionsService } from 'src/app/services/task-permissions.service';
import { ModalCommunicationService } from 'src/app/services/modal-communication.service';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket.service';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { TaskService } from 'src/app/services/task.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate(
          '200ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'translateX(20px)' })
        ),
      ]),
    ]),
  ],
})
export class TaskComponent implements OnInit, OnDestroy {
  constructor(
    public TaskPermissionsService: TaskPermissionsService,
    private modalCommunicationService: ModalCommunicationService,
    private socketService: SocketService,
    private storage: AppStorage,
    private taskService: TaskService,
    private router: Router
  ) {
    this.toastStartTime = 0;
  }

  isAdmin = false;

  boards = signal<any[]>([]);

  isAddTeamMemberModalOpen = false;
  isReportGenerationModalOpen = false;
  isTeamTaskCreationModalOpen = false;
  isPersonalTaskCreationModalOpen = false;

  isRefreshWarningToastOpened = false;
  countdown = 30; // 30 seconds countdown
  private countdownSubscription: Subscription | null = null;

  // ! This Properites for Personal task Creation modal
  isTaskClockModalOpen = false;
  taskClockModalData: any = {};

  currentModalData: any = {};

  private modalSubscription: Subscription = new Subscription();

  isMentionToastVisible = false;
  mentionedTaskId: string = '';
  private mentionToastTimeout: any;
  private toastTimerPaused = false;
  private remainingToastTime = 0;
  private toastStartTime: number;

  ngOnInit(): void {
    this.isAdmin = this.TaskPermissionsService.isAdminLevelPermission();

    this.loadData();
    this.modalSubscription =
      this.modalCommunicationService.modalTrigger$.subscribe((data) => {
        this.handleModalTrigger(data);
      });
    // join in task management room
    this.socketService.joinRoom('task_management');
    this.listenBoardMembersUpdateSocket();
    this.listenAllBoardsUpdateSocket();
    this.setupCommentsUpdateBySocket();
  }

  setupCommentsUpdateBySocket() {
    this.socketService.onCommentUpdated().subscribe((data) => {
      console.log('comment updated from sockets : ', data);

      let isMemberMentioned = data.updates.mentionedMembers.includes(
        this.TaskPermissionsService.getCurrentUser()._id
      );

      if (isMemberMentioned) {
        this.showMentionToast(data.taskId);
      }
    });
  }

  ngOnDestroy(): void {
    // leave from task management room
    this.socketService.leaveRoom('task_management');

    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }

    // Clean up the countdown
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  listenBoardMembersUpdateSocket() {
    this.socketService.onBoardMembersUpdate().subscribe((data) => {
      console.log('members updated in board from sockets : ', data);
      let isStillMember = false;

      const isBoardExists = this.boards().some(
        (board) => board._id === data.boardId
      );

      data.updates.members.forEach((member: any) => {
        if (member._id === this.TaskPermissionsService.getCurrentUser()._id) {
          isStillMember = true;
        }
      });

      if (isBoardExists && !isStillMember) {
        if (
          data.boardId === this.storage.get(teamMemberCommon.BOARD_DATA)._id
        ) {
          this.storage.set(teamMemberCommon.BOARD_DATA, '');
        }
        this.showRefreshWarning();

        // remove the board from the local state
        this.boards.update((boards) =>
          boards.filter((b) => b._id !== data.boardId)
        );
      } else if (!isBoardExists && isStillMember) {
        this.showRefreshWarning();

        this.boards.update((boards) => [...boards, data.updates]);
      }
    });
  }

  listenAllBoardsUpdateSocket() {
    this.socketService.onAllBoardsUpdate().subscribe((data) => {
      console.log('data from sockets : ', data);

      // check if the teamtask route is open or not
      const currentUrl = window.location.href;
      const isTeamTaskRouteOpen = currentUrl.includes(
        '/task-management/teamtask'
      );
      const isPersonalTaskRouteOpen = currentUrl.includes(
        '/task-management/personal-task'
      );
      const isBoardRouteOpen = currentUrl.includes('/task-management/boards');

      let isMember = false;

      const isBoardExists = this.boards().some(
        (board) => board._id === data.boardId
      );

      isMember = data.updates.members.includes(
        this.TaskPermissionsService.getCurrentUser()._id
      );

      if (
        data.type === 'board_create' &&
        ((isBoardExists && !isMember) || (!isBoardExists && isMember))
      ) {
        this.showRefreshWarning();
      }

      if (data.type === 'board_delete' && isMember) {
        const boardId = data.updates._id;

        if (boardId === this.storage.get(teamMemberCommon.BOARD_DATA)._id) {
          this.storage.set(teamMemberCommon.BOARD_DATA, '');
        }
        this.showRefreshWarning();

        this.boards.update((boards) => boards.filter((b) => b._id !== boardId));
      }
    });
  }

  private async loadData() {
    // this.loading = true;
    let result: any = null;
    if (
      this.TaskPermissionsService.getCurrentUser().role === 'admin' ||
      this.TaskPermissionsService.getCurrentUser().role === 'editor'
    ) {
      result = await this.taskService.GetBoardByAdmin({});
    } else {
      result = await this.taskService.GetJoinedBoards({});
    }
    if (result && result) {
      this.boards.set(result);
      // this.loading = false;
    } else {
      this.boards.set([]);
      // this.loading = false;
    }
  }

  showMentionToast(taskId: string) {
    this.mentionedTaskId = taskId;
    this.isMentionToastVisible = true;
    this.toastStartTime = Date.now();

    // Clear any existing timeout
    if (this.mentionToastTimeout) {
      clearTimeout(this.mentionToastTimeout);
    }

    // Hide after 5 seconds
    this.remainingToastTime = 5000;
    this.mentionToastTimeout = setTimeout(() => {
      if (!this.toastTimerPaused) {
        this.isMentionToastVisible = false;
      }
    }, this.remainingToastTime);
  }

  pauseToastTimer() {
    if (this.mentionToastTimeout) {
      this.toastTimerPaused = true;
      clearTimeout(this.mentionToastTimeout);
      this.remainingToastTime =
        this.remainingToastTime - (Date.now() - this.toastStartTime);
    }
  }

  resumeToastTimer() {
    if (this.mentionToastTimeout && this.toastTimerPaused) {
      this.toastTimerPaused = false;
      this.toastStartTime = Date.now();
      this.mentionToastTimeout = setTimeout(() => {
        this.isMentionToastVisible = false;
      }, this.remainingToastTime);
    }
  }

  closeMentionToast() {
    this.isMentionToastVisible = false;
    if (this.mentionToastTimeout) {
      clearTimeout(this.mentionToastTimeout);
    }
  }

  navigateToMentionedTask() {
    if (this.mentionedTaskId) {
      this.closeMentionToast();
      this.router.navigate(
        [`/task-management/teamtask/detail/${this.mentionedTaskId}`],
        { queryParams: { tab: 'comments' } }
      );
    }
  }

  showRefreshWarning() {
    this.isRefreshWarningToastOpened = true;
    this.countdown = 30; // Reset countdown to 30 seconds
    this.startCountdown();
  }

  startCountdown() {
    // Clear any existing countdown
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }

    this.countdownSubscription = interval(1000)
      .pipe(
        takeWhile(() => this.countdown > 0 && this.isRefreshWarningToastOpened)
      )
      .subscribe(() => {
        this.countdown--;

        if (this.countdown <= 0) {
          this.refreshPage();
        }
      });
  }

  refreshPage() {
    // Clean up the countdown
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = null;
    }

    this.isRefreshWarningToastOpened = false;
    window.location.reload();
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
    this.currentModalData = {};
  }

  onPersonalTaskCreationModalClose(): void {
    this.isPersonalTaskCreationModalOpen = false;
    this.currentModalData = {};
  }

  // chandan - Handle when team member is added successfully
  onTeamMemberAdded(memberData: any): void {
    this.onAddTeamMemberModalClose();
  }

  private openTaskClockModal(aiData: any): void {
    this.taskClockModalData = aiData;
    this.isTaskClockModalOpen = true;
  }

  onTaskClockModalClose(): void {
    this.isTaskClockModalOpen = false;
    this.taskClockModalData = {};
  }

  onTaskAdded(): void {
    this.onTaskClockModalClose();
  }
}
