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

interface CustomField {
  _id?: string;
  label: string;
  type: 'text' | 'date' | 'select';
  options: string[];
  optionsText?: string; // For UI binding
}

interface Shift {
  shiftId?: string;
  startFrom: string;
  startTo: string;
  endFrom: string;
  endTo: string;
}

@Component({
  selector: 'app-offices',
  templateUrl: './offices.component.html',
  styleUrls: ['./offices.component.scss'],
})
export class OfficesComponent implements OnInit, OnDestroy {
  isEditMode = false;
  editingId: string | null = null;
  selectedOffice: any = null;
  employees: any[] = [];
  profileImageBaseUrl = environment.imageURL;
  isSaving = false;
  isLoading = false;
  searchText = '';
  statusFilter = 'all';

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

  form = {
    office: {
      name: '',
      address: '',
      lat: '',
      long: '',
      radius: '',
      isActive: true,
      shifts: [
        {
          startFrom: '10:00',
          startTo: '10:30',
          endFrom: '19:00',
          endTo: '19:30'
        }
      ] as Shift[],
      customFields: [] as CustomField[]
    },
  };

  offices: any[] = [];
  filteredOffices: any[] = [];

  // Open the office form modal
  openOfficeModal() {
    this.onReset(); // Reset form when opening for new office
    this.modal.open('officeFormModal');
  }

  getOffices = async () => {
    this.isLoading = true;
    try {
      const data = await this.attendanceService.getOffices({
        businessCardId: this.storage.get(common.BUSINESS_CARD),
      });
      this.isLoading = false;
      if (data && data.docs) {
        this.offices = data.docs.map((office:any) => ({
          ...office,
          customFields: office.customFields || []
        }));
        this.applyFilters();
      } else {
        this.offices = [];
        this.filteredOffices = [];
      }
    } catch (error) {
      this.isLoading = false;
      swalHelper.showToast('Failed to load offices', 'error');
    }
  };

  applyFilters() {
    let filtered = [...this.offices];
    
    // Apply status filter
    if (this.statusFilter === 'active') {
      filtered = filtered.filter(office => office.isActive);
    } else if (this.statusFilter === 'inactive') {
      filtered = filtered.filter(office => !office.isActive);
    }
    
    // Apply search filter
    const searchTerm = this.searchText.toLowerCase().trim();
    if (searchTerm) {
      filtered = filtered.filter(
        office =>
          office.name.toLowerCase().includes(searchTerm) ||
          office.address.toLowerCase().includes(searchTerm)
      );
    }
    
    this.filteredOffices = filtered;
  }

  onSearch() {
    this.applyFilters();
  }

  // Shift Management Methods
  addShift = () => {
    this.form.office.shifts.push({
      startFrom: '10:00',
      startTo: '10:30',
      endFrom: '19:00',
      endTo: '19:30'
    });
  };

  removeShift = (index: number) => {
    if (this.form.office.shifts.length > 1) {
      this.form.office.shifts.splice(index, 1);
    }
  };

  // Custom Field Management Methods
  addCustomField = () => {
    this.form.office.customFields.push({
      label: '',
      type: 'text',
      options: [],
      optionsText: ''
    });
  };

  removeCustomField = (index: number) => {
    this.form.office.customFields.splice(index, 1);
  };

  onFieldTypeChange = (field: CustomField) => {
    if (field.type !== 'select') {
      field.options = [];
      field.optionsText = '';
    }
  };

  updateFieldOptions = (field: CustomField) => {
    if (field.optionsText) {
      field.options = field.optionsText.split(',').map(option => option.trim()).filter(option => option);
    } else {
      field.options = [];
    }
  };

  onSaveOffice = async () => {
    this.isSaving = true;
    try {
      // Validate form
      if (!this.validateForm()) {
        return;
      }

      // Prepare shifts data
      const shiftsData = this.form.office.shifts.map(shift => ({
        ...shift,
        startFrom: this.convertTimeFormat(shift.startFrom),
        startTo: this.convertTimeFormat(shift.startTo),
        endFrom: this.convertTimeFormat(shift.endFrom),
        endTo: this.convertTimeFormat(shift.endTo)
      }));

      // Prepare custom fields data
      const customFieldsData = this.form.office.customFields
        .filter(field => field.label.trim())
        .map(field => ({
          _id: field._id,
          label: field.label.trim(),
          type: field.type,
          options: field.type === 'select' ? field.options : []
        }));

      const payload = {
        name: this.form.office.name.trim(),
        address: this.form.office.address.trim(),
        lat: this.form.office.lat.trim(),
        long: this.form.office.long.trim(),
        radius: this.form.office.radius.trim(),
        isActive: this.form.office.isActive,
        shifts: shiftsData,
        customFields: customFieldsData
      };

      let result;
      if (this.isEditMode && this.editingId) {
        result = await this.attendanceService.updateOffice({
          _id: this.editingId,
          ...payload
        });
      } else {
        result = await this.attendanceService.addOffice({
          ...payload,
          businessCardId: this.storage.get(common.BUSINESS_CARD)
        });
      }

      if (result) {
        const message = this.isEditMode
          ? 'Office updated successfully!'
          : 'Office created successfully!';
        swalHelper.showToast(message, 'success');
        this.modal.close('officeFormModal');
        this.onReset();
        this.getOffices();
      }
    } catch (error) {
      swalHelper.showToast('Failed to save office', 'error');
    } finally {
      this.isSaving = false;
    }
  };

