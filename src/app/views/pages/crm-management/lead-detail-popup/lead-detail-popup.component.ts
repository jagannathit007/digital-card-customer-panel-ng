import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  signal,
  Input,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';
import { CrmService } from 'src/app/services/crm.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from 'src/env/env.local';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
import { CrmTeamMemberDropdownComponent } from '../../../partials/crm/crm-team-member-dropdown/crm-team-member-dropdown.component';
import { LeadEventService } from 'src/app/services/LeadEvent.service';

interface LeadMember {
  _id: string;
  name: string;
  emailId: string;
  profileImage: string;
  role: string;
}

interface LeadAttachment {
  _id: string;
  files: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadedFrom: 'storage' | 'url';
    _id: string;
  }>;
  uploadedBy: LeadMember;
  leadId: string;
  createdAt: string;
  updatedAt: string;
}

interface category {
  _id: string;
  name: string;
  isDeleted: boolean;
}

interface Lead {
  _id: string;
  title: string;
  description: string;
  status: string;
  column: string;
  position: number;
  assignedTo: LeadMember[];
  attachments: LeadAttachment[];
  category: any;
  priority: 'cold' | 'warm' | 'hot';
  closingDate: string | null;
  contactDetails: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  amount: string;
  quotationDate?: string | null;
  product: Array<{
    name: string;
    price: string;
    quantity: string;
  }>;
  createdBy: LeadMember;
  createdAt: string;
  updatedAt: string;
  wonAt: string | null;
  lostAt: string | null;
}

interface LeadUpdate {
  field: string;
  value: any;
  leadId: string;
}

@Component({
  selector: 'app-lead-detail-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxEditorModule,
    CrmTeamMemberDropdownComponent,
  ],
  templateUrl: './lead-detail-popup.component.html',
  styleUrl: './lead-detail-popup.component.scss',
})
export class LeadDetailPopupComponent implements OnInit, OnDestroy {
  @Output() leadUpdated = new EventEmitter<LeadUpdate>();
  @Output() leadDeleted = new EventEmitter<string>();
  @ViewChild('addMembersDropdown')
  addMembersDropdown!: CrmTeamMemberDropdownComponent;

  @ViewChild('fileInput')
  fileInput!: ElementRef;

  // Route and navigation
  leadId: string = '';
  private routeSubscription?: Subscription;
  private querySubscription?: Subscription;

  showCustomDatePicker = false;
  currentCalendarDate = new Date();
  dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  calendarDays: any[] = [];

  // Lead data
  lead: Lead = {
    _id: '',
    title: '',
    description: '',
    status: '',
    column: '',
    position: 0,
    assignedTo: [],
    attachments: [],
    category: null,
    priority: 'warm',
    closingDate: null,
    contactDetails: {
      name: '',
      phone: '',
      email: '',
      address: '',
    },
    amount: '',
    product: [],
    createdBy: {
      _id: '',
      name: '',
      emailId: '',
      profileImage: '',
      role: '',
    },
    createdAt: '',
    updatedAt: '',
    wonAt: null,
    lostAt: null,
  };

  // UI State
  currentTab: 'description' | 'attachments' = 'description';
  isEditingTitle = false;
  isEditingDescription = false;
  isEditingContactDetails = false;
  isEditingAmount = false;
  isEditingProduct = false;
  editTitle = '';
  editContactDetails = {
    name: '',
    phone: '',
    email: '',
    address: '',
  };
  editAmount = '';
  editProduct: Array<{
    name: string;
    price: string;
    quantity: string;
  }> = [];
  isSavingTitle = false;
  isSavingDescription = false;
  isSavingContactDetails = false;
  isSavingAmount = false;
  isSavingProduct = false;
  isLoading = true;
  isUploading = false;

  // Available options
  availableMembers: LeadMember[] = [];
  availableCategories: any[] = [];
  availableColumns: any[] = [];
  priorityOptions = [
    { value: 'cold', label: 'Cold' },
    { value: 'warm', label: 'Warm' },
    { value: 'hot', label: 'Hot' },
  ];

