import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';
import { TaskService } from 'src/app/services/task.service';

// Define ChatData interface (adjust fields as needed)
interface ChatData {
  taskId: string;
  text: string;
  mentionedMembers: string[];
  type: string;
  boardId: string;
}


@Component({
  selector: 'app-teamtask',
  templateUrl: './teamtask.component.html',
  styleUrl: './teamtask.component.scss'
})
export class TeamtaskComponent {

    baseURL = environment.baseURL;
    myBoardId: string = '6836fc455260ac3ab0ed07a5'; 
    myTaskId: string = 'dummy-task-id'; 
    
  constructor(
    private storage: AppStorage,
    private cdr: ChangeDetectorRef,
    public modal: ModalService,
    private taskService: TaskService
  ) {}
  
  async ngOnInit() {
  }

    onCommentAdded(comment: ChatData) {
    // You can show a toast, reload comments, etc.
    console.log('Comment added:', comment);
    // Example: swalHelper.success('Comment added successfully!');
  }
}
