import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-teamtask',
  templateUrl: './teamtask.component.html',
  styleUrl: './teamtask.component.scss'
})
export class TeamtaskComponent {

    baseURL = environment.baseURL;

  constructor(
    private storage: AppStorage,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    public modal: ModalService,
    private taskService: TaskService
  ) {}
  
  async ngOnInit() {
  }

}