  // Editor configuration
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'underline'],
    ['ordered_list', 'bullet_list'],
    ['link'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right'],
    ['undo', 'redo'],
  ];

  // Backup for undo functionality
  private backupData: any = {};
  public imageBaseUrl = environment.imageURL;

  showQuotationDatePicker = false;
  currentQuotationCalendarDate: Date = new Date();
  selectedQuotationDate: Date | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private crmService: CrmService,
    private sanitizer: DomSanitizer,
    private storage: AppStorage,
    private leadEventService: LeadEventService
  ) {}

  ngOnInit() {
    this.editor = new Editor();

    this.routeSubscription = this.route.params.subscribe((params) => {
      this.leadId = params['leadId'];
      if (this.leadId) {
        this.loadLeadDetails();
        this.loadAvailableOptions();
      }
    });

    // Add click outside handler for date picker
    this.addDatePickerClickListener();
  }

  private addDatePickerClickListener(): void {
    setTimeout(() => {
      const handleClick = (event: Event) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.tw-relative')) {
          this.showCustomDatePicker = false;
          document.removeEventListener('click', handleClick);
        }
      };
      document.addEventListener('click', handleClick);
    }, 0);
  }

  toggleQuotationDatePicker(): void {
    this.showQuotationDatePicker = !this.showQuotationDatePicker;
    if (this.showQuotationDatePicker) {
      // Close other date picker if open
      this.showCustomDatePicker = false;
      this.currentQuotationCalendarDate = this.lead.quotationDate
        ? new Date(this.lead.quotationDate)
        : new Date();
    }
  }

  getQuotationCalendarDays(): Array<{ date: Date; isCurrentMonth: boolean }> {
    const year = this.currentQuotationCalendarDate.getFullYear();
    const month = this.currentQuotationCalendarDate.getMonth();

    // Get first day of the month and how many days to show from previous month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Generate 42 days (6 weeks) for the calendar
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      days.push({
        date: date,
        isCurrentMonth: date.getMonth() === month,
      });
    }

    return days;
  }

  getQuotationDateButtonClass(day: {
    date: Date;
    isCurrentMonth: boolean;
  }): string {
    const classes = [];

    if (!day.isCurrentMonth) {
      classes.push('tw-text-gray-300 tw-cursor-not-allowed');
    } else {
      classes.push('tw-text-gray-700 hover:tw-bg-green-100 tw-cursor-pointer');
    }

    // Check if this is the selected quotation date
    if (
      this.lead.quotationDate &&
      this.isSameDate(day.date, new Date(this.lead.quotationDate))
    ) {
      classes.push('tw-bg-green-500 tw-text-white hover:tw-bg-green-600');
    }

    // Check if this is today
    if (this.isSameDate(day.date, new Date())) {
      if (
        !this.lead.quotationDate ||
        !this.isSameDate(day.date, new Date(this.lead.quotationDate))
      ) {
        classes.push(
          'tw-bg-orange-100 tw-text-orange-700 hover:tw-bg-orange-200'
        );
      }
    }

    return classes.join(' ');
  }

  selectQuotationDate(date: Date): void {
    this.selectedQuotationDate = date;
    this.updateQuotationDate(date);
  }

  setQuotationDate(): void {
    this.updateQuotationDate(new Date());
  }

  async updateQuotationDate(date: Date | null): Promise<void> {
    await this.crmService.updateLeadQuotationDate({
      leadId: this.leadId,
      quotationDate: date ? date.toISOString() : null,
    });

    this.lead.quotationDate = date ? date.toISOString() : null;
    this.showQuotationDatePicker = false;
  }

  // Helper method to check if two dates are the same day
  private isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  ngOnDestroy() {
    this.editor.destroy();
    this.routeSubscription?.unsubscribe();
    this.querySubscription?.unsubscribe();
  }

  async loadLeadDetails() {
    try {
      this.isLoading = true;
      const response = await this.crmService.getLeadById({
        leadId: this.leadId,
      });

      if (response) {
        // Ensure all required properties exist with defaults
        this.lead = {
          _id: response._id || '',
          title: response.title || '',
          description: response.description || '',
          status: response.status || '',
          column: response.column || '',
          position: response.position || 0,
          assignedTo: response.assignedTo || [],
          attachments: response.attachments || [],
          category: response.category || '',
          priority: response.priority || 'warm',
          closingDate: response.closingDate || null,
          quotationDate: response.quotationDate || null,
          contactDetails: {
            name: response.contactDetails?.name || '',
            phone: response.contactDetails?.phone || '',
            email: response.contactDetails?.email || '',
            address: response.contactDetails?.address || '',
          },
          amount: response.amount || '',
          product: response.product || [],
          createdBy: response.createdBy || {
            _id: '',
            name: '',
            emailId: '',
            profileImage: '',
            role: '',
          },
          createdAt: response.createdAt || '',
          updatedAt: response.updatedAt || '',
          wonAt: response.wonAt || null,
          lostAt: response.lostAt || null,
        };

        this.createBackup();

        // Initialize editor with current description
        if (this.lead.description) {
          this.editor.commands.focus();
        }
      } else {
        console.error('No response data received');
        swalHelper.showToast('No lead data received', 'warning');
      }
    } catch (error) {
      console.error('Error loading lead details:', error);
      swalHelper.showToast('Error loading lead details', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async loadAvailableOptions() {
    try {
      // Load available team members using CRM API
      const membersResponse = await this.crmService.getSelectableTeamMembers(
        {}
      );

      if (membersResponse && Array.isArray(membersResponse.members)) {
        this.availableMembers = membersResponse.members;
      }

      // Load CRM details for categories and columns
      const crmResponse = await this.crmService.getCrmDetails({});

      if (crmResponse) {
        this.availableCategories = crmResponse.categories || [];
        this.availableColumns = crmResponse.columns || [];
      }
    } catch (error) {
      console.error('Error loading available options:', error);
    }
  }

  // Title editing methods
  startEditingTitle(): void {
    this.isEditingTitle = true;
    this.editTitle = this.lead.title;
    this.createBackup('title');
  }

  async saveTitle(): Promise<void> {
    if (!this.editTitle.trim()) return;

    this.isSavingTitle = true;
    try {
      const response = await this.crmService.updateLeadTitle({
        leadId: this.leadId,
        title: this.editTitle.trim(),
      });

      if (response) {
        this.lead.title = this.editTitle.trim();
        this.isEditingTitle = false;
        this.emitLeadUpdate('title', this.lead.title);
        swalHelper.showToast('Title updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating title:', error);
      swalHelper.showToast('Error updating title', 'error');
      this.undoChanges('title');
    } finally {
      this.isSavingTitle = false;
    }
  }

  cancelTitleEdit(): void {
    this.isEditingTitle = false;
    this.undoChanges('title');
  }

  onTitleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.saveTitle();
    } else if (event.key === 'Escape') {
      this.cancelTitleEdit();
    }
  }

  // Description editing methods
  startEditingDescription(): void {
    this.isEditingDescription = true;
    this.createBackup('description');
  }

  async saveDescription(): Promise<void> {
    this.isSavingDescription = true;
    try {
      const response = await this.crmService.updateLeadDescription({
        leadId: this.leadId,
        description: this.lead.description,
      });

      if (response) {
        this.isEditingDescription = false;
        this.emitLeadUpdate('description', this.lead.description);
        swalHelper.showToast('Description updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating description:', error);
      swalHelper.showToast('Error updating description', 'error');
      this.undoChanges('description');
    } finally {
      this.isSavingDescription = false;
    }
  }

  cancelDescriptionEdit(): void {
    this.isEditingDescription = false;
    this.undoChanges('description');
  }

  // Contact details editing methods
  startEditingContactDetails(): void {
    this.isEditingContactDetails = true;
    this.editContactDetails = { ...this.lead.contactDetails };
    this.createBackup('contactDetails');
  }

  async saveContactDetails(): Promise<void> {
    this.isSavingContactDetails = true;
    try {
      const response = await this.crmService.updateLeadContactDetails({
        leadId: this.leadId,
        contactDetails: this.editContactDetails,
      });

      if (response) {
        this.lead.contactDetails = { ...this.editContactDetails };
        this.isEditingContactDetails = false;
        this.emitLeadUpdate('contactDetails', this.lead.contactDetails);
        swalHelper.showToast('Contact details updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating contact details:', error);
      swalHelper.showToast('Error updating contact details', 'error');
      this.undoChanges('contactDetails');
    } finally {
      this.isSavingContactDetails = false;
    }
  }

  cancelContactDetailsEdit(): void {
    this.isEditingContactDetails = false;
    this.undoChanges('contactDetails');
  }

  // Amount editing methods
  startEditingAmount(): void {
    this.isEditingAmount = true;
    this.editAmount = this.lead.amount;
    this.createBackup('amount');
  }

  async saveAmount(): Promise<void> {
    this.isSavingAmount = true;
    try {
      const response = await this.crmService.updateLeadAmount({
        leadId: this.leadId,
        amount: this.editAmount,
      });

      if (response) {
        this.lead.amount = this.editAmount;
        this.isEditingAmount = false;
        this.emitLeadUpdate('amount', this.lead.amount);
        swalHelper.showToast('Amount updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating amount:', error);
      swalHelper.showToast('Error updating amount', 'error');
      this.undoChanges('amount');
    } finally {
      this.isSavingAmount = false;
    }
  }

  cancelAmountEdit(): void {
    this.isEditingAmount = false;
    this.undoChanges('amount');
  }

  // Product editing methods
  startEditingProduct(): void {
    this.isEditingProduct = true;
    this.editProduct = JSON.parse(JSON.stringify(this.lead.product));
    this.createBackup('product');
  }

  async saveProduct(): Promise<void> {
    this.isSavingProduct = true;
    try {
      const response = await this.crmService.updateLeadProduct({
        leadId: this.leadId,
        product: this.editProduct,
      });

      if (response) {
        this.lead.product = JSON.parse(JSON.stringify(this.editProduct));
        this.isEditingProduct = false;
        this.emitLeadUpdate('product', this.lead.product);
        swalHelper.showToast('Product details updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating product details:', error);
      swalHelper.showToast('Error updating product details', 'error');
      this.undoChanges('product');
    } finally {
      this.isSavingProduct = false;
    }
  }

  cancelProductEdit(): void {
    this.isEditingProduct = false;
    this.undoChanges('product');
  }

  addProductItem(): void {
    this.editProduct.push({
      name: '',
      price: '',
      quantity: '',
    });
  }

  removeProductItem(index: number): void {
    this.editProduct.splice(index, 1);
  }

  // Priority update method
  async updatePriority(priority: string): Promise<void> {
    try {
      const response = await this.crmService.updateLeadPriority({
        leadId: this.leadId,
        priority: priority,
      });

      if (response) {
        this.lead.priority = priority as 'cold' | 'warm' | 'hot';
        this.emitLeadUpdate('priority', this.lead.priority);
        swalHelper.showToast('Priority updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      swalHelper.showToast('Error updating priority', 'error');
    }
  }

  // Category update method
  async updateCategory(categoryId: any): Promise<void> {
    try {
      const response = await this.crmService.updateLeadCategory({
        leadId: this.leadId,
        category: categoryId,
      });

      if (response) {
        this.lead.category =
          this.availableCategories.find((cat) => cat._id === categoryId)?._id ||
          '';
        this.emitLeadUpdate('category', this.lead.category);
        swalHelper.showToast('Category updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      swalHelper.showToast('Error updating category', 'error');
    }
  }

  // Calendar methods
  getCalendarDays(): any[] {
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: this.isToday(currentDate),
        isSelected: this.isSelectedDate(currentDate),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }

  getDateButtonClass(day: any): string {
    let classes =
      'tw-w-8 tw-h-8 tw-text-sm tw-rounded tw-flex tw-items-center tw-justify-center tw-transition-colors tw-duration-150';

    if (!day.isCurrentMonth) {
      classes += ' tw-text-gray-300 tw-cursor-not-allowed';
    } else if (day.isToday) {
      classes += ' tw-bg-blue-500 tw-text-white hover:tw-bg-blue-600';
    } else if (day.isSelected) {
      classes += ' tw-bg-blue-100 tw-text-blue-700 hover:tw-bg-blue-200';
    } else {
      classes += ' tw-text-gray-700 hover:tw-bg-gray-100';
    }

    return classes;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  isSelectedDate(date: Date): boolean {
    if (!this.lead.closingDate) return false;
    const closingDate = new Date(this.lead.closingDate);
    return (
      date.getDate() === closingDate.getDate() &&
      date.getMonth() === closingDate.getMonth() &&
      date.getFullYear() === closingDate.getFullYear()
    );
  }

  // Closing date methods
  setClosingDate(): void {
    this.updateClosingDate(new Date().toISOString());
  }

  toggleDatePicker(): void {
    this.showCustomDatePicker = !this.showCustomDatePicker;
  }

  selectDate(date: Date): void {
    this.updateClosingDate(date.toISOString());
    this.showCustomDatePicker = false;
  }

  async updateClosingDate(date: string | null): Promise<void> {
    try {
      const response = await this.crmService.updateLeadClosingDate({
        leadId: this.leadId,
        closingDate: date,
      });

      if (response) {
        this.lead.closingDate = date;
        this.emitLeadUpdate('closingDate', this.lead.closingDate);
        swalHelper.showToast('Closing date updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating closing date:', error);
      swalHelper.showToast('Error updating closing date', 'error');
    }
  }

  // Assignment update method
  async updateAssignment(memberIds: string[]): Promise<void> {
    try {
      const response = await this.crmService.updateLeadAssignment({
        leadId: this.leadId,
        assignedTo: memberIds,
      });

      if (response) {
        this.lead.assignedTo = this.availableMembers.filter((member) =>
          memberIds.includes(member._id)
        );
        this.emitLeadUpdate('assignedTo', this.lead.assignedTo);
        swalHelper.showToast('Assignment updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      swalHelper.showToast('Error updating assignment', 'error');
    }
  }

  // Handle member updates from dropdown
  onMembersUpdated(members: any[]): void {
    const memberIds = members.map((member) => member._id);
    this.updateAssignment(memberIds);
  }

  // Tab methods
  setTab(tab: string): void {
    this.currentTab = tab as 'description' | 'attachments';
  }

  // Utility methods
  closePopup(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Close quotation date picker if clicking outside
    if (
      this.showQuotationDatePicker &&
      !target.closest('.quotation-date-picker-container')
    ) {
      this.showQuotationDatePicker = false;
    }

    // Close regular date picker if clicking outside
    if (
      this.showCustomDatePicker &&
      !target.closest('.date-picker-container')
    ) {
      this.showCustomDatePicker = false;
    }
  }

  // Backup and undo functionality
  createBackup(field?: string): void {
    if (field) {
      this.backupData[field] = JSON.parse(
        JSON.stringify(this.lead[field as keyof Lead])
      );
    } else {
      this.backupData = JSON.parse(JSON.stringify(this.lead));
    }
  }

  undoChanges(field: string): void {
    if (this.backupData[field]) {
      (this.lead as any)[field] = JSON.parse(
        JSON.stringify(this.backupData[field])
      );
    }
  }

  // Event emitters
  emitLeadUpdate(field: string, value: any): void {
    const leadUpdate = {
      field,
      value,
      leadId: this.leadId,
    };
    
    // Emit to parent component
    this.leadUpdated.emit(leadUpdate);
    
    // Emit through service for other components
    this.leadEventService.emitLeadUpdate(leadUpdate);
  }

  // TrackBy functions
  trackByProductId(index: number, item: any): number {
    return index;
  }

  trackByMemberId(index: number, member: LeadMember): string {
    return member._id;
  }

  // Attachment methods
  async onFileUpload(event: any): Promise<void> {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Check each file size
      for (let file of files) {
        if (file.size > 10 * 1024 * 1024) { // 10MB in bytes
          await swalHelper.showToast(
            'File size exceeded the 10MB limit',
            'error'
          );
          event.target.value = ''; // Clear the file input
          return;
        }
      }

      this.isUploading = true;
      
      try {
        var formData = new FormData();

        for (let file of files) {
          formData.append('files', file);
        }
        formData.append('leadId', this.leadId);
        formData.append('type', 'lead');

        const response = await this.crmService.addAttachment(formData);

        if (response) {
          this.lead.attachments.push(response);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        await swalHelper.showToast(
          'Error uploading file. Please try again.',
          'error'
        );
      } finally {
        this.isUploading = false;
        event.target.value = ''; // Clear the file input
      }
    }
  }

  async deleteAttachment(fileId: string, attachmentId: string): Promise<void> {
    let confirm = await swalHelper.confirmation(
      'Are you sure?',
      'This action will permanently delete the file.',
      'question'
    );

    if (confirm.isConfirmed) {
      const response = await this.crmService.deleteAttachment({
        leadId: this.leadId,
        fileId: fileId,
        attachmentId: attachmentId,
      });

      if (response) {
        const attachmentIndex = this.lead.attachments.findIndex(
          (attachment) => attachment._id === attachmentId
        );

        if (attachmentIndex !== -1) {
          const attachment = this.lead.attachments[attachmentIndex];

          // Check if attachment has multiple files
          if (attachment.files.length > 1) {
            // Remove only the specific file from the attachment
            attachment.files = attachment.files.filter(
              (file) => file._id !== fileId
            );
          } else {
            // Remove the entire attachment if it has only one file
            this.lead.attachments.splice(attachmentIndex, 1);
          }
        }
      }
    }
  }

  // Get file icon based on file type
  getFileIcon(fileType: string): string {
    if (fileType.includes('image')) {
      return 'fa-image';
    } else if (fileType.includes('pdf')) {
      return 'fa-file-pdf';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return 'fa-file-word';
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return 'fa-file-excel';
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return 'fa-file-powerpoint';
    } else if (fileType.includes('zip') || fileType.includes('archive')) {
      return 'fa-file-archive';
    } else if (fileType.includes('text')) {
      return 'fa-file-alt';
    } else {
      return 'fa-file';
    }
  }

  // TrackBy function for attachments
  trackByAttachmentId(index: number, attachment: LeadAttachment): string {
    return attachment._id;
  }
}
