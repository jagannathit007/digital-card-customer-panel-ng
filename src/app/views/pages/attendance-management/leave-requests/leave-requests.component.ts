import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AttendanceService } from 'src/app/services/attendance.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { common } from 'src/app/core/constants/common';

interface Leave {
  _id: string;
  employeeId: { _id: string; name: string; emailId: string };
  officeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminComment: string;
}

@Component({
  selector: 'app-leave-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-requests.component.html',
  styleUrl: './leave-requests.component.scss'
})
export class LeaveRequestsComponent implements OnInit, OnDestroy {
  leaves: Leave[] = [];
  filteredLeaves: Leave[] = [];
  offices: any[] = [];
  selectedOfficeId: string = '';
  selectedStatus: string[] = ['Pending', 'Approved', 'Rejected'];
  isLoading = false;
  isOfficeDropdownOpen = false;
  isStatusDropdownOpen = false;
  
  // Modals
  isRejectModalOpen = false;
  isApproveModalOpen = false;
  isViewModalOpen = false;
  
  selectedLeave: Leave | null = null;
  businessCardId: string = '';
  rejectionReason: string = '';
  approvalComment: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private attendanceService: AttendanceService,
    private storage: AppStorage
  ) {}

  ngOnInit(): void {
    this.businessCardId = this.storage.get(common.BUSINESS_CARD);
    this.getOffices();
    this.getLeaves();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async getOffices(): Promise<void> {
    this.isLoading = true;
    try {
      const data = await this.attendanceService.getOffices({
        businessCardId: this.businessCardId
      });
      this.offices = data && data.docs ? data.docs : [];
      this.selectedOfficeId = this.offices.length > 0 ? this.offices[0]._id : '';
    } catch (error) {
      await swalHelper.showToast('Failed to load offices.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async getLeaves(): Promise<void> {
    this.isLoading = true;
    try {
      const data = await this.attendanceService.getLeaves({
        officeId: this.selectedOfficeId || this.businessCardId,
        status: this.selectedStatus,
      });
      this.leaves = data || [];
      this.filteredLeaves = [...this.leaves];
    } catch (error) {
      await swalHelper.showToast('Failed to load leave requests.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  toggleOfficeDropdown(): void {
    this.isOfficeDropdownOpen = !this.isOfficeDropdownOpen;
    if (this.isOfficeDropdownOpen) {
      this.isStatusDropdownOpen = false;
    }
  }

  toggleStatusDropdown(): void {
    this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
    if (this.isStatusDropdownOpen) {
      this.isOfficeDropdownOpen = false;
    }
  }

  selectOffice(officeId: string): void {
    this.selectedOfficeId = officeId;
    this.isOfficeDropdownOpen = false;
    this.getLeaves();
  }

  selectStatus(status: string[]): void {
    this.selectedStatus = status;
    this.isStatusDropdownOpen = false;
    this.getLeaves();
  }

  getStatusFilterLabel(): string {
    if (this.selectedStatus.length === 3) return 'All Statuses';
    if (this.selectedStatus.length === 1) return this.selectedStatus[0];
    return 'Multiple Statuses';
  }

  // Open approve confirmation modal directly
  approveLeave(leave: Leave): void {
    this.selectedLeave = leave;
    this.approvalComment = '';
    this.isApproveModalOpen = true;
  }

  // Open reject modal
  openRejectModal(leave: Leave): void {
    this.selectedLeave = leave;
    this.rejectionReason = '';
    this.isRejectModalOpen = true;
  }

  // View details modal
  viewDetails(leave: Leave): void {
    this.selectedLeave = leave;
    this.isViewModalOpen = true;
  }

  async approveLeaveConfirm(): Promise<void> {
    if (!this.selectedLeave) return;

    this.isLoading = true;
    try {
      const payload = {
        leaveId: this.selectedLeave._id,
        status: 'Approved',
        adminComment: this.approvalComment,
      };
      const result = await this.attendanceService.manageLeave(payload);
      if (result) {
        this.isApproveModalOpen = false;
        this.selectedLeave = null;
        this.getLeaves();
      }
    } catch (error) {
      await swalHelper.showToast('Failed to approve leave request.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async rejectLeave(): Promise<void> {
    if (!this.selectedLeave || !this.rejectionReason) {
      await swalHelper.showToast('Please provide a rejection reason.', 'error');
      return;
    }

    this.isLoading = true;
    try {
      const payload = {
        leaveId: this.selectedLeave._id,
        status: 'Rejected',
        adminComment: this.rejectionReason,
      };
      const result = await this.attendanceService.manageLeave(payload);
      if (result) {
        this.isRejectModalOpen = false;
        this.selectedLeave = null;
        this.getLeaves();
      }
    } catch (error) {
      await swalHelper.showToast('Failed to reject leave request.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  closeModal(): void {
    this.isRejectModalOpen = false;
    this.isApproveModalOpen = false;
    this.isViewModalOpen = false;
    this.selectedLeave = null;
    this.rejectionReason = '';
    this.approvalComment = '';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  }

  getOfficeName(officeId: string): string {
    const office = this.offices.find(o => o._id === officeId);
    return office ? office.name : 'Unknown';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  trackById(index: number, item: Leave): string {
    return item._id;
  }
}