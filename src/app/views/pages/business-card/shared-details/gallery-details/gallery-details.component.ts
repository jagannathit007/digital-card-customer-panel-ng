import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { common } from 'src/app/core/constants/common';
import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-gallery-details',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './gallery-details.component.html',
  styleUrls: ['./gallery-details.component.scss'],
})
export class GalleryDetailsComponent implements OnInit{
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedImages: string[] = [];
  selectedImagesLength: number = 0;
  actualImageToDeleteIndex: number | null = null;
  imageToDeleteIndex: number | null = null; // Track index for deletion

  constructor(private storage: AppStorage, public authService: AuthService) { }

  ngOnInit() {
    this.selectedImagesLength = 0;
    this.getGallery();  
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    this.selectedImagesLength = this.selectedImagesLength + files.length;

    // console.log("galleries image length:",this.galleries.length);
    // console.log("selectedImageslength",this.selectedImagesLength);

    const totalImages = this.galleries.length + this.selectedImagesLength;
    // console.log("total Images", totalImages);

    if(totalImages > 10){
      swalHelper.showToast(`Only 10 images you can add`, 'error');
      this.ngOnInit();
      return;
    }

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
          const isValidSize =
            (img.width === 1250 && img.height === 720) ||
            (img.width === 1600 && img.height === 900);

          if (!isValidSize) {
            swalHelper.showToast(`Invalid image size! Only 1250x720 or 1600x900 allowed.`, 'error');
            return;
          }
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
    }

    deleteImage = async () => {
      if (this.imageToDeleteIndex !== null) {
        this.selectedImages.splice(this.imageToDeleteIndex, 1);
        this.imageToDeleteIndex = null;
      }

      if (this.actualImageToDeleteIndex != null) {
        let image = this.galleries[this.actualImageToDeleteIndex].split(
          `${environment.baseURL}/`
        )[1];
        let result = await this.authService.deleteGalleryDetails({
          imageURL: image,
        });
        if (result) {
          this.galleries.splice(this.actualImageToDeleteIndex, 1);
          swalHelper.showToast('Gallery Image Deleted!', 'success');
        }
      }
    };

    isLoading: boolean = false;
    galleries: any[] = [];
    getGallery = async () => {
      this.isLoading = true;
      let result = await this.authService.getGalleryDetails({});
      if (result != null) {
        this.galleries = result.images.map((v: any) => {
          return `${environment.baseURL}/${v}`;
        });
        console.log(this.galleries);
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
}