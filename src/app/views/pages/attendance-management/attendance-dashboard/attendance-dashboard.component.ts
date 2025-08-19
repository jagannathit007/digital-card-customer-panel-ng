import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { common } from 'src/app/core/constants/common';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AttendanceService } from 'src/app/services/attendance.service';
import { environment } from 'src/env/env.local';

interface AttendanceRecord {
  employeeId: string;
  name: string;
  profileImg?: string;
  punchIn: string | null;
  punchOut: string | null;
  inouts: Array<{
    dateTime: string;
    lat: string;
    long: string;
    type: 'in' | 'out';
  }>;
  totalDuration: string;
  hasMultiple: boolean;
  attendanceId: string | null;
}

interface AttendanceStats {
  present: number;
  absent: number;
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance-dashboard.component.html',
  styleUrl: './attendance-dashboard.component.scss',
})
export class AttendanceDashboardComponent implements OnInit, OnDestroy {
  selectedDate: string = '';
  selectedOfficeId: string = '';
  searchText = '';
  offices: any[] = [];
  attendanceRecords: AttendanceRecord[] = [];
  filteredRecords: AttendanceRecord[] = [];
  stats: AttendanceStats = {
    present: 0,
    absent: 0
  };

  isOfficeDropdownOpen = false;
  isLoading = false;
  isSendingNotification = false;

  // Filter states
  currentFilter: 'all' | 'present' | 'absent' = 'all';
  isFilterToggled: boolean = false; // Tracks toggle state

  // Notification modal
  showNotificationModal = false;
  notificationForm = {
    sendToAll: false,
    selectedEmployeeId: '',
    title: '',
    description: ''
  };

  // Punch details modal
  showPunchModal = false;
  selectedEmployeePunches: any = null;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  public imagesBaseUrl = environment.imageURL;

  constructor(
    private attendanceService: AttendanceService,
    private storage: AppStorage
  ) {}

