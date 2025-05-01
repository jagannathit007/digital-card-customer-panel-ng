import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppWorker {
  isSliderOpen: boolean = true;
  toggleSlider() {
    this.isSliderOpen = !this.isSliderOpen;
  }
}
