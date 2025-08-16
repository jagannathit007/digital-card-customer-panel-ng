import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { common } from 'src/app/core/constants/common';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AttendanceService } from 'src/app/services/attendance.service';

@Component({
  selector: 'app-atendance-report', // Note: Consider renaming to 'app-attendance-report' for consistency
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './atendance-report.component.html',
  styleUrls: ['./atendance-report.component.scss']
})
export class AtendanceReportComponent implements OnInit, OnDestroy {
  offices: any[] = [];
  employees: any[] = [];
  selectedOfficeId: string = '';
  selectedEmployeeId: string = '';
  selectedMonth: string = ''; // Format: YYYY-MM
  isOfficeDropdownOpen = false;
  isEmployeeDropdownOpen = false;
  isLoading = false;
  isGenerating = false;
  employeeSearchText = '';
  filteredEmployees: any[] = [];

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private attendanceService: AttendanceService,
    private storage: AppStorage
  ) {}

  ngOnInit(): void {
    this.getOffices();
    this.setupSearch();
    // Set default month to current
    const now = new Date();
    this.selectedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
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
    } catch (error) {
      console.error('Error fetching offices:', error);
      await swalHelper.showToast('Failed to load offices. Please try again.', 'error');
    } finally {
      this.isLoading = false;
    }
  };

  onOfficeSelect = async (officeId: string) => {
    this.selectedOfficeId = officeId;
    this.isOfficeDropdownOpen = false;
    this.selectedEmployeeId = '';
    this.employeeSearchText = '';
    if (officeId) {
      await this.getEmployeesForOffice(officeId);
    } else {
      this.employees = [];
      this.filteredEmployees = [];
    }
  };

  getEmployeesForOffice = async (officeId: string) => {
    this.isLoading = true;
    try {
      const data = await this.attendanceService.getEmployees({
        businessCardId: this.storage.get(common.BUSINESS_CARD),
        officeId,
        limit: 100,
      });
      this.employees = data && data.docs ? data.docs : [];
      this.filteredEmployees = [...this.employees];
    } catch (error) {
      console.error('Error fetching employees:', error);
      await swalHelper.showToast('Failed to load employees. Please try again.', 'error');
    } finally {
      this.isLoading = false;
    }
  };

  setupSearch = () => {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchText) => {
        this.filterEmployees(searchText);
      });
  };

  onEmployeeSearch = () => {
    this.searchSubject.next(this.employeeSearchText);
  };

  filterEmployees = (searchText: string) => {
    if (!searchText) {
      this.filteredEmployees = [...this.employees];
      return;
    }
    const lowerSearch = searchText.toLowerCase();
    this.filteredEmployees = this.employees.filter(emp =>
      emp.name.toLowerCase().includes(lowerSearch) ||
      emp.emailId.toLowerCase().includes(lowerSearch) ||
      emp.designation.toLowerCase().includes(lowerSearch)
    );
  };

  toggleOfficeDropdown = () => {
    this.isOfficeDropdownOpen = !this.isOfficeDropdownOpen;
  };

  toggleEmployeeDropdown = () => {
    this.isEmployeeDropdownOpen = !this.isEmployeeDropdownOpen;
  };

  onEmployeeSelect = (employeeId: string) => {
    this.selectedEmployeeId = employeeId;
    this.isEmployeeDropdownOpen = false;
  };

  generateReport = async () => {
    if (!this.selectedOfficeId || !this.selectedMonth) {
      await swalHelper.showToast('Please select office and month.', 'warning');
      return;
    }
    this.isGenerating = true;
    try {
      const body = {
        officeId: this.selectedOfficeId,
        month: this.selectedMonth,
        employeeId: this.selectedEmployeeId || undefined
      };
      const blob = await this.attendanceService.generateAttendanceReport(body);
      if (!blob) {
        throw new Error('No data returned from the server');
      }
      if (!(blob instanceof Blob)) {
        throw new Error('Invalid response: Expected a Blob');
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.getReportFilename();
      a.click();
      window.URL.revokeObjectURL(url);
      await swalHelper.showToast('Report downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error generating report:', error);
      await swalHelper.showToast('Failed to generate report. Please try again.', 'error');
    } finally {
      this.isGenerating = false;
    }
  };

  getReportFilename = (): string => {
    const monthName = new Date(this.selectedMonth + '-01').toLocaleString('default', { month: 'long' }).toLowerCase();
    const year = this.selectedMonth.split('-')[0];
    if (this.selectedEmployeeId) {
      const employee = this.employees.find(emp => emp._id === this.selectedEmployeeId);
      const employeeName = employee ? employee.name.toLowerCase().replace(/\s+/g, '_') : 'employee';
      return `${monthName}${year}_${employeeName}.xlsx`;
    }
    return `${monthName}${year}_employees.xlsx`;
  };

  getOfficeName = (officeId: string): string => {
    const office = this.offices.find(o => o._id === officeId);
    return office ? office.name : 'Select Office';
  };

  getEmployeeName = (employeeId: string): string => {
    const employee = this.employees.find(e => e._id === employeeId);
    return employee ? employee.name : 'All Employees';
  };
}