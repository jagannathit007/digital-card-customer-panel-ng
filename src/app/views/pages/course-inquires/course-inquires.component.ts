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

@Component({
  selector: 'app-course-inquires',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './course-inquires.component.html',
  styleUrl: './course-inquires.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseInquiresComponent implements OnInit {
  constructor(
    private masterService: MasterService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getData();
  }

  dataListing: PaginationModel | undefined;
  filter: any = { page: 1, search: '', limit: '10' };
  form = { id: '0', reviewer: '', description: '' };
  getData = async () => {
    let result = await this.masterService.getData(
      this.filter,
      apiEndpoints.GET_COURSE_APPLICATIONS
    );
    this.dataListing = result;
    this.cdr.detectChanges();
  };

  onSearch = () => {
    this.filter.page = 1;
    this.getData();
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
        apiEndpoints.DELETE_TESTIMONIAL
      );
      this.getData();
    }
  };

  onPageChanged(page: any) {
    this.filter.page = page;
    this.getData();
  }
}
