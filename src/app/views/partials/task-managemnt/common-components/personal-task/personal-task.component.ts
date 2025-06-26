// import { Component } from '@angular/core';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
// import { PersonalTaskService } from 'src/app/services/personal-task.service';
// import { OnInit } from '@angular/core';


// @Component({
//   selector: 'app-personal-task',
//   standalone: true,
//   imports: [],
//   templateUrl: './personal-task.component.html',
//   styleUrl: './personal-task.component.scss'
// })
// export class PersonalTaskComponent implements OnInit {


//   constructor(
//     private personalTaskService: PersonalTaskService,
//     private storage: AppStorage
//   ) {}

//   async ngOnInit(): Promise<void> {
   
//   }

// }

// add-task-modal.component.ts
import { Component, Output, EventEmitter, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonalTaskService } from 'src/app/services/personal-task.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isPast: boolean;
}

@Component({
  selector: 'app-personal-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
 templateUrl: './personal-task.component.html',
  styleUrl: './personal-task.component.scss'
})
export class PersonalTaskComponent implements OnInit {
  @Output() taskAdded = new EventEmitter<void>();

  // Signals for reactive state
  isModalOpen = signal(false);
  showTitleError = signal(false);
  isSubmitting = signal(false);
  hoveredMember = signal<any>(null);
  showTooltip = signal(false);
  
  // Form data
  taskTitle = '';
  selectedDate = new Date();
  selectedHour = new Date().getHours();
  selectedMinute = new Date().getMinutes();
  currentMonth = new Date();
  selectedYear = new Date().getFullYear();
  calendarDays: CalendarDay[] = [];
  
  // Clock interaction
  isDragging = false;
  dragType = ''; // 'hour' or 'minute'

  constructor(
    private personalTaskService: PersonalTaskService,
    private storage: AppStorage
  ) {}

  ngOnInit() {
    this.generateCalendar();
  }

  // Modal Methods
  openModal() {
    this.isModalOpen.set(true);
    this.resetForm();
    this.generateCalendar();
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.resetForm();
  }

  resetForm() {
    this.taskTitle = '';
    this.selectedDate = new Date();
    this.selectedHour = new Date().getHours();
    this.selectedMinute = new Date().getMinutes();
    this.currentMonth = new Date();
    this.selectedYear = new Date().getFullYear();
    this.showTitleError.set(false);
    this.isSubmitting.set(false);
  }

  // Calendar Methods
  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    this.calendarDays = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      this.calendarDays.push({
        date: new Date(date),
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: this.isSameDay(date, today),
        isSelected: this.isSameDay(date, this.selectedDate),
        isPast: date < today && !this.isSameDay(date, today)
      });
    }
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  selectDate(date: Date) {
    this.selectedDate = new Date(date);
    this.generateCalendar();
  }

  previousMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.selectedYear = this.currentMonth.getFullYear();
    this.generateCalendar();
  }

  // Year selection methods
  getYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear - 5; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  }

  onYearChange() {
    this.currentMonth.setFullYear(this.selectedYear);
    this.generateCalendar();
  }

  getDateClass(day: CalendarDay): string {
    let classes = 'tw-hover:bg-gray-100 tw-transition-all tw-duration-200';
    
    if (!day.isCurrentMonth) {
      classes += ' tw-text-gray-300';
    } else if (day.isPast) {
      classes += ' tw-text-gray-400 tw-cursor-not-allowed';
    } else {
      classes += ' tw-text-gray-700 tw-cursor-pointer tw-hover:scale-105';
    }
    
    if (day.isToday) {
      classes += ' tw-bg-blue-100 tw-text-blue-600 tw-font-semibold';
    }
    
    if (day.isSelected) {
      classes += ' tw-bg-blue-600 tw-text-white tw-font-semibold';
    }
    
    return classes;
  }

  // Clock SVG calculations
  getHourMarkerX1(index: number): number {
    const angle = (index * 30 - 90) * Math.PI / 180;
    return 100 + 80 * Math.cos(angle);
  }

  getHourMarkerY1(index: number): number {
    const angle = (index * 30 - 90) * Math.PI / 180;
    return 100 + 80 * Math.sin(angle);
  }

  getHourMarkerX2(index: number): number {
    const angle = (index * 30 - 90) * Math.PI / 180;
    return 100 + 70 * Math.cos(angle);
  }

  getHourMarkerY2(index: number): number {
    const angle = (index * 30 - 90) * Math.PI / 180;
    return 100 + 70 * Math.sin(angle);
  }

  getHourTextX(index: number): number {
    const angle = (index * 30 - 90) * Math.PI / 180;
    return 100 + 60 * Math.cos(angle);
  }

  getHourTextY(index: number): number {
    const angle = (index * 30 - 90) * Math.PI / 180;
    return 100 + 60 * Math.sin(angle);
  }

  getHourHandX(): number {
    const angle = ((this.selectedHour % 12) * 30 + this.selectedMinute * 0.5 - 90) * Math.PI / 180;
    return 100 + 40 * Math.cos(angle);
  }

  getHourHandY(): number {
    const angle = ((this.selectedHour % 12) * 30 + this.selectedMinute * 0.5 - 90) * Math.PI / 180;
    return 100 + 40 * Math.sin(angle);
  }

  getMinuteHandX(): number {
    const angle = (this.selectedMinute * 6 - 90) * Math.PI / 180;
    return 100 + 65 * Math.cos(angle);
  }

  getMinuteHandY(): number {
    const angle = (this.selectedMinute * 6 - 90) * Math.PI / 180;
    return 100 + 65 * Math.sin(angle);
  }

  // Clock interaction methods
  startTimeDrag(event: MouseEvent) {
    this.isDragging = true;
    this.updateTimeFromMouse(event);
  }

  onTimeDrag(event: MouseEvent) {
    if (this.isDragging) {
      this.updateTimeFromMouse(event);
    }
  }

  endTimeDrag() {
    this.isDragging = false;
  }

  updateTimeFromMouse(event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = event.clientX - centerX;
    const y = event.clientY - centerY;
    const angle = Math.atan2(y, x) * 180 / Math.PI + 90;
    const normalizedAngle = angle < 0 ? angle + 360 : angle;
    
    const distance = Math.sqrt(x * x + y * y);
    
    if (distance < 50) {
      // Hour hand
      const hour = Math.round(normalizedAngle / 30) % 12;
      this.selectedHour = this.selectedHour >= 12 ? hour + 12 : hour;
    } else {
      // Minute hand
      this.selectedMinute = Math.round(normalizedAngle / 6) % 60;
    }
  }

  onTimeInputChange() {
    // Ensure valid ranges
    if (this.selectedHour < 0) this.selectedHour = 0;
    if (this.selectedHour > 23) this.selectedHour = 23;
    if (this.selectedMinute < 0) this.selectedMinute = 0;
    if (this.selectedMinute > 59) this.selectedMinute = 59;
  }

  formatTime(hour: number, minute: number): string {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  // Form submission
  async addTask() {
    this.showTitleError.set(false);

    if (!this.taskTitle.trim()) {
      this.showTitleError.set(true);
      return;
    }

    this.isSubmitting.set(true);

    try {
      // Combine date and time
      const dueOn = new Date(this.selectedDate);
      dueOn.setHours(this.selectedHour, this.selectedMinute, 0, 0);

      const taskData = {
        title: this.taskTitle.trim(),
        dueOn: dueOn.toISOString()
      };

      await this.personalTaskService.AddPersonalTask(taskData);
      this.taskAdded.emit();
      this.closeModal();
      
    } catch (error) {
      console.error('Error adding task:', error);
      // Handle error (show toast, etc.)
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

