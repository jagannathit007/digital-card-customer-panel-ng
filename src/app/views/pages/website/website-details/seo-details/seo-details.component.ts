import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-seo-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seo-details.component.html',
  styleUrl: './seo-details.component.scss',
})
export class SeoDetailsComponent implements OnInit {
  baseURL = environment.baseURL;
  isLoading: boolean = false;
  seo: any = {
    metaTitle: '',
    metaKeywords: '',
    metaDescription: '',
    metaImage: null,
  };
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private storage: AppStorage, public authService: AuthService) {}

  ngOnInit() {
    this.fetchSeoDetails();
  }

  async fetchSeoDetails() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let results = await this.authService.getWebsiteDetails(businessCardId);

      if (results && results.seo) {
        this.seo = {
          metaTitle: results.seo.metaTitle || '',
          metaKeywords: results.seo.metaKeywords || '',
          metaDescription: results.seo.metaDescription || '',
          metaImage: results.seo.metaImage ? this.baseURL +"/"+ results.seo.metaImage : null,
        };

        if (this.seo.metaImage) {
          this.imagePreview = this.seo.metaImage;
        }

      } else {
        swalHelper.showToast('SEO details not found!', 'warning');
      }
    } catch (error) {
      swalHelper.showToast('Error fetching SEO details!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result ?? null;
      };
      reader.readAsDataURL(file);
      this.seo.metaImage = file;
    }
  }

  async saveSeoDetails() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let formData = new FormData();
      
      formData.append('businessCardId', businessCardId);
      formData.append('metaTitle', this.seo.metaTitle);
      formData.append('metaKeywords', this.seo.metaKeywords);
      formData.append('metaDescription', this.seo.metaDescription);
      
      if (this.seo.metaImage && this.seo.metaImage instanceof File) {
        formData.append('file', this.seo.metaImage);
      }
      
      let response = await this.authService.updateSeoDetails(formData);
      
      if (response) {
        swalHelper.showToast('SEO details updated successfully!', 'success');
        this.fetchSeoDetails(); 
      } else {
        swalHelper.showToast('Failed to update SEO details!', 'warning');
      }
    } catch (error) {
      console.error('Error updating SEO details:', error);
      swalHelper.showToast('Something went wrong!', 'error');
    } finally {
      this.isLoading = false;
    }
  }
}