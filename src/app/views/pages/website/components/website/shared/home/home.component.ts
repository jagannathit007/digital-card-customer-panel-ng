import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Editor, Toolbar } from 'ngx-editor';
import { NgxEditorModule } from 'ngx-editor';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { WebsiteBuilderService } from 'src/app/services/website-builder.service';
import { ModalService } from 'src/app/core/utilities/modal';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;
  private objectURLCache = new Map<File, string>();
  baseURL = environment.baseURL;
  isLoading: boolean = false;

  // Rich text editors
  headingEditor: Editor = new Editor();
  sloganEditor: Editor = new Editor();
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify']
  ];

  home: any = {
    heading: '',
    slogan: '',
    bannerImage: null,
    logoImage: null,
  };
  logoImagePreview: string | ArrayBuffer | null = null;

  constructor(
    private storage: AppStorage,
    public modal: ModalService,
    public authService: AuthService,
    private websiteService: WebsiteBuilderService
  ) {}

  businessCardId: any;
  websiteName: any;
  selectedCountryCode: string = '91';
  mobileNumber: string = '';
  message: any = ``;
  isEditingWebsiteName: boolean = false;
  originalWebsiteName: string = '';
  sloganVisible: boolean = true;
  bannerImageVisible: boolean = true;
  logoImageVisible: boolean = true;
  languageVisible: boolean = true;
  response: any;
  hasCheckedUserName = false;
  bannerImages: any[] = [];
  existingImages: any;
  imageBaseURL = environment.imageURL;

  ngOnInit() {
    this.businessCardId = this.storage.get(common.BUSINESS_CARD);
    this.headingEditor = new Editor();
    this.sloganEditor = new Editor();
    this.fetchWebsiteDetails();
  }

  ngOnDestroy() {
    this.headingEditor.destroy();
    this.sloganEditor.destroy();
  }

  // Existing methods (unchanged unless specified)
  async fetchWebsiteDetails() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let results = await this.authService.getWebsiteDetails(businessCardId);

      if (results && results.home) {
        this.home = {
          heading: results.home.heading || '',
          slogan: results.home.slogan || '',
          logoImage: results.home.logoImage ? this.imageBaseURL  + results.home.logoImage : null,
        };
        if (results.home.bannerImages && results.home.bannerImages.length > 0) {
          this.bannerImages = [];
          results.home.bannerImages.forEach((image: string) => {
            this.bannerImages.push(image);
          });
        }

        if (results) {
          this.websiteName = results.websiteName;
          this.isEditingWebsiteName = false;
        }
        this.sloganVisible = results.home.sloganVisible;
        this.bannerImageVisible = results.home.bannerImageVisible;
        this.logoImageVisible = results.home.logoImageVisible;
        this.languageVisible = results.home.languageVisible;

        if (this.home.logoImage) {
          this.logoImagePreview = this.home.logoImage;
        }
      } else {
        swalHelper.showToast('Home details not found!', 'warning');
      }
    } catch (error) {
      swalHelper.showToast('Error fetching home details!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async savehomeDetails() {
    // Validate rich text fields
    const strippedHeading = this.stripHtml(this.home.heading).trim();
    const strippedSlogan = this.stripHtml(this.home.slogan).trim();


    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      this.bannerImages = this.bannerImages.filter((item: any) => {
        if (typeof item === 'string') {
          this.existingImages = this.existingImages || [];
          this.existingImages.push(item);
          return false;
        }
        return true;
      });
      let formData = new FormData();
      formData.append('businessCardId', businessCardId);
      formData.append('heading', this.home.heading);
      formData.append('slogan', this.home.slogan);
      if (this.bannerImages && this.bannerImages.length > 0) {
        this.bannerImages.forEach(file => {
          formData.append('bannerImages', file, file.name);
        });
      }
      if (this.existingImages) {
        formData.append('existingImages', JSON.stringify(this.existingImages));
      }

      if (this.home.logoImage && this.home.logoImage instanceof File) {
        formData.append('logoImage', this.home.logoImage);
      }

      let response = await this.authService.updateHomeDetails(formData);

      if (response) {
        swalHelper.showToast('Home details updated successfully!', 'success');
        this.bannerImages = [];
        this.existingImages = null;
        this.fetchWebsiteDetails();
      } else {
        swalHelper.showToast('Failed to update home details!', 'warning');
      }
    } catch (error) {
      console.error('Error updating home details:', error);
      swalHelper.showToast('Something went wrong!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // Helper method to strip HTML tags
  stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  // Existing methods (unchanged)
  onBannerImageSelected(event: any): void {
    const files: FileList = event.target.files;
    const newFiles: File[] = Array.from(files);

    if (!this.bannerImages) {
      this.bannerImages = [];
    }

    const totalImages = this.bannerImages.length + newFiles.length;

    if (totalImages > 15) {
      swalHelper.warning('You can upload a maximum of 15 images.');
      this.bannerImages = [];
      this.fileInput.nativeElement.value = '';
      return;
    }

    for (let file of newFiles) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.bannerImages.push(file);
      };
      reader.readAsDataURL(file);
    }
    this.fileInput.nativeElement.value = '';
  }

  getImagePreview(img: any): string {
    if (img instanceof File) {
      if (!this.objectURLCache.has(img)) {
        const url = URL.createObjectURL(img);
        this.objectURLCache.set(img, url);
      }
      return this.objectURLCache.get(img)!;
    }
    return this.imageBaseURL + (typeof img === 'string' ? img : img.images);
  }

  removeImage(index: number): void {
    this.bannerImages.splice(index, 1);
    if (this.bannerImages.length == 0) {
      this.bannerImages = [];
      this.fileInput.nativeElement.value = '';
    }
  }

  onLogoImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoImagePreview = e.target?.result ?? null;
      };
      reader.readAsDataURL(file);
      this.home.logoImage = file;
    }
  }

  _updateVisibility = async () => {
    await this.websiteService.updateVisibility({
      'home.sloganVisible': this.sloganVisible,
      'home.bannerImageVisible': this.bannerImageVisible,
      'home.logoImageVisible': this.logoImageVisible,
      'home.languageVisible': this.languageVisible,
      businessCardId: this.businessCardId
    });
  }

  _uniqueWebsiteName = async () => {
    this.hasCheckedUserName = true;
    let response = await this.websiteService.CheckUniqueWebsiteName({
      businessCardId: this.businessCardId,
      websiteName: this.websiteName
    });
    if (response) {
      this.response = response;
      this.hasCheckedUserName = false;
    }
  }

  toggleWebsiteNameEdit = async () => {
    if (this.isEditingWebsiteName) {
      await this._saveWebsiteName();
    } else {
      this.originalWebsiteName = this.websiteName;
      this.isEditingWebsiteName = true;
    }
  }

  _saveWebsiteName = async () => {
    if (!this.websiteName || this.websiteName.trim() === '' || this.websiteName.includes(' ')) {
      swalHelper.showToast('Website name cannot be empty or contain spaces!', 'warning');
      return;
    }

    const validNamePattern = /^[a-z0-9-]+$/;
    if (!validNamePattern.test(this.websiteName)) {
      swalHelper.showToast('Website name can only contain lowercase letters, numbers, and hyphens!', 'warning');
      return;
    }

    try {
      await this._uniqueWebsiteName();

      if (this.response && this.response.status == 200) {
        await this.websiteService.WebsiteNameSaving({
          businessCardId: this.businessCardId,
          websiteName: this.websiteName
        });
        swalHelper.showToast('Website name updated successfully!', 'success');
        this.isEditingWebsiteName = false;
      } else {
        swalHelper.showToast('Website name already exists!', 'warning');
      }
    } catch (error) {
      console.error('Error saving website name:', error);
      swalHelper.showToast('Error saving website name!', 'error');
      this.websiteName = this.originalWebsiteName;
    }
  }

  copyToClipboard() {
    const fullUrl = `${environment.baseURL}/website/${this.websiteName}`;
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        swalHelper.showToast('Website Link Copied!', 'success');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        swalHelper.error('Error!');
      });
  }

  getWebsiteMessage() {
    const websiteUrl = `${environment.baseURL}/website/${this.websiteName}`;
    this.message = `Checkout my website: ${websiteUrl}`;
  }

  shareOnWhatsApp() {
    if (!this.mobileNumber) {
      alert('Please enter a WhatsApp number!');
      return;
    }

    const formattedNumber =
      this.selectedCountryCode + this.mobileNumber.replace(/^0+/, '');

    let whatsappURL = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(
      this.message
    )}`;
    window.open(whatsappURL, '_blank');
  }
}