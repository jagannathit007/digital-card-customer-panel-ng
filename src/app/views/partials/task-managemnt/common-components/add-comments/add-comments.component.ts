import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Modal } from 'bootstrap';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { TaskService } from 'src/app/services/task.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-add-comments',
  standalone: true,
  imports: [],
  templateUrl: './add-comments.component.html',
  styleUrl: './add-comments.component.scss'
})
export class AddCommentsComponent implements OnInit {
  
  ngOnInit(): void {
    console.log("there is chatpage")
  }

}
