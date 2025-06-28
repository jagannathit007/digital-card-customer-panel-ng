// import { Component, OnInit } from '@angular/core';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { teamMemberCommon } from 'src/app/core/constants/team-members-common';

// @Component({
//   selector: 'app-task-clock',
//   standalone: true,
//   imports: [],
//   templateUrl: './task-clock.component.html',
//   styleUrl: './task-clock.component.scss'
// })
// export class TaskClockComponent implements OnInit{
  
//   ngOnInit(): void {
//     throw new Error('Method not implemented.');
//   }

// }



import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonalTaskService } from 'src/app/services/personal-task.service';

enum PickerStep {
  DATE = 'date',
  HOUR = 'hour',
  MINUTE = 'minute'
}

@Component({
  selector: 'app-task-clock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-clock.component.html',
  styleUrl: './task-clock.component.scss'
})
export class TaskClockComponent implements OnInit {
  @Input() taskId: string = '';
  @Input() currentDueDate: Date | null = null;
  @Input() isVisible: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onDateTimeUpdated = new EventEmitter<Date>();

  // Component state
  currentStep: PickerStep = PickerStep.DATE;
  PickerStep = PickerStep; // For template access
  
  // Selected values
  selectedDate: Date | null = null;
  selectedHour: number = 12;
  selectedMinute: number = 0;
  isAM: boolean = true;
  
  // Calendar properties
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  availableYears: number[] = [];
  calendarDays: (number | null)[][] = [];
  
  // Loading state
  isUpdating: boolean = false;

  constructor(private personalTaskService: PersonalTaskService) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.generateAvailableYears();
    this.generateCalendar();
  }


// Update your initializeComponent method:
private initializeComponent(): void {
  // Fix: Ensure we have a proper Date object
  let dateToUse: Date;
  
  if (this.currentDueDate) {
    // Convert to Date if it's a string
    dateToUse = typeof this.currentDueDate === 'string' 
      ? new Date(this.currentDueDate) 
      : new Date(this.currentDueDate);
  } else {
    dateToUse = new Date(); // Default to current time
  }
  
  // Set date values
  this.selectedDate = new Date(dateToUse);
  this.currentMonth = dateToUse.getMonth();
  this.currentYear = dateToUse.getFullYear();
  
  // Set time values
  let hours = dateToUse.getHours();
  this.isAM = hours < 12;
  this.selectedHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  this.selectedMinute = this.currentDueDate ? dateToUse.getMinutes() : Math.round(dateToUse.getMinutes() / 5) * 5;
}

// Update your ngOnChanges method:
ngOnChanges(): void {
  // Reset and populate whenever component opens or currentDueDate changes
  if (this.isVisible) {
    this.currentStep = PickerStep.DATE;
    this.initializeComponent();
    this.generateCalendar();
  }
}

  private generateAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    this.availableYears = [];
    for (let year = currentYear; year <= currentYear + 10; year++) {
      this.availableYears.push(year);
    }
  }

  // Calendar Methods
  generateCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    
    this.calendarDays = [];
    let week: (number | null)[] = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      week.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      
      if (week.length === 7) {
        this.calendarDays.push(week);
        week = [];
      }
    }
    
    // Add remaining empty cells
    while (week.length < 7 && week.length > 0) {
      week.push(null);
    }
    if (week.length > 0) {
      this.calendarDays.push(week);
    }
  }

  selectDate(day: number | null): void {
    if (!day || this.isPastDate(day)) return;
    
    this.selectedDate = new Date(this.currentYear, this.currentMonth, day);
    // Automatically move to hour selection
    this.currentStep = PickerStep.HOUR;
  }

  isPastDate(day: number): boolean {
    const date = new Date(this.currentYear, this.currentMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  isSelectedDate(day: number | null): boolean {
    if (!day || !this.selectedDate) return false;
    return this.selectedDate.getDate() === day && 
           this.selectedDate.getMonth() === this.currentMonth && 
           this.selectedDate.getFullYear() === this.currentYear;
  }

  changeMonth(direction: number): void {
    this.currentMonth += direction;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    
    // Ensure we don't go to past months
    const today = new Date();
    if (this.currentYear < today.getFullYear() || 
        (this.currentYear === today.getFullYear() && this.currentMonth < today.getMonth())) {
      this.currentMonth = today.getMonth();
      this.currentYear = today.getFullYear();
    }
    
    this.generateCalendar();
  }

  onYearChange(year: number): void {
    this.currentYear = year;
    this.generateCalendar();
  }

  getMonthName(): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[this.currentMonth];
  }

  // Clock Methods
  selectHour(hour: number): void {
    this.selectedHour = hour;
    // Automatically move to minute selection
    this.currentStep = PickerStep.MINUTE;
  }

  selectMinute(minute: number): void {
    this.selectedMinute = minute;
  }

  toggleAMPM(): void {
    this.isAM = !this.isAM;
  }

  getHourNumbers(): number[] {
    return [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  }

  getMinuteNumbers(): number[] {
    return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  }

  getHourAngle(hour: number): number {
    const hourIndex = hour === 12 ? 0 : hour;
    return (hourIndex * 30) - 90; // -90 to start from top
  }

  getMinuteAngle(minute: number): number {
    return (minute * 6) - 90; // -90 to start from top
  }

  getSelectedHourAngle(): number {
    return this.getHourAngle(this.selectedHour);
  }

  getSelectedMinuteAngle(): number {
    return this.getMinuteAngle(this.selectedMinute);
  }

  // Navigation Methods
  goToDatePicker(): void {
    this.currentStep = PickerStep.DATE;
  }

  goToHourPicker(): void {
    this.currentStep = PickerStep.HOUR;
  }

  // DateTime Management
  getFormattedDateTime(): string {
    if (!this.selectedDate) return '';
    
    const date = new Date(this.selectedDate);
    const hours = this.isAM ? 
      (this.selectedHour === 12 ? 0 : this.selectedHour) : 
      (this.selectedHour === 12 ? 12 : this.selectedHour + 12);
    
    date.setHours(hours, this.selectedMinute, 0, 0);
    
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  async saveDateTime(): Promise<void> {
  if (!this.taskId || !this.selectedDate) return;

  this.isUpdating = true;

  try {
    // Construct local date from selected input
    const date = new Date(this.selectedDate);
    const hours = this.isAM
      ? (this.selectedHour === 12 ? 0 : this.selectedHour)
      : (this.selectedHour === 12 ? 12 : this.selectedHour + 12);

    date.setHours(hours, this.selectedMinute, 0, 0); // Set time in IST

    // Just send .toISOString() - it will convert to UTC automatically
    const response = await this.personalTaskService.UpdatePersonalTask({
      taskId: this.taskId,
      dueOn: date.toISOString(), // UTC output
    });

    if (response) {
      this.onDateTimeUpdated.emit(date);
      this.closeComponent();
    }
  } catch (error) {
    console.error('Error updating task:', error);
  } finally {
    this.isUpdating = false;
  }
}


  closeComponent(): void {
    this.onClose.emit();
  }

  canSave(): boolean {
    return this.selectedDate !== null && !this.isUpdating;
  }

  clearInputBox(): void {
    this.selectedDate = null;
    this.selectedHour = 12;
    this.selectedMinute = 0;
    this.isAM = true;
    this.currentStep = PickerStep.DATE;
  }


}