import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { common } from 'src/app/core/constants/common';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';

@Component({
  selector: 'app-gallery-details',
  templateUrl: './gallery-details.component.html',
  styleUrls: ['./gallery-details.component.scss'],
})
export class GalleryDetailsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedImages: string[] = [];
  selectedImagesLength: number = 0;
  actualImageToDeleteIndex: number | null = null;
  imageToDeleteIndex: number | null = null; // Track index for deletion
  activeTab: string = 'images';
  constructor(private storage: AppStorage, public authService: AuthService, public modal: ModalService) { }

  ngOnInit() {
    this.selectedImagesLength = 0;
    this.selectedVideos = [];
    this.fileVideos = [];
    this.getGallery();
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    this.selectedImagesLength = this.selectedImagesLength + files.length;
    const totalImages = this.galleries.length + this.selectedImagesLength;

    if (totalImages > 10) {
      swalHelper.showToast(`Only 10 images are allowed to upload!`, 'warning');
      this.ngOnInit();
      return;
    }

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
          // const isValidSize =
          //   (img.width === 1250 && img.height === 720) ||
          //   (img.width === 1600 && img.height === 900);

          // if (!isValidSize) {
          //   swalHelper.showToast(`Invalid image size! Only 1250x720 or 1600x900 allowed.`, 'error');
          //   return;
          // }
          const reader = new FileReader();
          reader.onload = (e: any) => this.selectedImages.push(e.target.result);
          reader.readAsDataURL(files[i]);
          this.ngOnInit();
        }
      }
    }
  }

  confirmDeleteByActualIndex(index: number): void {
    this.imageToDeleteIndex = null;
    this.actualImageToDeleteIndex = index;
  }

  confirmDeleteByIndex(index: number): void {
    this.actualImageToDeleteIndex = null;
    this.imageToDeleteIndex = index;
    this.modal.open('deleteModal')
  }

  async deleteImage() {
    if (this.imageToDeleteIndex !== null) {
      this.selectedImages.splice(this.imageToDeleteIndex, 1);
      this.imageToDeleteIndex = null;
    }
  
    if (this.actualImageToDeleteIndex !== null) {
      let image = this.galleries[this.actualImageToDeleteIndex].split(`${environment.baseURL}/`)[1];
      
      let result = await this.authService.deleteGalleryDetails({
          fileURL: image,
          type: 'image',
      });
  
      if (result) {
        // Remove the image from the gallery list
        this.galleries.splice(this.actualImageToDeleteIndex, 1);
        swalHelper.showToast('Gallery Image Deleted!', 'success');
      }
    }
  }
  

  isLoading: boolean = false;
  galleries: any[] = [];
  getGallery = async () => {
    this.isLoading = true;
    let result = await this.authService.getGalleryDetails({});
    if (result != null) {
      this.galleries = result.images.map((v: any) => `${environment.baseURL}/${v}`);
      this.videos = result.videos.map((v: any) => `${environment.baseURL}/${v}`);
    }
    this.isLoading = false;
  };

  isUploading = false;
  uploadImages = async () => {
    this.isUploading = true;
    let formData = new FormData();
    if (this.selectedImages.length > 0) {
      for (let i = 0; i < this.selectedImages.length; i++) {
        let file = this.downloadBase64File(
          this.selectedImages[i],
          `${i}_image.png`,
          'image/png'
        );
        formData.append('files', file);
      }
      formData.append('businessCardId', this.storage.get(common.BUSINESS_CARD));
      let result = await this.authService.updateGalleryDetails(formData);
      if (result) {
        this.selectedImages = [];
        this.getGallery();
        swalHelper.showToast(
          'Gallery Details Updated Successfully!',
          'success'
        );
      }
    } else {
      swalHelper.showToast(
        'Select images to upload!',
        'warning'
      );
    }
    this.isUploading = false;
  };

  private downloadBase64File(
    base64String: string,
    fileName: string,
    fileType: string
  ): File {
    const base64Data = base64String.split(',')[1];
    const byteArray = this.base64ToByteArray(base64Data);
    const blob = new Blob([byteArray], { type: fileType });
    const file = new File([blob], fileName, { type: fileType });
    return file;
  }

  private base64ToByteArray(base64: string): Uint8Array {
    const raw = atob(base64); // Decode Base64 to raw binary string
    const byteArray = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      byteArray[i] = raw.charCodeAt(i);
    }
    return byteArray;
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }


  videos: string[] = [];
  selectedVideos: string[] = [];
  fileVideos: File[] = [];
  actualVideoToDeleteIndex: number | null = null;
  videoToDeleteIndex: number | null = null;
  isVideoUploading: boolean = false;

  // Add these methods to your component class

// For deleting existing videos from server
async confirmDeleteVideoByActualIndex(index: number): Promise<void> {
  this.actualVideoToDeleteIndex = index;
  // this.modal.open('deleteVideoModal');
  let con=swalHelper.delete()
  if((await con).isConfirmed){
    this.deleteVideo();
  }
}

// For deleting selected videos (not yet uploaded)
async confirmDeleteVideoByIndex(index: number): Promise<void> {
  this.videoToDeleteIndex = index;
  // this.modal.open('deleteVideoModal');
  let con=swalHelper.delete()
  if((await con).isConfirmed){
    this.deleteVideo();
  }
}

async deleteVideo(): Promise<void> {
  try {
    if (this.videoToDeleteIndex !== null) {
      // Handle locally selected videos (not yet uploaded)
      this.selectedVideos.splice(this.videoToDeleteIndex, 1);
      this.fileVideos.splice(this.videoToDeleteIndex, 1);
      this.videoToDeleteIndex = null;
      swalHelper.showToast('Video removed successfully', 'success');
    } 
    else if (this.actualVideoToDeleteIndex !== null) {
      // Handle videos already on server
      const videoUrl = this.videos[this.actualVideoToDeleteIndex];
      const fileURL = videoUrl.split(`${environment.baseURL}/`)[1];
      
      const success = await this.authService.deleteGalleryDetails({
        fileURL: fileURL,
        type: 'video'
      });

      if (success) {
        this.videos.splice(this.actualVideoToDeleteIndex, 1);
        swalHelper.showToast('Video deleted successfully', 'success');
      }
      this.actualVideoToDeleteIndex = null;
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    swalHelper.showToast('Failed to delete video', 'error');
  } finally {
    this.modal.close('deleteVideoModal');
  }
}

onVideoSelected(event: any): void {
  const files = event.target.files;
  const totalVideos = this.videos.length + this.selectedVideos.length + files.length;

  if (totalVideos > 10) {
    swalHelper.showToast('Only 10 videos are allowed to upload!', 'warning');
    return;
  }

  if (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedVideos.push(e.target.result);
        this.fileVideos.push(file);
      };
      reader.readAsDataURL(file);
    }
  }
}

async uploadVideos() {
  if (this.fileVideos.length === 0) {
    swalHelper.showToast('Select videos to upload!', 'warning');
    return;
  }

  this.isVideoUploading = true;
  const formData = new FormData();
  
  for (let file of this.fileVideos) {
    formData.append('files', file);
  }
  
  formData.append('businessCardId', this.storage.get(common.BUSINESS_CARD));
  formData.append('type', 'video'); // Add type to distinguish between images and videos

  const result = await this.authService.updateGalleryDetails(formData);
  if (result) {
    this.selectedVideos = [];
    this.fileVideos = [];
    this.getGallery();
    swalHelper.showToast('Videos uploaded successfully!', 'success');
  }
  this.isVideoUploading = false;
} 

}