import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';

@Component({
  selector: 'app-gallery-details',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './gallery-details.component.html',
  styleUrls: ['./gallery-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryDetailsComponent {
  selectedImages: string[] = [];
  imageToDeleteIndex: number | null = null; // Track index for deletion

  constructor(private storage: AppStorage, public authService: AuthService) { }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedImages.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  confirmDelete(index: number): void {
    this.imageToDeleteIndex = index;
  }

  deleteImage(): void {
    if (this.imageToDeleteIndex !== null) {
      this.selectedImages.splice(this.imageToDeleteIndex, 1);
      this.imageToDeleteIndex = null;
    }
  }

  uploadImages(): void {
    console.log('Images uploaded:', this.selectedImages);
  }
}
