import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AddCommentsComponent } from 'src/app/views/partials/task-managemnt/common-components/add-comments/add-comments.component';
import { TaskService } from 'src/app/services/task.service';
import { TaskPermissionsService } from 'src/app/services/task-permissions.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from 'src/env/env.local';
import { SocketService } from 'src/app/services/socket.service';

interface TaskMember {
  _id: string;
  name: string;
  emailId: string;
  profileImage: string;
  role: string;
}

interface BoardComment {
  _id: string;
  text: string;
  mentionedMembers: TaskMember[];
  createdBy: TaskMember;
  createdAt: string;
  isDeleted: boolean;
}

@Component({
  selector: 'app-public-chat-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, AddCommentsComponent],
  templateUrl: './public-chat-popup.component.html',
  styleUrl: './public-chat-popup.component.scss',
})
export class PublicChatPopupComponent implements OnInit, OnDestroy {
  @Input() boardId: string = '';
  @Output() closeChat = new EventEmitter<void>();

  // Route and navigation
  private routeSubscription?: Subscription;

  // Chat data
  comments: BoardComment[] = [];
  BoardMembers: any = [];
  imageBaseUrl = '';

  // UI State
  isLoading = true;

  // Chat permissions
  chatPermissions = true; // Assuming board chat is generally accessible

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService,
    public taskPermissionsService: TaskPermissionsService,
    private sanitizer: DomSanitizer,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.imageBaseUrl = environment.imageURL;
    this.setupRouteSubscriptions();
    this.loadChatData();

    this.listenSockets();
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  listenSockets() {
    this.socketService.onBoardUpdate().subscribe((data) => {
      if(data.boardId !== this.boardId) return;
      
      console.log('data from sockets : ', data);

      if(data.type==='comment_add') {
        this.comments.push(data.updates);
        this.scrollToBottom();
      }else if(data.type==='comment_remove') {
        const comment = this.comments.find((c) => c._id === data.updates._id);
        if (comment) {
          comment.isDeleted = true;
        }
      }
    })
  }

  private setupRouteSubscriptions(): void {
    // this.routeSubscription = this.route.params.subscribe((params) => {
    //   if (params['boardId']) {
    //     this.boardId = params['boardId'];
    //     this.loadChatData();
    //   }
    // });

    this.route.queryParamMap.subscribe((params) => {
      this.boardId = params.get('boardId') || '';
    });
  }

  private async loadChatData() {
    if (!this.boardId) {
      console.error('Board ID is required');
      this.isLoading = false;
      return;
    }

    try {
      // Load board comments - you'll need to create this API endpoint
      const commentsResponse = await this.taskService.getComments({
        boardId: this.boardId,
        type: 'board',
      });

      console.log('Comments response:', commentsResponse);

      if (commentsResponse) {
        this.comments = commentsResponse;
      }

      // Load available users for the board
      const users = await this.loadAvailableUsers(this.boardId);

      if (users) {
        this.isLoading = false;
        this.scrollToBottom();
      } else {
        this.isLoading = false;
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
      this.isLoading = false;
    }
  }

  async loadAvailableUsers(boardId: string): Promise<boolean> {
    try {
      const users = await this.taskService.GetAllAvailableMembersForBoard({
        boardId: boardId,
      });
      if (users) {
        this.BoardMembers = users;
        console.log('Available users loaded:', users);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error loading users:', error);
      return false;
    }
  }

  // TrackBy functions for ngFor
  trackByCommentId(index: number, comment: BoardComment): string {
    return comment._id;
  }

  // Filter functions
  getActiveCommentsCount(): number {
    return this.comments.filter((c) => !c.isDeleted).length;
  }

  getActiveComments(): BoardComment[] {
    return this.comments.filter((c) => !c.isDeleted);
  }

  // Comment methods
  onCommentAdded(comment: any): void {
    this.scrollToBottom();
    const newComment: BoardComment = {
      _id: comment._id,
      text: comment.text,
      mentionedMembers: comment.mentionedMembers,
      createdBy: comment.createdBy,
      createdAt: comment.createdAt,
      isDeleted: false,
    };
    this.comments.push(newComment);

    this.socketService.sendBoardUpdate(
      this.boardId,
      'comment_add',
      newComment
    );
  }

  formatComment(
    commentId: string,
    text: string,
    mentionedMembers: TaskMember[],
    createdBy: string
  ): SafeHtml {
    const isFirstComment =
      this.comments.findIndex((c) => c._id === commentId) === 0;
    let tooltipPlacement = 'left';

    if (createdBy === this.taskPermissionsService.getCurrentUser()._id) {
      tooltipPlacement = 'right';
    }

    let mentionIndex = 0;

    const formatted = text.replace(/\*(.*?)\*/g, (match, p1) => {
      const userId = mentionedMembers[mentionIndex++] || 'Unknown';
      const member = this.BoardMembers.find((m: any) => m._id === userId);

      const name = member?.name || 'Unknown';
      const email = member?.emailId || 'Not available';
      const image =
        member?.profileImage ||
        '/task_management/profiles/default-profile-image.png';

      return `
      <span 
        style="background-color:${
          tooltipPlacement === 'left' ? '#d3d3d38a' : '#0d6efd33'
        }; padding: 2px 6px; border-radius: 10px; position: relative; cursor: pointer;"
        onmouseover="this.querySelector('.tooltip').style.visibility='visible'; this.querySelector('.tooltip').style.opacity='1';"
        onmouseout="this.querySelector('.tooltip').style.visibility='hidden'; this.querySelector('.tooltip').style.opacity='0';"
        class="mention"
        data-user-id="${userId}"
      >
        ${p1}
        <span 
          style="
            visibility: hidden;
            background-color: #333;
            color: #fff;
            text-align: center;
            padding: 5px 8px;
            border-radius: 6px;
            position: absolute;
            z-index: 1;
            ${isFirstComment ? 'top' : 'bottom'} : ${
        isFirstComment ? '30px' : '125%'
      } ;
            ${tooltipPlacement}: 0%;
            font-size: 13px;
            opacity: 0;
            transition: opacity 0.3s;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            max-width: 300px;
            width: max-content;
          "
          class="tooltip"
        >
          <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
            <img 
              src="${this.imageBaseUrl + image}" 
              alt="${name}" 
              style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;"
            />
            <div style="text-align: start; overflow-wrap: break-word;">
              <div style="font-weight: bold;">${name}</div>
              <div style="font-size: 12px; color: #dfdfdf;">${email}</div>
            </div>
          </div>
        </span>
      </span>&nbsp;
    `;
    });

    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }

  deleteComment(commentId: string): void {
    const comment = this.comments.find((c) => c._id === commentId);
    if (comment) {
      swalHelper
        .delete()
        .then(async (result) => {
          if (result.isConfirmed) {
            const response = await this.taskService.deleteComment({
              boardId: this.boardId,
              commentId: comment._id,
              type: 'board',
            });

            if (response) {
              comment.isDeleted = true;

              this.socketService.sendBoardUpdate(
                this.boardId,
                'comment_remove',
                comment
              );
            }
          }
        })
        .catch((error) => {
          console.error('Error deleting comment:', error);
        });
    }
  }

  closePopup(): void {
    // this.closeChat.emit();
    this.router.navigate(['/task-management/teamtask']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);

    const isDateIsToday = date.getDate() === new Date().getDate();
    return (
      (isDateIsToday ? 'Today' : date.toLocaleDateString()) +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.getElementById(
        `chatCommentsList`
      ) as HTMLElement;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 100);
  }
}
