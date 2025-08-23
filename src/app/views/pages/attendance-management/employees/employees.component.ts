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

interface CustomField {
  _id?: string;
  label: string;
  type: 'text' | 'date' | 'select';
  options: string[];
}

interface AvailableShift {
  shiftId: string;
  officeName: string;
  officeId: string;
  startFrom: string;
  startTo: string;
  endFrom: string;
  endTo: string;
}

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss',
})
export class EmployeesComponent implements OnInit, OnDestroy {
  isEditMode = false;
  isNewMode = false;
  editingId: string | null = null;
  imagePreview: string | null = null;
  selectedImageFile: File | null = null;
  profileImageBaseUrl = environment.imageURL;
  searchText = '';
  selectedOfficeId: string = '';
  offices: any[] = [];
  employees: any[] = [];
  filteredEmployees: any[] = [];
  availableCustomFields: CustomField[] = [];
  availableShifts: AvailableShift[] = [];
  allAvailableShifts: AvailableShift[] = [];
  isOfficeDropdownOpen = false;
  isDragging = false;
  isLoading = false;
  isSaving = false;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  showPassword = false;

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
    shiftType: '', // 'office' or 'custom'
    officeShiftId: '',
    customShift: {
      startFrom: '10:00',
      startTo: '10:30',
      endFrom: '19:00',
      endTo: '19:30',
    },
    customFields: {} as { [key: string]: string },
  };

  getOffices = async () => {
    this.isLoading = true;
    try {
      const data = await this.attendanceService.getOffices({
        businessCardId: this.storage.get(common.BUSINESS_CARD),
      });
      this.offices = data && data.docs ? data.docs : [];

      if (this.offices.length > 0) {
        console.log('Offices loaded:', this.offices);
        this.loadSiftsForAllOffices();
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
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
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

  onOfficeChange = async () => {
    // Reset custom fields
    this.form.customFields = {};

    // Load custom fields and shifts for selected offices
    await this.loadCustomFieldsForOffices();
    this.loadShiftsForOffices();

    // Initialize custom fields with default values
    this.availableCustomFields.forEach((field) => {
      this.form.customFields[field.label] = '';
    });
  };

  loadCustomFieldsForOffices = async () => {
    if (this.form.officess.length === 0) {
      this.availableCustomFields = [];
      return;
    }

    const allCustomFields: CustomField[] = [];
    for (const officeId of this.form.officess) {
      try {
        const fields = await this.attendanceService.getCustomFields({
          officeId,
        });
        console.log('Custom fields for office:', officeId, fields);
        if (fields) {
          allCustomFields.push(...fields);
        }
      } catch (error) {
        console.error(
          'Error loading custom fields for office:',
          officeId,
          error
        );
      }
    }

    // Remove duplicates based on label
    this.availableCustomFields = allCustomFields.filter(
      (field, index, self) =>
        index === self.findIndex((f) => f.label === field.label)
    );

    console.log('Available custom fields:', this.availableCustomFields);
  };

  loadSiftsForAllOffices = async () => {
    if (this.offices.length === 0) {
      this.availableShifts = [];
      return;
    }

    const allShifts = [];
    for (const officeDetails of this.offices) {
      const office = this.offices.find((o) => o._id === officeDetails._id);
      if (office && office.shifts) {
        for (const shift of office.shifts) {
          allShifts.push({
            shiftId: shift.shiftId,
            officeName: office.name,
            officeId: office._id,
            startFrom: shift.startFrom,
            startTo: shift.startTo,
            endFrom: shift.endFrom,
            endTo: shift.endTo,
          });
        }
      }
    }

    console.log('All shifts loaded:', allShifts);
    this.allAvailableShifts = allShifts;
  };

  loadShiftsForOffices = () => {
    this.availableShifts = [];

    for (const officeId of this.form.officess) {
      const office = this.offices.find((o) => o._id === officeId);
      if (office && office.shifts) {
        for (const shift of office.shifts) {
          this.availableShifts.push({
            shiftId: shift.shiftId,
            officeName: office.name,
            officeId: office._id,
            startFrom: shift.startFrom,
            startTo: shift.startTo,
            endFrom: shift.endFrom,
            endTo: shift.endTo,
          });
        }
      }
    }
  };

  onSaveEmployee = async () => {
    this.isSaving = true;
    const formData = new FormData();

    // Basic employee data
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

    // Offices
    this.form.officess.forEach((officeId, index) => {
      formData.append(`officess[${index}]`, officeId);
    });

    // Profile image
    if (this.selectedImageFile) {
      formData.append('file', this.selectedImageFile);
    }

    // Shift data
    if (this.form.shiftType === 'office' && this.form.officeShiftId) {
      const selectedSiftsOffice = this.availableShifts.find(
        (s) => s.shiftId === this.form.officeShiftId
      );
      if (selectedSiftsOffice) {
        formData.append('officeId', selectedSiftsOffice.officeId);
      }
      formData.append('officeShiftId', this.form.officeShiftId);
    } else if (this.form.shiftType === 'custom') {
      formData.append(
        'customShift[startFrom]',
        this.convertTimeFormat(this.form.customShift.startFrom)
      );
      formData.append(
        'customShift[startTo]',
        this.convertTimeFormat(this.form.customShift.startTo)
      );
      formData.append(
        'customShift[endFrom]',
        this.convertTimeFormat(this.form.customShift.endFrom)
      );
      formData.append(
        'customShift[endTo]',
        this.convertTimeFormat(this.form.customShift.endTo)
      );
    }

    // Custom fields
    Object.keys(this.form.customFields).forEach((key) => {
      if (this.form.customFields[key]) {
        formData.append(`customFields[${key}]`, this.form.customFields[key]);
      }
    });

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
      shiftType: '',
      officeShiftId: '',
      customShift: {
        startFrom: '10:00',
        startTo: '10:30',
        endFrom: '19:00',
        endTo: '19:30',
      },
      customFields: {},
    };
    this.imagePreview = null;
    this.selectedImageFile = null;
    this.isEditMode = false;
    this.isNewMode = false;
    this.editingId = null;
    this.availableCustomFields = [];
    this.availableShifts = [];
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  onNewEmployee = () => {
    this.onReset();
    this.isNewMode = true;
    this.editingId = null;
    this.imagePreview = null;
    this.selectedImageFile = null;
  };

  onEditEmployee = async (employee: any) => {
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
      shiftType: employee.officeShiftId ? 'office' : '',
      officeShiftId: employee.officeShiftId || '',
      customShift: {
        startFrom: '10:00',
        startTo: '10:30',
        endFrom: '19:00',
        endTo: '19:30',
      },
      customFields: employee.customFields || {},
    };

    if (employee.profileImg) {
      this.imagePreview = this.profileImageBaseUrl + employee.profileImg;
    }

    // Load custom fields and shifts for the selected offices
    await this.loadCustomFieldsForOffices();
    this.loadShiftsForOffices();
  };

  // Image handling methods
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

  // Utility methods
  convertTimeFormat = (time: string): string => {
    // Convert from HH:MM to HH:MM:SS format
    return time + ':00';
  };

  convertTimeToInput = (time: string): string => {
    // Convert from HH:MM:SS to HH:MM format for input
    return time ? time.substring(0, 5) : '';
  };

  formatTime = (time: string): string => {
    if (!time) return '';
    const timePart = time.substring(0, 5);
    const [hours, minutes] = timePart.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
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

  getOfficeName(officeId: string): string {
    const office = this.offices.find((o) => o._id === officeId);
    return office ? office.name : 'Unknown';
  }

  getShiftInfo(shiftId: string, officeId: string): string {
    if (!shiftId) return 'No Shift';

    const office = this.offices.find((o) => o._id === officeId);
    if (!office || !office.shifts) return 'No Shift';

    console.log(office.shifts);

    const shift = office.shifts.find((s: any) => s.shiftId === shiftId);
    if (!shift) return 'No Shift';

    return `${this.formatTime(shift.startFrom)} - ${this.formatTime(
      shift.endFrom
    )}`;
  }

  isOfficeHasShift(officeShiftId: string, officeId: string): any {
    if (!officeShiftId) return 'No Shift';

    const office = this.offices.find((o) => o._id === officeId);
    if (!office || !office.shifts) return 'No Shift';

    const shift = office.shifts.find((s: any) => s.shiftId === officeShiftId);
    if (!shift) return false;
    return true;
  }

  trackById(index: number, item: any): string {
    return item._id;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
