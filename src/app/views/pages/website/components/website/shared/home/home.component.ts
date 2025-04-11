import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  baseURL = environment.baseURL;
  isLoading: boolean = false;

  home: any = {
    heading: '',
    slogan: '',
    bannerImage: null,
    logoImage: null,
  };
  bannerImagePreview: string | ArrayBuffer | null = null;
  logoImagePreview: string | ArrayBuffer | null = null;


  constructor(private storage: AppStorage, public authService: AuthService) {}
  ngOnInit() {
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
          bannerImage: results.home.bannerImage ? this.baseURL +"/"+ results.home.bannerImage : null,
          logoImage: results.home.logoImage ? this.baseURL +"/"+ results.home.logoImage : null,
        };
        if (this.home.bannerImage) {
          this.bannerImagePreview = this.home.bannerImage;
        }

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


    onBannerImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.bannerImagePreview = e.target?.result ?? null;
      };
      reader.readAsDataURL(file);
      this.home.bannerImage = file;
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
      let formData = new FormData();
      
      formData.append('businessCardId', businessCardId);
      formData.append('heading', this.home.heading);
      formData.append('slogan', this.home.slogan);
      
      if (this.home.bannerImage && this.home.bannerImage instanceof File) {
        formData.append('bannerImage', this.home.bannerImage);
      }

      if (this.home.logoImage && this.home.logoImage instanceof File) {
        formData.append('logoImage', this.home.logoImage);
      }
      
      let response = await this.authService.updateHomeDetails(formData);
      
      if (response) {
        swalHelper.showToast('home details updated successfully!', 'success');
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


}
