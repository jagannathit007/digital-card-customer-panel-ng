import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { common } from 'src/app/core/constants/common';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AttendanceService } from 'src/app/services/attendance.service';
import { environment } from 'src/env/env.prod';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss',
})
export class EmployeesComponent implements OnInit, OnDestroy {
  isEditMode = false;
  editingId: string | null = null;
  imagePreview: string | null = null;
  selectedImageFile: File | null = null;
  profileImageBaseUrl = environment.imageURL;
  searchText = '';
  selectedOfficeId: string = '';
  offices: any[] = [];
  employees: any[] = [];
  filteredEmployees: any[] = [];
  isOfficeDropdownOpen = false;
  isDragging = false;
  isLoading = false;
  isSaving = false;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  constructor(
    private attendanceService: AttendanceService,
    private storage: AppStorage
  ) {}

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.getOffices();
    this.getEmployees();
    this.setupSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  form = {
    name: '',
    designation: '',
    emailId: '',
    password: '',
    mobileNo: '',
    personal_details: {
      aadharNo: '',
      panNo: '',
    },
    employeeType: '',
    officess: [] as string[],
    salary: '',
    isActive: true,
    lock_profile: false,
    allow_bypass: false,
  };

  getOffices = async () => {
    this.isLoading = true;
    try {
      const data = await this.attendanceService.getOffices({
        businessCardId: this.storage.get(common.BUSINESS_CARD),
      });
      this.offices = data && data.docs ? data.docs : [];
    } catch (error) {
      await swalHelper.showToast(
        'Failed to load offices. Please try again.',
        'error'
      );
    } finally {
      this.isLoading = false;
    }
  };

  getEmployees = async () => {
    this.isLoading = true;
    try {
      const data = await this.attendanceService.getEmployees({
        businessCardId: this.storage.get(common.BUSINESS_CARD),
        officeId: this.selectedOfficeId || undefined,
        search: this.searchText,
        page: this.currentPage,
        limit: this.pageSize,
      });
      this.employees = data && data.docs ? data.docs : [];
      this.totalItems = data.totalDocs || 0;
      this.totalPages = data.totalPages || 0;
      this.filteredEmployees = [...this.employees];
    } catch (error) {
      await swalHelper.showToast(
        'Failed to load employees. Please try again.',
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
      this.currentPage = 1;
      this.getEmployees();
    });
  };

  onSearch = () => {
    this.searchSubject.next(this.searchText);
  };

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.getEmployees();
  }

  toggleOfficeDropdown = () => {
    this.isOfficeDropdownOpen = !this.isOfficeDropdownOpen;
  };

  selectOffice = (officeId: string) => {
    this.selectedOfficeId = officeId;
    this.isOfficeDropdownOpen = false;
    this.currentPage = 1;
    this.getEmployees();
  };

  onSaveEmployee = async () => {
    this.isSaving = true;
    const formData = new FormData();
    formData.append('name', this.form.name);
    formData.append('designation', this.form.designation);
    formData.append('emailId', this.form.emailId);
    if (this.form.password) {
      formData.append('password', this.form.password);
    }
    formData.append('mobileNo', this.form.mobileNo);
    formData.append(
      'personal_details[aadharNo]',
      this.form.personal_details.aadharNo
    );
    formData.append(
      'personal_details[panNo]',
      this.form.personal_details.panNo
    );
    formData.append('employeeType', this.form.employeeType);
    formData.append('salary', this.form.salary);
    formData.append('isActive', this.form.isActive.toString());
    formData.append('lock_profile', this.form.lock_profile.toString());
    formData.append('allow_bypass', this.form.allow_bypass.toString());
    if (!this.isEditMode) {
      formData.append('businessCardId', this.storage.get(common.BUSINESS_CARD));
    }
    this.form.officess.forEach((officeId, index) => {
      formData.append(`officess[${index}]`, officeId);
    });

    if (this.selectedImageFile) {
      formData.append('file', this.selectedImageFile);
    }

    if (this.isEditMode && this.editingId) {
      formData.append('_id', this.editingId);
    }

    try {
      const result = this.isEditMode
        ? await this.attendanceService.updateEmployee(formData)
        : await this.attendanceService.createEmployee(formData);
      if (result) {
        const message = this.isEditMode
          ? 'Employee updated successfully!'
          : 'Employee created successfully!';
        swalHelper.showToast(message, 'success');
        this.onReset();
        this.getEmployees();
      }
    } catch (error) {
      await swalHelper.showToast(
        'Failed to save employee. Please try again.',
        'error'
      );
    } finally {
      this.isSaving = false;
    }
  };

  onDeleteEmployee = async (employeeId: string) => {
    const confirmed = await swalHelper.confirmation(
      'Are you sure?',
      'This will soft delete the employee if they have attendance records, or hard delete otherwise.',
      'warning'
    );
    if (!confirmed.isConfirmed) return;

    try {
      const result = await this.attendanceService.deleteEmployee({
        _id: employeeId,
      });
      if (result) {
        await swalHelper.showToast('Employee deleted successfully!', 'success');
        this.getEmployees();
      }
    } catch (error) {
      await swalHelper.showToast(
        'Failed to delete employee. Please try again.',
        'error'
      );
    }
  };

  onReset = () => {
    this.form = {
      name: '',
      designation: '',
      emailId: '',
      password: '',
      mobileNo: '',
      personal_details: {
        aadharNo: '',
        panNo: '',
      },
      employeeType: '',
      officess: [] as string[],
      salary: '',
      isActive: true,
      lock_profile: false,
      allow_bypass: false,
    };
    this.imagePreview = null;
    this.selectedImageFile = null;
    this.isEditMode = false;
    this.editingId = null;
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  onEditEmployee = (employee: any) => {
    this.isEditMode = true;
    this.editingId = employee._id;
    this.form = {
      name: employee.name,
      designation: employee.designation,
      emailId: employee.emailId,
      password: '',
      mobileNo: employee.mobileNo,
      personal_details: {
        aadharNo: employee.personal_details?.aadharNo || '',
        panNo: employee.personal_details?.panNo || '',
      },
      employeeType: employee.employeeType || '',
      officess: employee.officess || [],
      salary: employee.salary || '',
      isActive: employee.isActive,
      lock_profile: employee.lock_profile,
      allow_bypass: employee.allow_bypass,
    };
    if (employee.profileImg) {
      this.imagePreview = this.profileImageBaseUrl + employee.profileImg;
    }
  };

  onImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.imagePreview = null;
    this.selectedImageFile = null;
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
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

  getOfficeName(officeId: string): string {
    const office = this.offices.find((o) => o._id === officeId);
    return office ? office.name : 'Unknown';
  }

  trackById(index: number, item: any): string {
    return item._id;
  }
}