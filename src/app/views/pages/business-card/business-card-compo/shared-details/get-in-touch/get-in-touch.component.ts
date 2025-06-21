import { Component } from '@angular/core';
import { common } from 'src/app/core/constants/common';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { BusinessCardService } from 'src/app/services/business-card.service';

@Component({
  selector: 'app-get-in-touch',
  standalone: false,
  templateUrl: './get-in-touch.component.html',
  styleUrl: './get-in-touch.component.scss'
})
export class GetInTouchComponent {
  contactRequests: any
  isLoading: boolean = false;
  businessCardId: string = '';

  constructor(
    private businessCardService: BusinessCardService,
    private storage: AppStorage
  ) { }

  payload = {
    page: 1,
    limit: 10,
    search: '',
    businessCardId: ''
  }

  ngOnInit(): void {
    this.businessCardId = this.storage.get(common.BUSINESS_CARD);
    this._getContactRequests();
  }

  isTitleEditAllowed = false;
  customContactTitle = "";

  _getContactRequests = async () => {
    this.isLoading = true;
    this.payload.businessCardId = this.businessCardId
    let response = await this.businessCardService.getContactRequest(this.payload)
    if (response) {
      this.contactRequests = response;
      this.contactRequestVisible = response.contactRequestVisible;
      this.customContactTitle = response.contactRequestTitle;
    }
    this.isLoading = false;

  }

  async deleteContactRequest(id: string): Promise<void> {
    const confirm = await swalHelper.delete();
    if (confirm.isConfirmed) {
      this.businessCardService.deleteContactRequest({ businessCardId: this.businessCardId, _id: id })
    }
    this._getContactRequests();
  }

  onChange(): void {
    this.payload.page = 1;
    this._getContactRequests()
  }

  pageChanged(page: number): void {
    this.payload.page = page;
    this._getContactRequests()
  }

  contactRequestVisible: boolean = false
  async _updateVisibility() {
    let response = await this.businessCardService.updateVisibility({
      contactRequestVisible: this.contactRequestVisible,
      businessCardId: this.businessCardId
    });
    if (response) {
      swalHelper.showToast('Visibility successfully updated', 'success')
    }
    this._getContactRequests()
  }

  async updateCustomTitle() {
    if (this.customContactTitle.trim().length > 0) {
      let response = await this.businessCardService.updateCustomTitle({
        contactRequestTitle: this.customContactTitle,
        businessCardId: this.businessCardId
      });
      if (response) {
        swalHelper.showToast('Contact form title updated!', 'success')
      }
      this._getContactRequests()
    }
  }

  onVisibilityChanged() {
    this.contactRequestVisible = !this.contactRequestVisible
    this._updateVisibility();
  }
}
