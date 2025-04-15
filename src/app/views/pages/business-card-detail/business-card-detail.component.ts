import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';
import { CustomerService } from 'src/app/services/customer.service';
import { DigitOnlyDirective } from 'src/app/core/directives/digit-only';

declare var $: any;

@Component({
  selector: 'app-business-card-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, DigitOnlyDirective],
  templateUrl: './business-card-detail.component.html',
  styleUrl: './business-card-detail.component.scss',
})
export class BusinessCardDetailComponent {
  scannedCards: any;
  keywords: any[] = [];
  p: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  searchTerm: string = '';
  editCard: any = {};

  constructor(
    private authService: AuthService,
    private storage: AppStorage,
    private modal: ModalService,
    private customerService: CustomerService
  ) { }

  businessCardId: any
  async ngOnInit() {
    this.businessCardId = await this.storage.get(common.BUSINESS_CARD);
    this.customer.businessCardId = this.businessCardId
    this.getKeywords();
    this._getScannedCards();
  }

  isLoading = false;
  _getScannedCards = async () => {
    this.isLoading = true;
    let query = {
      search: this.searchTerm,
      page: this.p,
      limit: this.itemsPerPage,
    };
    let response = await this.authService.getScannedCards(query);
    if (response != null) {
      this.scannedCards = response;
      this.totalItems = response.totalDocs;
    }
    this.isLoading = false;
  };

  updateScannedCard = async () => {
    let response = await this.authService.updateScannedCard(this.editCard);
    if (response != null) {
      this._getScannedCards();
      $('#editModal').modal('hide');
      swalHelper.showToast('Card Updated Sucessfully!', 'success');
    }
  };

  selectedKeyword = "";
  getKeywords = async () => {
    let response = await this.authService.getKeywords({});
    if (response != null) {
      this.keywords = response;
      this.keywords.sort();
    }
  };

  deleteScannedCard = async (id: String) => {
    let confirm = await swalHelper.confirmation(
      'Delete',
      'Do you really want to delete?',
      'warning'
    );
    if (confirm.isConfirmed) {
      let response = await this.authService.deleteScannedCard(id);
      if (response != null) {
        this.p = 1;
        this._getScannedCards();
        swalHelper.showToast('Card Updated Sucessfully!', 'success');
      }
    }
  };

  exportExcel = async () => {
    let userId = this.storage.get(common.USER_DATA)._id;
    let businessCardId = this.storage.get(common.BUSINESS_CARD);
    let link = `${environment.baseURL}/${environment.route}/download-excel/scanned-cards?u=${userId}&b=${businessCardId}&k=${this.selectedKeyword}`;
    window.open(encodeURI(link), "_blank");
  }

  openEditModal(card: any): void {
    this.editCard = { ...card };
    $('#editModal').modal('show');
  }

  pageChangeEvent(event: number): void {
    this.p = event;
    this._getScannedCards();
  }

  onSearch(): void {
    this.p = 1;
    this._getScannedCards();
  }

  onItemsPerPageChange(): void {
    this.p = 1;
    this._getScannedCards();
  }

  customer = {
    name: '',
    dob: '',
    countryCode: '',
    mobile: '',
    businessCardId: '',
    spouse_relation: '',
    spouse_DOB: '',
    spouse_name: '',
  }

  reset() {
    this.customer = {
      name: '',
      dob: '',
      countryCode: '',
      mobile: '',
      businessCardId: this.businessCardId,
      spouse_relation: '',
      spouse_DOB: '',
      spouse_name: '',
    },
      this._getScannedCards()
  }

  onOpenAddToCustomerModal(data: any) {
    this.customer.businessCardId = this.businessCardId
    const raw = data.mobile || '';
    const digitsOnly = raw.replace(/[^\d]/g, '');

    if (digitsOnly.length > 10) {
      this.customer.countryCode = digitsOnly.slice(0, digitsOnly.length - 10);
      this.customer.mobile = digitsOnly.slice(-10);
    } else {
      this.customer.countryCode = '';
      this.customer.mobile = digitsOnly;
    }
    this.customer.name = data.name
    this.modal.open('add-customer');
  }

  _SaveCustomer = async () => {
    this.modal.close('add-customer');
    let conn = await swalHelper.confirmation('Create', 'Do you really want to create Customer?', 'warning')
    if (conn.isConfirmed) {
      await this.customerService.addCustomer(this.customer)
    }
    this.reset();
  }

  onCloseCustomerModal(){
    this.reset();
    this.modal.close('add-customer');
  }
}
