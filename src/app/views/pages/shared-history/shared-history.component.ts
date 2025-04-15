import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { common } from 'src/app/core/constants/common';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { ModalService } from 'src/app/core/utilities/modal';
import { AuthService } from 'src/app/services/auth.service';
import { CustomerService } from 'src/app/services/customer.service';
import { ShareHistoryService } from 'src/app/services/share-history.service';

@Component({
  selector: 'app-shared-history',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './shared-history.component.html',
  styleUrl: './shared-history.component.scss'
})
export class SharedHistoryComponent {

  constructor(
    private shareHistoryService: ShareHistoryService,
    private storage: AppStorage,
    private cdr: ChangeDetectorRef,
    private modal: ModalService,
    private customerService: CustomerService
  ) { }
  businessCard: any;
  async ngOnInit() {
    this.businessCard = this.storage.get(common.BUSINESS_CARD);
    this.payload.businessCardId = this.businessCard
    this.customer.businessCardId = this.businessCard
    this._getShareHistory();
    // this.getKeywords();
  }

  payload = {
    search: '',
    page: 1,
    limit: 10,
    businessCardId: ''
  }

  reset() {
    this.payload = {
      search: '',
      page: 1,
      limit: 10,
      businessCardId: this.businessCard
    },
      this.customer = {
        name: '',
        dob: '',
        countryCode: '',
        mobile: '',
        businessCardId: this.businessCard,
        spouse_relation: '',
        spouse_DOB: '',
        spouse_name: '',
      },
      this._getShareHistory();
  }
  onChange() {
    this.payload.page = 1
    this._getShareHistory();
  }

  isLoading: boolean = false;
  historyDetails: any = { docs: [] }
  _getShareHistory = async () => {
    try {
      this.isLoading = true
      let response = await this.shareHistoryService.getSharedHistory(this.payload)
      if (response) {
        this.historyDetails = response
      }
      this.isLoading = false
      this.cdr.detectChanges();
    } catch (error) {
      this.isLoading = false
      this.cdr.detectChanges();
      console.log("Something went wrong", error)
    }
  }

  onPageChange(page: number) {
    this.payload.page = page;
    this._getShareHistory()
  }

  onOpenExportModal() {
    this.modal.open('exportModal')
  }

  selectedKeyword = "";
  keywords: any[] = [];
  getKeywords = async () => {
    let response = await this.shareHistoryService.getSharedKeyword({ businessCardId: this.businessCard });
    if (response != null) {
      this.keywords = response;
      this.keywords.sort();
    }
  };

  _exportExcel = async () => {
    this.shareHistoryService.downloadExcel({
      businessCardId: this.businessCard
    });
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
  onOpenAddToCustomerModal(data: any) {
    this.customer.name = data.name
    const raw = data.mobile || '';
    const digitsOnly = raw.replace(/[^\d]/g, '');

    if (digitsOnly.length > 10) {
      this.customer.countryCode = digitsOnly.slice(0, digitsOnly.length - 10);
      this.customer.mobile = digitsOnly.slice(-10);
    } else {
      this.customer.countryCode = '';
      this.customer.mobile = digitsOnly;
    }
    // this.customer.mobile=data.mobile
    this.customer.businessCardId = this.businessCard
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
