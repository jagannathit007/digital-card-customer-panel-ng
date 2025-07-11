import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PersonalTaskService } from 'src/app/services/personal-task.service';
import { CalendarSyncService } from 'src/app/services/calendar-sync.service';


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
  
  // Calendar data ke liye
  calendarData: any = null;
  isLoadingCalendar = false;
  safeIframeUrl: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private personalTaskService: PersonalTaskService,
    private CalendarSyncService: CalendarSyncService,
    private sanitizer: DomSanitizer
  ) { }

  async ngOnInit(): Promise<void> {
    this.checkUrlParameters();
    await this.getGoogleCalendarId();
  }

  ngOnDestroy(): void {
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
         
    this.autoCloseTimer = setTimeout(() => {
      this.closeModal();
    }, 10000);
  }

  closeModal(): void {
    this.isModalOpen = false;
         
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
         
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  onCloseClick(): void {
    this.closeModal();
  }

  async getGoogleCalendarId() {
    try {
      this.isLoadingCalendar = true;
      let response = await this.personalTaskService.getGoogleCalendarId();
      
      if (response && response.iframeUrl) {
        this.calendarData = response;      
        this.safeIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(response.iframeUrl);
        return response;
      } else {
        this.calendarData = null;
        this.safeIframeUrl = null;
        return null;
      }
    } catch (err) {
      this.calendarData = null;
      this.safeIframeUrl = null;
      return null;
    } finally {
      this.isLoadingCalendar = false;
    }
  }

  openCalendarSyncModal() {
  this.CalendarSyncService.openModal();
}

}