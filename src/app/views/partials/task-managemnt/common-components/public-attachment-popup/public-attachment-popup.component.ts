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
import { TaskService } from 'src/app/services/task.service';
import { TaskPermissionsService } from 'src/app/services/task-permissions.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { SocketService } from 'src/app/services/socket.service';

interface TaskMember {
  _id: string;
  name: string;
  emailId: string;
  profileImage: string;
  role: string;
}

interface BoardAttachment {
  _id: string;
  files: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadedFrom: 'storage' | 'url';
    _id: string;
  }>;
  uploadedBy: TaskMember;
  type: 'task' | 'board';
  taskId: string | null;
  boardId: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-public-attachment-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './public-attachment-popup.component.html',
  styleUrl: './public-attachment-popup.component.scss',
})
export class PublicAttachmentPopupComponent implements OnInit, OnDestroy {
  @Input() boardId: string = '';
  @Output() closeAttachments = new EventEmitter<void>();

  // Route and navigation
  private routeSubscription?: Subscription;

  // Attachment data
  attachments: BoardAttachment[] = [];
  BoardMembers: any = [];
  imageBaseUrl = '';

  // UI State
  isLoading = true;
  isUploading = false;

  // Attachment permissions
  attachmentPermissions = true; // Assuming board attachments are generally accessible

  // Backup for undo functionality
  private backupData: any = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService,
    public taskPermissionsService: TaskPermissionsService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.imageBaseUrl = environment.imageURL;
    this.setupRouteSubscriptions();
    this.loadAttachmentData();

    this.listenSockets();
  }

  listenSockets() {
    this.socketService.onBoardUpdate().subscribe((data) => {
      if (data.boardId !== this.boardId) return;

      console.log('data from sockets : ', data);

      if (data.type === 'attachment_add') {
        this.attachments.push(data.updates);
      } else if (data.type === 'attachment_remove') {
        this.attachments = data.updates;
      }
    });
  }

  isAttachmentAccessible(attachment: BoardAttachment): boolean {
    if (!attachment) return false;

    const currentUser = this.taskPermissionsService.getCurrentUser();

    const isPrivileged = this.taskPermissionsService.isBoardLevelPermission();
    const isCreatorMember = attachment?.uploadedBy?._id === currentUser?._id;

    if (isPrivileged || isCreatorMember) {
      return true;
    }

    return false;
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  private setupRouteSubscriptions(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.boardId = params.get('boardId') || '';
    });
  }

  private async loadAttachmentData() {
    if (!this.boardId) {
      console.error('Board ID is required');
      this.isLoading = false;
      return;
    }

    try {
      // Load board attachments - you'll need to create this API endpoint
      const attachmentsResponse = await this.taskService.getAttachments({
        boardId: this.boardId,
        type: 'board',
      });

      console.log('Attachments response:', attachmentsResponse);

      if (attachmentsResponse) {
        this.attachments = attachmentsResponse;
      }

      // Load available users for the board
      const users = await this.loadAvailableUsers(this.boardId);

      if (users) {
        this.isLoading = false;
      } else {
        this.isLoading = false;
      }
    } catch (error) {
      console.error('Error loading attachment data:', error);
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
  trackByAttachmentId(index: number, attachment: BoardAttachment): string {
    return attachment._id;
  }

  // Attachment methods
  async onFileUpload(event: any): Promise<void> {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Check each file size
      for (let file of files) {
        if (file.size > 10 * 1024 * 1024) {
          // 10MB in bytes
          await swalHelper.showToast(
            'File size exceeded the 10MB limit',
            'error'
          );
          event.target.value = ''; // Clear the file input
          return;
        }
      }

      this.isUploading = true;
      
      try {
        var formData = new FormData();

        for (let file of files) {
          formData.append('files', file);
        }
        formData.append('boardId', this.boardId);
        formData.append('type', 'board');

        const response = await this.taskService.addAttachment(formData);

        console.log('Attachment response:', response);

        if (response) {
          this.attachments.push(response);
          this.socketService.sendBoardUpdate(
            this.boardId,
            'attachment_add',
            response
          );
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        await swalHelper.showToast(
          'Error uploading file. Please try again.',
          'error'
        );
      } finally {
        this.isUploading = false;
        event.target.value = ''; // Clear the file input
      }
    }
  }

  async deleteAttachment(fileId: string, attachmentId: string): Promise<void> {
    this.createBackup('attachments');

    let confirm = await swalHelper.confirmation(
      'Are you sure?',
      'This action will permanently delete the file.',
      'question'
    );

    if (confirm.isConfirmed) {
      const response = await this.taskService.deleteAttachment({
        boardId: this.boardId,
        fileId: fileId,
        attachmentId: attachmentId,
        type: 'board',
      });

      if (response) {
        const attachmentIndex = this.attachments.findIndex(
          (attachment) => attachment._id === attachmentId
        );

        if (attachmentIndex !== -1) {
          const attachment = this.attachments[attachmentIndex];

          // Check if attachment has multiple files
          if (attachment.files.length > 1) {
            // Remove only the specific file from the attachment
            attachment.files = attachment.files.filter(
              (file) => file._id !== fileId
            );
          } else {
            // Remove the entire attachment if it has only one file
            this.attachments.splice(attachmentIndex, 1);
          }

          this.socketService.sendBoardUpdate(
            this.boardId,
            'attachment_remove',
            this.attachments
          );
        }
      } else {
        // Revert to backup if the deletion fails
        this.undoChanges('attachments');
      }
    }
  }

  closePopup(): void {
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

  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return 'fa-file-pdf';
    if (fileType.includes('image')) return 'fa-file-image';
    if (fileType.includes('word')) return 'fa-file-word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet'))
      return 'fa-file-excel';
    return 'fa-file';
  }

  // Utility methods
  private createBackup(field?: string): void {
    if (field) {
      this.backupData[field] = JSON.parse(JSON.stringify((this as any)[field]));
    } else {
      this.backupData = JSON.parse(JSON.stringify(this.attachments));
    }
  }

  private undoChanges(field: string): void {
    if (this.backupData[field] !== undefined) {
      (this as any)[field] = this.backupData[field];
    }
  }
}
