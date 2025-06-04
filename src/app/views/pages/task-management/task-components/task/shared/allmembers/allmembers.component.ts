import { TaskMemberAuthService } from './../../../../../../../services/task-member-auth.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-allmembers',
  templateUrl: './allmembers.component.html',
  styleUrl: './allmembers.component.scss'
})
export class AllmembersComponent {
    baseURL = environment.baseURL;
    members: any[] = [];
  page: number = 1;
  limit: number = 10;
  totalPages: number = 1;
  search: string = '';
  loading: boolean = false;

  constructor(
    private storage: AppStorage,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    public modal: ModalService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.fetchMembers();
  }

  async fetchMembers() {
    this.loading = true;
    const requestData = {
      page: this.page,
      limit: this.limit,
      search: this.search
    };

    const result = await this.taskService.GetAllMembers(requestData);
    if (result && result.docs) {
      this.members = result.docs;
      this.totalPages = result.totalPages;
    } else {
      this.members = [];
      this.totalPages = 1;
    }
    this.loading = false;
  }

  onSearchChange(event: any) {
    this.page = 1;
    this.fetchMembers();
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.fetchMembers();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.fetchMembers();
    }
  }
  
}
