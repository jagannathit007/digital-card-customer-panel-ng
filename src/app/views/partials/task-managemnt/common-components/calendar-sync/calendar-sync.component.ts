import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PersonalTaskService } from 'src/app/services/personal-task.service';
import { CalendarSyncService } from 'src/app/services/calendar-sync.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-calendar-sync',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-sync.component.html',
  styleUrl: './calendar-sync.component.scss'
})
export class CalendarSyncComponent implements OnInit, OnDestroy {

  isCalendarSyncModalOpen = false;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private personalTaskService: PersonalTaskService,
    private calendarSyncService: CalendarSyncService
  ) { }

  ngOnInit(): void {
    // Service se modal state subscribe kar rahe hain
    this.calendarSyncService.isModalOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isCalendarSyncModalOpen = isOpen;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeCalendarSyncModal() {
    this.calendarSyncService.closeModal();
  }

  async connectGoogleCalendar() {
    this.isLoading = true;

    const response = await this.personalTaskService.GoogleInitiate();

    if (response) {
      // redirect to new window to the response url
      window.open(response, '_blank');
    }

    this.isLoading = false;
  }

  getCurrentDate(): string {
    const today = new Date();
    return today.getDate().toString().padStart(2, '0');
  }

  getCurrentMonth(): string {
    const today = new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months[today.getMonth()];
  }
}