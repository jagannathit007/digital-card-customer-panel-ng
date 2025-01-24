import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent {
  dragDropMessage = 'Drag & Drop an image here or click to upload';
  selectedFile: File | null = null;
  previewSrc: string | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef;

  // Handles click to open file input
  onFileInputClick(): void {
    this.fileInput.nativeElement.click();
  }

  // Handles dragover event
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragDropMessage = 'Drop the file here!';
    (event.target as HTMLElement).classList.add('bg-light');
  }

  // Handles dragleave event
  onDragLeave(): void {
    this.dragDropMessage = 'Drag & Drop an image here or click to upload';
  }

  // Handles drop event
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      this.selectedFile = event.dataTransfer.files[0];
      this.dragDropMessage = `File Selected: ${this.selectedFile.name}`;
      this.generatePreview();
    }
  }

  // Handles file selection from file input
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.dragDropMessage = `File Selected: ${this.selectedFile.name}`;
      this.generatePreview();
    }
  }

  // Generates the image preview
  generatePreview(): void {
    if (!this.selectedFile) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewSrc = reader.result as string;
    };
    reader.readAsDataURL(this.selectedFile);
  }

  // Preview Button Click
  onPreviewImage(): void {
    if (!this.selectedFile) {
      alert('No image selected to preview!');
    }
  }

  // Add Image functionality
  onAddImage(): void {
    if (!this.selectedFile) {
      alert('Please select an image first!');
    } else {
      alert(`Image "${this.selectedFile.name}" added successfully!`);
    }
  }
}
