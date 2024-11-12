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
  selector: 'app-expertise',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './expertise.component.html',
  styleUrl: './expertise.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpertiseComponent implements OnInit {
  constructor(
    private masterService: MasterService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getTechnologiesData();
    this.getData();
  }

  dataListing: PaginationModel | undefined;
  filter: any = { page: 1, search: '', limit: '10' };
  form = { id: '0', name: '', description: '', technology: '' };
  getData = async () => {
    let result = await this.masterService.getData(
      this.filter,
      apiEndpoints.GET_EXPERTISES
    );
    this.dataListing = result;
    this.cdr.detectChanges();
  };

  technologies: any[] = [];
  getTechnologiesData = async () => {
    let result = await this.masterService.getData(
      this.filter,
      apiEndpoints.GET_ALL_TECHNOLOGIES
    );
    this.technologies = result;
    this.cdr.detectChanges();
  };

  onSearch = () => {
    this.filter.page = 1;
    this.getData();
  };

  showModal = () => {
    this.form = { id: '0', name: '', description: '', technology: '' };
    $('#expertiseModal').modal('show');
  };

  onSubmit = async () => {
    let result = await this.masterService.createData(
      this.form,
      apiEndpoints.SAVE_EXPERTISE
    );
    if (result) {
      $('#expertiseModal').modal('hide');
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
        apiEndpoints.DELETE_EXPERTISE
      );
      this.getData();
    }
  };

  onPageChanged(page: any) {
    this.filter.page = page;
    this.getData();
  }
}
