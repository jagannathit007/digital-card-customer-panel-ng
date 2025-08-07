import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { common } from 'src/app/core/constants/common';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { ModalService } from 'src/app/core/utilities/modal';
import { AttendanceService } from 'src/app/services/attendance.service';
import { environment } from 'src/env/env.prod';

@Component({
  selector: 'app-offices',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './offices.component.html',
  styleUrl: './offices.component.scss',
})
export class OfficesComponent implements OnInit, OnDestroy {
  isEditMode = false;
  editingId: string | null = null;
  selectedOffice: any = null;
  employees: any[] = [];
  profileImageBaseUrl = environment.imageURL;

  constructor(
    private attendanceService: AttendanceService,
    private storage: AppStorage,
    public modal: ModalService
  ) {}

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.getOffices();
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.onSearch());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isLoading = false;
  searchText = '';
  form = {
    office: {
      name: '',
      address: '',
      lat: '',
      long: '',
      radius: '',
      isActive: true,
    },
  };
  offices: any[] = [];
  filteredOffices: any[] = [];

  getOffices = async () => {
    this.isLoading = true;
    const data = await this.attendanceService.getOffices({
      businessCardId: this.storage.get(common.BUSINESS_CARD),
    });
    this.isLoading = false;
    if (data && data.docs) {
      this.offices = data.docs;
      this.filteredOffices = [...this.offices]; // Initialize filtered list
    } else {
      this.offices = [];
      this.filteredOffices = [];
    }
  };

  onSearch = () => {
    const searchTerm = this.searchText.toLowerCase().trim();
    if (!searchTerm) {
      this.filteredOffices = [...this.offices];
      return;
    }
    this.filteredOffices = this.offices.filter(
      (office) =>
        office.name.toLowerCase().includes(searchTerm) ||
        office.address.toLowerCase().includes(searchTerm)
    );
  };

  isSaving = false;
  onSaveOffice = async () => {
    this.isSaving = true;
    let result;
    if (this.isEditMode && this.editingId) {
      result = await this.attendanceService.updateOffice({
        _id: this.editingId,
        ...this.form.office,
      });
    } else {
      result = await this.attendanceService.addOffice({
        ...this.form.office,
        businessCardId: this.storage.get(common.BUSINESS_CARD),
      });
    }

    if (result) {
      const message = this.isEditMode
        ? 'Office updated successfully!'
        : 'Office created successfully!';
      swalHelper.showToast(message, 'success');
      this.onReset();
      this.getOffices();
    }
    this.isSaving = false;
  };

  onReset = () => {
    this.form = {
      office: {
        name: '',
        address: '',
        lat: '',
        long: '',
        radius: '',
        isActive: true,
      },
    };
    this.isEditMode = false;
    this.editingId = null;
  };

  onEditOffice = (office: any) => {
    this.isEditMode = true;
    this.editingId = office._id;
    this.form.office = {
      name: office.name,
      address: office.address,
      lat: office.lat,
      long: office.long,
      radius: office.radius,
      isActive: office.isActive,
    };
  };

  onDeleteOffice = async (office: any) => {
    const confirmed = await swalHelper.confirmation(
      'Are you sure?',
      'You won\'t be able to revert this.',
      'warning'
    );
    if (!confirmed.isConfirmed) return;

    const result = await this.attendanceService.deleteOffice({_id: office});
    if (result) {
      swalHelper.showToast('Office deleted successfully!', 'success');
      this.getOffices();
    }
  };

  onViewEmployees = async (office: any) => {
    this.selectedOffice = office;
    await this.getEmployees(office._id);
    this.modal.open('employeesModal');
  };

  getEmployees = async (officeId: string) => {
    this.isLoading = true;
    const data = await this.attendanceService.getEmployees({
      businessCardId: this.storage.get(common.BUSINESS_CARD),
      officeId,
    });
    this.isLoading = false;
    if (data && data.docs) {
      this.employees = data.docs;
    } else {
      this.employees = [];
    }
  };

  getInitials(name: string): string {
    if (!name) return 'N/A';
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
