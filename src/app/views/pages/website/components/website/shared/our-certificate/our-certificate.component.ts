import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { WebsiteBuilderService } from 'src/app/services/website-builder.service';

@Component({
  selector: 'app-our-certificate',
  templateUrl: './our-certificate.component.html',
  styleUrl: './our-certificate.component.scss'
})
export class OurCertificateComponent implements OnInit {
  @ViewChild('certificateFileInput') fileInput!: ElementRef;
  private objectURLCache = new Map<File, string>();
  baseURL = environment.baseURL;
  isLoading: boolean = false;
  
  otherImages: any[] = [];
  existingImages: any;
  otherImagesVisible: boolean = true;
  businessCardId: any;

  constructor(
    private storage: AppStorage, 
    public authService: AuthService,
    private websiteService: WebsiteBuilderService
  ) {}

  ngOnInit() {
    this.businessCardId = this.storage.get(common.BUSINESS_CARD);
    this.fetchOtherImages();
  }

  async fetchOtherImages() {
    this.isLoading = true;
    try {
      let results = await this.authService.getWebsiteDetails(this.businessCardId);
      if (results && results.otherImages) {
        // Set the otherImages from the database
        if (results.otherImages && results.otherImages.length > 0) {
          this.otherImages = results.otherImages.map((image: string) => image);
        }
        
        // Set visibility state
        this.otherImagesVisible = results.otherImagesVisible !== undefined ? 
                                  results.otherImagesVisible : true;
      } else {
        swalHelper.showToast('Certificate details not found!', 'warning');
      }
    } catch (error) {
      swalHelper.showToast('Error fetching certificate details!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  onCertificateImagesSelected(event: any): void {
    const files: FileList = event.target.files;
    const newFiles: File[] = Array.from(files);

    if (!this.otherImages) {
      this.otherImages = [];
    }

    const totalImages = this.otherImages?.length + newFiles.length;

    if (totalImages > 15) {
      swalHelper.showToast('You can upload a maximum of 15 images.','warning');
      this.fileInput.nativeElement.value = '';
      return;
    }

    for (let file of newFiles) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.otherImages.push(file);
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
    this.otherImages.splice(index, 1);
    if (this.otherImages?.length == 0) {
      this.otherImages = [];
      this.fileInput.nativeElement.value = '';
    }
  }

  async saveOtherImages() {
    this.isLoading = true;
    try {
      this.otherImages = this.otherImages?.filter((item: any) => {
        if (typeof item === 'string') {
          this.existingImages = this.existingImages || [];
          this.existingImages?.push(item);
          return false;
        }
        return true;
      });
      
      let formData = new FormData();
      formData.append('businessCardId', this.businessCardId);
      
      if (this.otherImages && this.otherImages.length > 0) {
        this.otherImages.forEach(file => {
          formData.append('otherImages', file, file.name);
        });
      }
      
      if (this.existingImages) {
        formData.append('existingImages', JSON.stringify(this.existingImages));
      }

      let response = await this.websiteService.updateOurCertificates(formData);
      
      if (response) {
        swalHelper.showToast('Certificate images updated successfully!', 'success');
        this.otherImages = [];
        this.existingImages = null;
        this.fetchOtherImages();
      } else {
        swalHelper.showToast('Failed to update certificate images!', 'warning');
      }
    } catch (error) {
      console.error('Error updating certificate images:', error);
      swalHelper.showToast('Something went wrong!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async updateVisibility() {
    try {
      await this.websiteService.updateVisibility({
        'otherImagesVisible': this.otherImagesVisible,
        businessCardId: this.businessCardId
      });
    } catch (error) {
      console.error('Error updating visibility:', error);
      swalHelper.showToast('Failed to update visibility!', 'error');
    }
  }
}