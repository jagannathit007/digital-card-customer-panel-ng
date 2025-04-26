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
  private objectURLCache = new Map<File, string>();
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
            // const previewUrl = `${this.baseURL}/${image}`;
            this.bannerImages.push(image );
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

  
  bannerImages: any[] = [];
  existingImages:any
  onBannerImageSelected(event: any): void {
    const files: FileList = event.target.files;
    const newFiles: File[] = Array.from(files);

    if(!this.bannerImages){
      this.bannerImages=[]
    }

    const totalImages = this.bannerImages?.length + newFiles.length;

    if (totalImages>15) {
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

  imageBaseURL = environment.baseURL + '/';
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
    if (this.bannerImages?.length == 0) {
      this.bannerImages = [] as File[]
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

  async savehomeDetails() {
    this.isLoading = true;
    try { 
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      this.bannerImages = this.bannerImages?.filter((item: any) => {
        if (typeof item === 'string') {
          this.existingImages = this.existingImages || [];
          this.existingImages?.push(item);
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
        })
      }
      if(this.existingImages){
        formData.append('existingImages', JSON.stringify(this.existingImages));
      }

      if (this.home.logoImage && this.home.logoImage instanceof File) {
        formData.append('logoImage', this.home.logoImage);
      }
      
      let response = await this.authService.updateHomeDetails(formData);
      
      if (response) {
        swalHelper.showToast('home details updated successfully!', 'success');
        this.bannerImages=[]
        this.existingImages=null
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
