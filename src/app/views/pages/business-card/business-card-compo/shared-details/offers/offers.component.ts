import { Component } from '@angular/core';
import { common } from 'src/app/core/constants/common';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { ModalService } from 'src/app/core/utilities/modal';
import { BusinessCardService } from 'src/app/services/business-card.service';
import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-offers',
  standalone: false,
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.scss'
})
export class OffersComponent {
  constructor(
    private businessCardService: BusinessCardService,
    private modal: ModalService,
    private storage: AppStorage
  ) { }

  businessCardId: any;
  ngOnInit() {
    this.businessCardId = this.storage.get(common.BUSINESS_CARD);
    this.payLoad.businessCardId = this.businessCardId;
    this.selectedOffer.businessCardId = this.businessCardId;
    this._getOffers();
  }

  payLoad: any = {
    search: '',
    page: 1,
    limit: 10,
    businessCardId: ''
  }

  onChange() {
    this.payLoad.page = 1;
    this._getOffers();
  }

  onPageChange(page: number) {
    this.payLoad.page = page;
    this._getOffers();
  }

  _reset() {
    this.payLoad = {
      search: '',
      page: 1,
      limit: 10,
      businessCardId: this.businessCardId
    }
    this.selectedOffer = {
      _id: '',
      title: '',
      discount: '',
      validUntil: '',
      image: null as File | null,
      description: '',
      terms: '',
      businessCardId: this.businessCardId
    }
    this._getOffers();
  }

  offers: any;
  offersVisible:boolean=true
  isLoading: boolean = false;
  _getOffers = async () => {
    try {
      this.isLoading = true;
      let response = await this.businessCardService.getOffers(this.payLoad);
      if (response) {
        this.offers = response;
        this.offersVisible = response?.offersVisible;
      }
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      console.log('Something went Wrong', error);
    }
  }

  selectedOffer: any = {
    _id: null,
    title: '',
    discount: '',
    validUntil: '',
    image: null as File | null,
    description: '',
    terms: '',
    businessCardId: '',
    visible:true
  }
  imageBaseURL = environment.imageURL;

  onOpenCreateModal() {
    this.selectedOffer = {
      _id: null,
      title: '',
      discount: '',
      validUntil: '',
      image: null,
      description: '',
      terms: '',
      businessCardId: this.businessCardId,
      visible:true
    };
    this.modal.open('create-offer');
  }

  onCloseModal(modal: string) {
    this.modal.close(modal);
    this._reset();
  }

  onUploadImage(event: any) {
    const file = event.target.files[0] as File;
    this.selectedOffer.image = file;
  }

  showImage(image: any) {
    let windowData: any = window.open(
      `${this.imageBaseURL}${image}`,
      'mywindow',
      'location=1,status=1,scrollbars=1,  width=700,height=700'
    );
    windowData.moveTo(0, 0);
  }

  existingImage: string = '';

  onOpenUpdateModal(item: any) {
    this.selectedOffer = { ...item };
    this.existingImage = item.image;
    this.selectedOffer.businessCardId = this.businessCardId;
    this.modal.open('create-offer');
  }
  
  onCreateOffer() {
    const formdata = new FormData();
    formdata.append('title', this.selectedOffer.title);
    formdata.append('description', this.selectedOffer.description);
    formdata.append('discount', this.selectedOffer.discount);
    formdata.append('validUntil', this.selectedOffer.validUntil);
    formdata.append('terms', this.selectedOffer.terms);
    formdata.append('visible', this.selectedOffer.visible);
    if (this.selectedOffer.businessCardId) {
      formdata.append('businessCardId', this.selectedOffer.businessCardId);
    }
  
    if (this.selectedOffer.image) {
      formdata.append('image', this.selectedOffer.image);
    } else if (this.existingImage) {
      formdata.append('image', this.existingImage);
    }
  
    if (this.selectedOffer._id) {
      formdata.append('id', this.selectedOffer._id);
    }
    
    this._createOffer(formdata);
  }
  _createOffer = async (data: any) => {
    try {
      await this.businessCardService.createOffer(data);
      this._reset();
      this.modal.close('create-offer');
    } catch (error) {
      console.log('Something went Wrong', error);
    }
  }

  _deleteOffer = async (id: string) => {
    try {
      const confirm = await swalHelper.delete();
      if (confirm.isConfirmed) {
        await this.businessCardService.deleteOffer({ businessCardId: this.businessCardId, id: id });
      }
      this._reset();
    } catch (error) {
      console.log('Something went Wrong', error);
    }
  }

  getImagePreview(img: any): string {
    if (img instanceof File) {
      return URL.createObjectURL(img);
    }
    return this.imageBaseURL + (img);
  }

  removeImage() {
    this.selectedOffer.image = null;
    this.existingImage = '';
  }

  // Add this new method
  async _updateOffersVisibility() {
    try {
      await this.businessCardService.updateVisibility({
        offersVisible: this.offersVisible,
        businessCardId: this.businessCardId
      });
      swalHelper.showToast('Visibility updated successfully!', 'success');
      this._getOffers()
    } catch (error) {
      console.error('Error updating visibility:', error);
      swalHelper.showToast('Error updating visibility!', 'error');
      // Revert the toggle if the update fails
      this.offersVisible = !this.offersVisible;
    }
  }

  onVisibilityChanged(){
    this.offersVisible=!this.offersVisible
    this._updateOffersVisibility();
  }


}
