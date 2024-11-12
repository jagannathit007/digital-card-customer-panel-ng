import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { apiEndpoints } from 'src/app/core/constants/api-endpoints';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { PaginationModel } from 'src/app/core/utilities/pagination-model';
import { MasterService } from 'src/app/services/master.service';
declare var $: any;

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgxPaginationModule, FormsModule, CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent implements OnInit {
  constructor(
    private masterService: MasterService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getData();
  }

  dataListing: PaginationModel | undefined;
  filter: any = { page: 1, search: '', limit: '10' };
  form = { name: '', emailId: '', password: '' };
  getData = async () => {
    let result = await this.masterService.getData(
      this.filter,
      apiEndpoints.GET_ADMINS
    );
    this.dataListing = result;
    this.cdr.detectChanges();
  };

  onSearch = () => {
    this.filter.page = 1;
    this.getData();
  };

  showModal = () => {
    this.form = { name: '', emailId: '', password: '' };
    $('#adminModal').modal('show');
  };

  onSubmit = async () => {
    let result = await this.masterService.createData(
      this.form,
      apiEndpoints.CREATE_ADMIN
    );
    if (result) {
      $('#adminModal').modal('hide');
      this.getData();
    }
  };

  onDelete = async (item: any) => {
    let confirm = await swalHelper.confirmation(
      'Delete',
      'Do you really want to delete?',
      'warning'
    );
    if (confirm.isConfirmed) {
      await this.masterService.deleteData(
        { id: item._id },
        apiEndpoints.DELETE_ADMIN
      );
      this.getData();
    }
  };

  onPageChanged(page: any) {
    this.filter.page = page;
    this.getData();
  }
}
