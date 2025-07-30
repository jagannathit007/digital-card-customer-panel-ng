import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PersonalTaskService } from 'src/app/services/personal-task.service';
import { CalendarSyncService } from 'src/app/services/calendar-sync.service';
import { TaskPermissionsService } from 'src/app/services/task-permissions.service';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';


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
  
  // Toggle between default and Google calendar
  showGoogleCalendar = false;
  
  // FullCalendar options
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [],
    height: 'calc(100vh - 230px)', // Fixed height instead of auto
    eventDisplay: 'block',
    eventColor: '#3788d8',
    eventTextColor: '#ffffff',
    dayMaxEvents: 3,
    moreLinkClick: 'popover',
    slotMinTime: '00:00:00', // Start time for week/day view
    slotMaxTime: '24:00:00', // End time for week/day view
    scrollTime: '08:00:00', // Initial scroll position
    nowIndicator: true, // Show current time indicator
    eventClick: this.handleEventClick.bind(this), // Handle event clicks
    eventMouseEnter: this.handleEventHover.bind(this), // Handle event hover
    eventMouseLeave: this.handleEventLeave.bind(this), // Handle event mouse leave
    eventDidMount: (info) => {
      // Add custom styling to events
      info.el.style.borderRadius = '4px';
      info.el.style.border = 'none';
      info.el.style.fontSize = '12px';
      info.el.style.cursor = 'pointer';
    }
  };
  
  // Task popup state
  showTaskPopup = false;
  selectedTask: any = null;
  popupPosition = { x: 0, y: 0 };
  
  // Personal tasks data
  personalTasks: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private personalTaskService: PersonalTaskService,
    private CalendarSyncService: CalendarSyncService,
    public taskPermissionsService: TaskPermissionsService,
    private sanitizer: DomSanitizer
  ) { }

  async ngOnInit(): Promise<void> {
    this.checkUrlParameters();
    await this.loadPersonalTasks();
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

  // Toggle methods
  switchToDefaultCalendar() {
    this.showGoogleCalendar = false;
  }

  switchToGoogleCalendar() {
    this.showGoogleCalendar = true;
  }

  // Load personal tasks with due dates
  async loadPersonalTasks() {
    try {
      this.isLoadingCalendar = true;
      const response = await this.personalTaskService.getAllTasks({});
      
      if (response && response.tasks) {
        this.personalTasks = response.tasks;
        this.updateCalendarEvents();
      }
    } catch (error) {
      console.error('Error loading personal tasks:', error);
    } finally {
      this.isLoadingCalendar = false;
    }
  }

  // Convert personal tasks to calendar events
  updateCalendarEvents() {
    const events: EventInput[] = [];
    
    this.personalTasks.forEach(taskGroup => {
      if (taskGroup.tasks && Array.isArray(taskGroup.tasks)) {
        taskGroup.tasks.forEach((task: any) => {
          // Only show tasks with due dates
          if (task.dueOn) {
            const dueDate = new Date(task.dueOn);
            
            // Check if the task has a specific time or is all-day
            const hasTime = dueDate.getHours() !== 0 || dueDate.getMinutes() !== 0;
            
            const event: EventInput = {
              id: task._id,
              title: task.title,
              start: dueDate.toISOString(), // Keep full ISO string with time
              allDay: !hasTime, // Only all-day if no specific time is set
              backgroundColor: task.isCompleted ? '#10b981' : '#3788d8', // Green for completed, blue for pending
              borderColor: task.isCompleted ? '#059669' : '#2563eb',
              textColor: '#ffffff',
              extendedProps: {
                taskData: task, // Store complete task data
                isCompleted: task.isCompleted,
                completedOn: task.completedOn,
                createdAt: task.createdAt,
                dueOn: task.dueOn
              }
            };
            
            // If task has specific time, set end time (30 minutes duration)
            if (hasTime) {
              const endTime = new Date(dueDate.getTime() + 30 * 60 * 1000); // 30 minutes later
              event.end = endTime.toISOString();
            }
            
            events.push(event);
          }
        });
      }
    });

    // Update calendar options with new events
    this.calendarOptions = {
      ...this.calendarOptions,
      events: events
    };
  }

  // Method to refresh calendar data (can be called when tasks are updated)
  async refreshCalendar() {
    await this.loadPersonalTasks();
  }

  // Handle event click
  handleEventClick(clickInfo: any) {
    const taskData = clickInfo.event.extendedProps.taskData;
    const rect = clickInfo.el.getBoundingClientRect();
    
    // Close any existing FullCalendar popovers
    const existingPopovers = document.querySelectorAll('.fc-popover');
    existingPopovers.forEach(popover => {
      (popover as HTMLElement).style.display = 'none';
    });
    
    this.selectedTask = taskData;
    this.popupPosition = {
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    };
    this.showTaskPopup = true;
    
    // Prevent event bubbling to avoid closing immediately
    clickInfo.jsEvent.stopPropagation();
  }

  // Handle event hover
  handleEventHover(mouseEnterInfo: any) {
    // Optional: You can add hover effects here if needed
    mouseEnterInfo.el.style.opacity = '0.8';
  }

  // Handle event mouse leave
  handleEventLeave(mouseLeaveInfo: any) {
    mouseLeaveInfo.el.style.opacity = '1';
  }

  // Close task popup
  closeTaskPopup() {
    this.showTaskPopup = false;
    this.selectedTask = null;
    
    // Show any hidden popovers again
    const hiddenPopovers = document.querySelectorAll('.fc-popover');
    hiddenPopovers.forEach(popover => {
      (popover as HTMLElement).style.display = '';
    });
  }

  // Format date for display
  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Format date for display (date only)
  formatDateOnly(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

}