  validateForm(): boolean {
    // Basic validation
    if (!this.form.office.name.trim()) {
      swalHelper.showToast('Office name is required', 'error');
      return false;
    }
    
    if (!this.form.office.address.trim()) {
      swalHelper.showToast('Office address is required', 'error');
      return false;
    }
    
    // Validate shifts
    for (const shift of this.form.office.shifts) {
      if (!shift.startFrom || !shift.startTo || !shift.endFrom || !shift.endTo) {
        swalHelper.showToast('All shift times are required', 'error');
        return false;
      }
    }
    
    // Validate custom fields
    for (const field of this.form.office.customFields) {
      if (!field.label.trim()) {
        swalHelper.showToast('All custom fields must have a label', 'error');
        return false;
      }
      
      if (field.type === 'select' && (!field.optionsText || !field.options.length)) {
        swalHelper.showToast('Select fields must have options', 'error');
        return false;
      }
    }
    
    return true;
  }

  onReset = () => {
    this.form = {
      office: {
        name: '',
        address: '',
        lat: '',
        long: '',
        radius: '',
        isActive: true,
        shifts: [
          {
            startFrom: '10:00',
            startTo: '10:30',
            endFrom: '19:00',
            endTo: '19:30'
          }
        ],
        customFields: []
      },
    };
    this.isEditMode = false;
    this.editingId = null;
  };

  onEditOffice = async (office: any) => {
    this.isEditMode = true;
    this.editingId = office._id;
    
    // Load custom fields for this office
    const customFields = await this.loadCustomFields(office._id);
    
    this.form.office = {
      name: office.name,
      address: office.address,
      lat: office.lat,
      long: office.long,
      radius: office.radius,
      isActive: office.isActive,
      shifts: office.shifts?.map((shift: any) => ({
        shiftId: shift.shiftId,
        startFrom: this.convertTimeToInput(shift.startFrom),
        startTo: this.convertTimeToInput(shift.startTo),
        endFrom: this.convertTimeToInput(shift.endFrom),
        endTo: this.convertTimeToInput(shift.endTo)
      })) || [{
        startFrom: '10:00',
        startTo: '10:30',
        endFrom: '19:00',
        endTo: '19:30'
      }],
      customFields: customFields.map((field: any) => ({
        _id: field._id,
        label: field.label,
        type: field.type,
        options: field.options || [],
        optionsText: field.options ? field.options.join(', ') : ''
      }))
    };
    
    this.modal.open('officeFormModal');
  };

  loadCustomFields = async (officeId: string) => {
    try {
      const result = await this.attendanceService.getCustomFields({officeId});
      return result && result ? result : [];
    } catch (error) {
      console.error('Error loading custom fields:', error);
      return [];
    }
  };

  onDeleteOffice = async (officeId: string) => {
    const confirmed = await swalHelper.confirmation(
      'Are you sure?',
      'You won\'t be able to revert this.',
      'warning'
    );
    if (!confirmed.isConfirmed) return;

    try {
      const result = await this.attendanceService.deleteOffice({ _id: officeId });
      if (result) {
        swalHelper.showToast('Office deleted successfully!', 'success');
        this.getOffices();
      }
    } catch (error) {
      swalHelper.showToast('Failed to delete office', 'error');
    }
  };

  onViewEmployees = async (office: any) => {
    this.selectedOffice = office;
    await this.getEmployees(office._id);
    this.modal.open('employeesModal');
  };

  getEmployees = async (officeId: string) => {
    this.isLoading = true;
    try {
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
    } catch (error) {
      this.isLoading = false;
      swalHelper.showToast('Failed to load employees', 'error');
    }
  };

  // Utility Methods
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
  };

  getShiftInfo(shiftId: string): string {
    if (!this.selectedOffice || !this.selectedOffice.shifts) return 'No Shift';
    
    const shift = this.selectedOffice.shifts.find((s: any) => s.shiftId === shiftId);
    if (!shift) return 'No Shift';
    
    return `${this.formatTime(shift.startFrom)} - ${this.formatTime(shift.endFrom)}`;
  }
}