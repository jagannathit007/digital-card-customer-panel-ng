// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-myweektask',
//   templateUrl: './myweektask.component.html',
//   styleUrl: './myweektask.component.scss'
// })
// export class MyweektaskComponent {

// }




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
  selector: 'app-myweektask',
  templateUrl: './myweektask.component.html',
  styleUrl: './myweektask.component.scss'
})
export class MyweektaskComponent {

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
