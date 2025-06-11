import { Component, OnInit } from '@angular/core';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { BusinessCardService } from 'src/app/services/business-card.service';
import { Doc, Payload, Services } from './business-services.interface';
import { ModalService } from 'src/app/core/utilities/modal';
import { environment } from 'src/env/env.local';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';

@Component({
  selector: 'app-business-services',
  templateUrl: './business-services.component.html',
  styleUrl: './business-services.component.scss'
})
export class BusinessServicesComponent implements OnInit {
  constructor(
    private businessCardService: BusinessCardService,
    private modal: ModalService,
    private storage: AppStorage
  ) {}

  businessCardId: any;
  imagePreviewUrl: string | null = null; // New property to cache blob URL

  ngOnInit() {
    this.businessCardId = this.storage.get(common.BUSINESS_CARD);
    this.payLoad.businessCardId = this.businessCardId;
    this.selectedServices.businessCardId = this.businessCardId;
    this._getServices();
  }

  payLoad: any = {
    search: '',
    page: 1,
    limit: 10,
    businessCardId: ''
  };

  onChange() {
    this.payLoad.page = 1;
    this._getServices();
  }

  onPageChange(page: number) {
    this.payLoad.page = page;
    this._getServices();
  }

  _reset() {
    this.payLoad = {
      search: '',
      page: 1,
      limit: 10,
      businessCardId: this.businessCardId
    };
    this.selectedServices = {
      _id: '',
      title: '',
      image: null as File | null,
      description: '',
      businessCardId: this.businessCardId
    };
    this.imagePreviewUrl = null; // Reset preview URL
    this._getServices();
  }

  services: any;
  isLoading: boolean = false;
  _getServices = async () => {
    try {
      this.isLoading = true;
      let response = await this.businessCardService.getServices(this.payLoad);
      if (response) {
        this.services = response;
      }
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      console.log('Something went Wrong', error);
    }
  };

  selectedServices: any = {
    _id: null,
    title: '',
    image: null as File | null,
    description: '',
    businessCardId: ''
  };
  imageBaseURL = environment.imageURL;

  onOpenUpdateModal(item: any) {
    this.selectedServices = { ...item }; // Deep copy to avoid mutating original
    this.selectedServices.businessCardId = this.businessCardId;
    this.imagePreviewUrl = item.image instanceof File ? URL.createObjectURL(item.image) : null; // Set preview URL for existing file
    this.modal.open('create-services');
  }

  onOpenCraeteModal() {
    this._reset(); // Reset form before opening
    this.modal.open('create-services');
  }

  onCloseModal(modal: string) {
    this.modal.close(modal);
    this._reset();
  }

  onUploadImage(event: any) {
    const file = event.target.files[0] as File;
    this.selectedServices.image = file;
    if (file) {
      this.imagePreviewUrl = URL.createObjectURL(file); // Cache blob URL
    } else {
      this.imagePreviewUrl = null;
    }
  }

  showImage(image: any) {
    let windowData: any = window.open(
      `${this.imageBaseURL}${image}`,
      'mywindow',
      'location=1,status=1,scrollbars=1,  width=700,height=700'
    );
    windowData.moveTo(0, 0);
  }

  onCreateService() {
    const formdata = new FormData();
    formdata.append('title', this.selectedServices.title);
    formdata.append('description', this.selectedServices.description);
    if (this.selectedServices.businessCardId) {
      formdata.append('businessCardId', this.selectedServices.businessCardId);
    }
    if (this.selectedServices.image) {
      formdata.append('image', this.selectedServices.image);
    }
    if (this.selectedServices._id) {
      formdata.append('id', this.selectedServices._id);
    }
    this._createServices(formdata);
  }

  _createServices = async (data: any) => {
    try {
      await this.businessCardService.createServices(data);
      this._reset();
      this.modal.close('create-services');
    } catch (error) {
      console.log('Something went Wrong', error);
    }
  };

  _deleteServices = async (id: string) => {
    try {
      const confirm = await swalHelper.delete();
      if (confirm.isConfirmed) {
        await this.businessCardService.deleteServices({ businessCardId: this.businessCardId, id: id });
      }
      this._reset();
    } catch (error) {
      console.log('Something went Wrong', error);
    }
  };

  getImagePreview(img: any): string {
    if (img instanceof File && this.imagePreviewUrl) {
      return this.imagePreviewUrl; // Use cached URL
    }
    return this.imageBaseURL + img;
  }

  ngOnDestroy() {
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl); // Clean up blob URL
    }
  }
}