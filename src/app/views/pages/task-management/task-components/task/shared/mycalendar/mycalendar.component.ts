import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mycalendar',
  templateUrl: './mycalendar.component.html',
  styleUrl: './mycalendar.component.scss'
})
export class MycalendarComponent implements OnInit, OnDestroy {
  
  isModalOpen = false;
  modalMessage = '';
  isSuccess = false;
  private autoCloseTimer: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkUrlParameters();
  }

  ngOnDestroy(): void {
    // Clear timer if component is destroyed
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
  }

  checkUrlParameters(): void {
    this.route.queryParams.subscribe(params => {
      const googleCalendar = params['googleCalendar'];
      
      if (googleCalendar === 'success') {
        this.modalMessage = 'You are successfully synced with Google Calendar.';
        this.isSuccess = true;
        this.showModal();
      } else if (googleCalendar === 'failed') {
        this.modalMessage = 'Sorry, due to some internal error.';
        this.isSuccess = false;
        this.showModal();
      }
    });
  }

  showModal(): void {
    this.isModalOpen = true;
    
    // Auto close after 5 seconds (changed from 3 to 5)
    this.autoCloseTimer = setTimeout(() => {
      this.closeModal();
    }, 10000);
  }

  closeModal(): void {
    this.isModalOpen = false;
    
    // Clear timer
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
    
    // Remove query parameter from URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  // Manual close by clicking X button
  onCloseClick(): void {
    this.closeModal();
  }
}