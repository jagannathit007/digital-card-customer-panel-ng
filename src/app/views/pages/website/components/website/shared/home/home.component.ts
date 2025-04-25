import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { WebsiteBuilderService } from 'src/app/services/website-builder.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  baseURL = environment.baseURL;
  isLoading: boolean = false;

  home: any = {
    heading: '',
    slogan: '',
    bannerImage: null,
    logoImage: null,
  };
  logoImagePreview: string | ArrayBuffer | null = null;

  constructor(private storage: AppStorage, public authService: AuthService,private websiteService:WebsiteBuilderService) {}

  businessCardId:any
  ngOnInit() {
    this.businessCardId=this.storage.get(common.BUSINESS_CARD)
    this.fetchWebsiteDetails();

  }

  async fetchWebsiteDetails() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let results = await this.authService.getWebsiteDetails(businessCardId);

      if (results && results.home) {
        this.home = {
          heading: results.home.heading || '',
          slogan: results.home.slogan || '',
          logoImage: results.home.logoImage ? this.baseURL +"/"+ results.home.logoImage : null,
        };
        if (results.home.bannerImages && results.home.bannerImages.length > 0) {
          results.home.bannerImages.forEach((image: string) => {
            const previewUrl = `${this.baseURL}/${image}`;
            this.bannerImagePreviews.push(previewUrl );
          });
        }
        this.sloganVisible=results.home.sloganVisible
        this.bannerImageVisible=results.home.bannerImageVisible
        this.logoImageVisible=results.home.logoImageVisible

        if (this.home.logoImage) {
          this.logoImagePreview = this.home.logoImage;
        }

      } else {
        swalHelper.showToast('home details not found!', 'warning');
      }
    } catch (error) {
      swalHelper.showToast('Error fetching home details!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  
  bannerImages: File[] = [];
  bannerImagePreviews: string[] = [];
  maxImageCount = 15;

  onBannerImageSelected(event: any): void {
    const files: FileList = event.target.files;

    if (this.bannerImages.length + files.length > this.maxImageCount) {
      alert(`You can select a maximum of ${this.maxImageCount} images.`);
      this.fileInput.nativeElement.value = ''; // Clear the file input
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file) {
        this.bannerImages.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.bannerImagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
    this.fileInput.nativeElement.value = '';
  }

  removeImage(index: number): void {
    this.bannerImages.splice(index, 1);
    this.bannerImagePreviews.splice(index, 1);
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

  async savehomeDetails() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let formData = new FormData();
      
      formData.append('businessCardId', businessCardId);
      formData.append('heading', this.home.heading);
      formData.append('slogan', this.home.slogan);
      
      if (this.bannerImages && this.bannerImages.length > 0) {
        this.bannerImages.forEach(file => {
          formData.append('bannerImages', file, file.name); 
        })
      }

      if (this.home.logoImage && this.home.logoImage instanceof File) {
        formData.append('logoImage', this.home.logoImage);
      }
      
      let response = await this.authService.updateHomeDetails(formData);
      
      if (response) {
        swalHelper.showToast('home details updated successfully!', 'success');
        this.bannerImages=[]
        this.bannerImagePreviews=[]
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

  sloganVisible:boolean=true
  bannerImageVisible:boolean=true
  logoImageVisible:boolean=true
  _updateVisibility=async()=>{
    await this.websiteService.updateVisibility({'home.sloganVisible':this.sloganVisible,'home.bannerImageVisible':this.bannerImageVisible,'home.logoImageVisible':this.logoImageVisible,businessCardId:this.businessCardId})
  }


}
