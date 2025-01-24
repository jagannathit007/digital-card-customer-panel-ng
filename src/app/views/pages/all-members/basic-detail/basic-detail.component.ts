import { Component } from '@angular/core';

@Component({
  selector: 'app-basic-detail',
  standalone: true,
  imports: [],
  templateUrl: './basic-detail.component.html',
  styleUrl: './basic-detail.component.scss'
})
export class BasicDetailComponent {
  imageSrc: string = 'assets/images/avatar.png'; // Default image

  // Handle Drag Over Event
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.toggleOverlay(true);
  }

  // Handle Drag Leave Event
  onDragLeave(event: DragEvent): void {
    this.toggleOverlay(false);
  }

  // Handle Drop Event
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.toggleOverlay(false);
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.updateImage(file);
    }
  }

  // Handle File Select
  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.updateImage(file);
    }
  }

  // Update Image Source
  updateImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageSrc = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Toggle Overlay
  toggleOverlay(show: boolean): void {
    const overlay = document.querySelector('.overlay') as HTMLElement;
    overlay.style.visibility = show ? 'visible' : 'hidden';
    overlay.style.opacity = show ? '1' : '0';
  }
}
