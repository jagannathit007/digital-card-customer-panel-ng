import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { ModalService } from 'src/app/core/utilities/modal';
import { WebsiteBuilderService } from 'src/app/services/website-builder.service';

@Component({
  selector: 'app-servies-enquiry',
  templateUrl: './servies-enquiry.component.html',
  styleUrl: './servies-enquiry.component.scss'
})

export class ServiesEnquiryComponent implements OnInit {
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;
  enquiries: any[] = [];
  filteredEnquiries: any[] = [];
  selectedEnquiryId: string = '';
  selectedEnquiry: any = null;
  businessCardId: string = '';

  constructor(
    private storage: AppStorage,
    private authService: AuthService,
    public modal: ModalService,
    private webService: WebsiteBuilderService
  ) {}

  ngOnInit() {
    this.businessCardId = this.storage.get(common.BUSINESS_CARD);
    this._fetchEnquiries();
  }

  async _fetchEnquiries() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let results = await this.authService.getWebsiteDetails(businessCardId);
      if (results) {
        this.enquiries = results.serviceEnquiries ? [...results.serviceEnquiries] : [];
        this.filteredEnquiries = [...this.enquiries];
        this.totalItems = this.enquiries.length;
      }
    } catch (error) {
      console.error("Error fetching service enquiries: ", error);
    } finally {
      this.isLoading = false;
    }
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredEnquiries = [...this.enquiries];
    } else {
      this.filteredEnquiries = this.enquiries.filter(enquiry =>
        enquiry.customer.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        enquiry.customer.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.totalItems = this.filteredEnquiries.length;
    this.p = 1; // Reset to first page on search
  }

  onItemsPerPageChange() {
    this.p = 1; // Reset to first page when items per page changes
  }

  pageChangeEvent(event: number) {
    this.p = event;
  }

  async _deleteEnquiry(id: any) {
    const confirm = await swalHelper.delete();
    if (confirm.isConfirmed) {
      let result = await this.webService.deleteServiceEnquiry({ businessCardId: this.businessCardId, _id: id });
      if (result) {
        swalHelper.success('Enquiry deleted');
      }
      this._fetchEnquiries();
    }
  }

  stripHtml(content: any): any {
    if (!content) return '';
    return content.replace(/<[^>]*>/g, '');
  }
}