  ngOnInit(): void {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.getOffices();
    this.setupSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getOffices = async () => {
    this.isLoading = true;
    try {
      const data = await this.attendanceService.getOffices({
        businessCardId: this.storage.get(common.BUSINESS_CARD),
      });
      this.offices = data && data.docs ? data.docs : [];
      if (this.offices.length > 0) {
        this.selectedOfficeId = this.offices[0]._id;
        this.getAttendanceData();
      }
    } catch (error) {
      await swalHelper.showToast(
        'Failed to load offices. Please try again.',
        'error'
      );
    } finally {
      this.isLoading = false;
    }
  };

  getAttendanceData = async () => {
    if (!this.selectedOfficeId) return;

    this.isLoading = true;
    try {
      const attendanceData = await this.attendanceService.getAttendanceList({
        officeId: this.selectedOfficeId,
        date: this.selectedDate,
        search: this.searchText
      });
      this.attendanceRecords = attendanceData || [];

      // Sort by name by default
      this.attendanceRecords.sort((a, b) => a.name.localeCompare(b.name));

      const statsData = await this.attendanceService.getAttendanceStats({
        officeId: this.selectedOfficeId,
        date: this.selectedDate
      });
      this.stats = statsData || { present: 0, absent: 0 };

      this.applyFilter();
    } catch (error) {
      await swalHelper.showToast(
        'Failed to load attendance data. Please try again.',
        'error'
      );
    } finally {
      this.isLoading = false;
    }
  };

  setupSearch = () => {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.getAttendanceData();
    });
  };

  onSearch = () => {
    this.searchSubject.next(this.searchText);
  };

  onDateChange(): void {
    this.getAttendanceData();
  }

  refreshData(): void {
    this.getAttendanceData();
  }

  toggleOfficeDropdown = () => {
    this.isOfficeDropdownOpen = !this.isOfficeDropdownOpen;
  };

  selectOffice = (officeId: string) => {
    this.selectedOfficeId = officeId;
    this.isOfficeDropdownOpen = false;
    this.getAttendanceData();
  };

  getOfficeName(officeId: string): string {
    const office = this.offices.find((o) => o._id === officeId);
    return office ? office.name : 'Unknown';
  }

  setFilter(filter: 'present' | 'absent') {
    if (this.currentFilter === filter && this.isFilterToggled) {
      // If same filter is clicked again, revert to default (name sort)
      this.currentFilter = 'all';
      this.isFilterToggled = false;
    } else {
      // Apply new filter and set toggled state
      this.currentFilter = filter;
      this.isFilterToggled = true;
    }
    this.applyFilter();
  }

  applyFilter() {
    let filtered = [...this.attendanceRecords];

    if (this.currentFilter === 'present' && this.isFilterToggled) {
      filtered = [
        ...filtered.filter(record => record.punchIn !== null).sort((a, b) => a.name.localeCompare(b.name)),
        ...filtered.filter(record => record.punchIn === null).sort((a, b) => a.name.localeCompare(b.name))
      ];
    } else if (this.currentFilter === 'absent' && this.isFilterToggled) {
      filtered = [
        ...filtered.filter(record => record.punchIn === null).sort((a, b) => a.name.localeCompare(b.name)),
        ...filtered.filter(record => record.punchIn !== null).sort((a, b) => a.name.localeCompare(b.name))
      ];
    } else {
      // Default sort by name
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    this.filteredRecords = filtered;
  }

  showPunchDetails(record: AttendanceRecord) {
    if (record.inouts && record.inouts.length > 0) {
      this.selectedEmployeePunches = {
        name: record.name,
        inouts: record.inouts,
        totalDuration: record.totalDuration
      };
      this.showPunchModal = true;
    }
  }

  closePunchModal() {
    this.showPunchModal = false;
    this.selectedEmployeePunches = null;
  }

  openInGoogleMaps(lat: string, long: string) {
    if (lat && long) {
      const url = `https://www.google.com/maps?q=${lat},${long}`;
      window.open(url, '_blank');
    }
  }

  openNotificationModal() {
    this.showNotificationModal = true;
    this.resetNotificationForm();
    this.notificationForm.sendToAll = true;
  }

  openNotificationModalForEmployee(record: AttendanceRecord) {
    this.showNotificationModal = true;
    this.resetNotificationForm();
    this.notificationForm.sendToAll = false;
    this.notificationForm.selectedEmployeeId = record.employeeId;
  }

  closeNotificationModal() {
    this.showNotificationModal = false;
    this.resetNotificationForm();
  }

  resetNotificationForm() {
    this.notificationForm = {
      sendToAll: false,
      selectedEmployeeId: '',
      title: '',
      description: ''
    };
  }

  sendNotification = async () => {
    if (!this.notificationForm.title || !this.notificationForm.description) {
      await swalHelper.showToast('Please fill in title and description', 'warning');
      return;
    }
    if (!this.notificationForm.sendToAll && !this.notificationForm.selectedEmployeeId) {
      await swalHelper.showToast('Please select an employee or choose to send to all', 'warning');
      return;
    }
    this.isSendingNotification = true;
    try {
      const payload: any = {
        title: this.notificationForm.title,
        description: this.notificationForm.description,
        all: this.notificationForm.sendToAll
      };
      if (this.notificationForm.sendToAll) {
        payload.officeId = this.selectedOfficeId;
      } else {
        payload.employeeId = this.notificationForm.selectedEmployeeId;
      }
      await this.attendanceService.sendNotification(payload);
      this.closeNotificationModal();
    } catch (error) {
      await swalHelper.showToast(
        'Failed to send notification. Please try again.',
        'error'
      );
    } finally {
      this.isSendingNotification = false;
    }
  };

  formatTime(dateTimeString: string): string {
    if (!dateTimeString) return '--:--';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  formatDateTime(dateTimeString: string): string {
    if (!dateTimeString) return '--';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getInitials(name: string): string {
    if (!name) return 'N/A';
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getPresentEmployees(): AttendanceRecord[] {
    return this.attendanceRecords;
  }

  trackById(index: number, item: AttendanceRecord): string {
    return item.employeeId;
  }
}