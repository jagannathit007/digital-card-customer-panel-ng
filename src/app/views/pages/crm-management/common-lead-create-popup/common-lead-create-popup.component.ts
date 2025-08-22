import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';
import { CrmTeamMemberDropdownComponent } from '../../../partials/crm/crm-team-member-dropdown/crm-team-member-dropdown.component';
import { CrmService } from 'src/app/services/crm.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { teamMemberCommon } from 'src/app/core/utilities/app-storage';
import { PrioritySelectionDropdownComponent } from '../priority-selection-dropdown/priority-selection-dropdown.component';

interface LeadMember {
  _id: string;
  name: string;
  emailId: string;
  profileImage: string;
  role: string;
}

interface CreateLeadData {
  title: string;
  description: string;
  // status: string;
  column: string;
  closingDate: string | null;
  assignedTo: LeadMember[];
  category: string | null;
  priority: 'cold' | 'warm' | 'hot';
  contactDetails: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  amount: string;
  product: Array<{
    name: string;
    price: string;
    quantity: string;
  }>;
}

interface Column {
  _id: string;
  title: string;
  position: number;
  canEdit: boolean;
  canDelete: boolean;
}

@Component({
  selector: 'app-common-lead-create-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxEditorModule,
    CrmTeamMemberDropdownComponent,
    PrioritySelectionDropdownComponent
  ],
  templateUrl: './common-lead-create-popup.component.html',
  styleUrl: './common-lead-create-popup.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CommonLeadCreatePopupComponent implements OnInit, OnDestroy {
  @Input() isVisible: boolean = false;
  @Input() createLeadData: any = null;

  @Output() leadCreated = new EventEmitter<CreateLeadData>();
  @Output() popupClosed = new EventEmitter<void>();

  // Lead creation form data
  leadData: CreateLeadData = {
    title: '',
    description: '',
    // status: 'normal',
    column: '',
    closingDate: null,
    assignedTo: [],
    category: '',
    priority: 'warm',
    contactDetails: {
      name: '',
      phone: '',
      email: '',
      address: '',
    },
    amount: '',
    product: [],
  };

  // UI State
  isCreating = false;
  showCustomDatePicker = false;
  currentCalendarDate = new Date();
  dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  calendarDays: any[] = [];
  isFetching = true;
  columnOptions: Column[] = [];
  categories: any[] = [];
  availableMembers: any[] = [];
  availableCategories: any[] = [];

  // Description editor
  editor?: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['bullet_list', 'ordered_list'],
    ['link'],
  ];

  constructor(private crmService: CrmService, private storage: AppStorage) {}

  ngOnInit() {
    this.initializeEditor();
    this.loadData();
    
    if (this.createLeadData) {
      this.populateFormWithData();
    }
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['createLeadData'] && changes['createLeadData'].currentValue) {
      this.populateFormWithData();
    }
  }

  private initializeEditor() {
    this.editor = new Editor({
      content: '',
      plugins: [],
    });
  }

  private async loadData() {
    this.isFetching = true;

    try {
      // Load CRM columns
      const columns = await this.crmService.getCrmColumns({});
      if (columns) {
        this.columnOptions = columns;
        // Set default column to first editable column
        const firstEditableColumn = columns.find((col: Column) => col.canEdit);
        if (firstEditableColumn) {
          this.leadData.column = firstEditableColumn._id;
        }
      }

      // Load CRM details for categories
      const crmDetails = await this.crmService.getCrmDetails({});
      if (crmDetails) {
        this.categories = crmDetails.categories || [];
      }

      // Load available team members
      const members = await this.crmService.getSelectableTeamMembers({});
      if (members) {
        this.availableMembers = members;
      }

      const categories = await this.crmService.getCrmCategories({});
      console.log('Available categories:', categories);
      if (categories) {
        this.availableCategories = categories;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isFetching = false;
    }
  }

  private populateFormWithData() {
    if (this.createLeadData) {
      this.leadData = {
        ...this.leadData,
        ...this.createLeadData,
      };

      // Editor content is handled by ngModel
    }
  }

  // Form validation
  isFormValid(): boolean {
    // return (
    //   this.leadData.title.trim() !== '' &&
    //   this.leadData.column !== '' &&
    //   this.leadData.assignedTo.length > 0
    // );

    return (
      this.leadData.title.trim() !== '' &&
      this.leadData.column !== '' 
    );
  }

  // Member selection
  onMembersSelected(members: LeadMember[]) {
    this.leadData.assignedTo = members;
  }

  updateCategory(categoryId: string | null) {
    this.leadData.category = categoryId;
  }

  // Member updated from dropdown
  onMembersUpdated(members: any[]) {
    this.leadData.assignedTo = members;
  }

  // Category selection
  onCategorySelected(categoryId: string | null) {
    this.leadData.category = categoryId;
  }

  // Priority selection
  onPrioritySelected(priority: 'cold' | 'warm' | 'hot') {
    this.leadData.priority = priority;
  }

  // Date picker methods
  toggleDatePicker() {
    this.showCustomDatePicker = !this.showCustomDatePicker;
    if (this.showCustomDatePicker) {
      this.generateCalendarDays();
    }
  }

  private generateCalendarDays() {
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    this.calendarDays = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      this.calendarDays.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: this.isToday(currentDate),
        isSelected: this.isSelectedDate(currentDate),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  private isSelectedDate(date: Date): boolean {
    if (!this.leadData.closingDate) return false;
    const selectedDate = new Date(this.leadData.closingDate);
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  }

  selectDate(date: Date) {
    this.leadData.closingDate = date.toISOString().split('T')[0];
    this.showCustomDatePicker = false;
  }

  previousMonth() {
    this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
    this.generateCalendarDays();
  }

  nextMonth() {
    this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
    this.generateCalendarDays();
  }

  // Product management
  addProduct() {
    this.leadData.product.push({
      name: '',
      price: '',
      quantity: '',
    });
  }

  removeProduct(index: number) {
    this.leadData.product.splice(index, 1);
    this.calculateTotalAmount();
  }

  // Auto-calculate total amount from products
  calculateTotalAmount(): void {
    let total = 0;
    
    this.leadData.product.forEach(product => {
      const price = parseFloat(product.price) || 0;
      const quantity = parseFloat(product.quantity) || 0;
      total += price * quantity;
    });
    
    // Only auto-update if the current amount is empty or matches the previous calculated total
    // This allows users to manually override the amount
    // if (!this.leadData.amount || this.leadData.amount === this.lastCalculatedAmount?.toString()) {
      this.leadData.amount = total.toString();
    // }
    
    this.lastCalculatedAmount = total;
  }

  // Track last calculated amount to prevent auto-override of manual changes
  private lastCalculatedAmount: number = 0;

  // Form submission
  async onSubmit() {
    if (!this.isFormValid()) {
      return;
    }

    this.isCreating = true;

    try {
      // Description is already bound via ngModel

      const assigneMemberIdsArray = this.leadData.assignedTo.map((member: LeadMember) => member._id);
      const response = await this.crmService.createCompleteLead({...this.leadData, assignedTo: assigneMemberIdsArray, category: this.leadData.category || null});

      if (response) {
        this.leadCreated.emit(response);
        this.resetForm();
      }
    } catch (error) {
      console.error('Error creating lead:', error);
    } finally {
      this.isCreating = false;
    }
  }

  // Form reset
  private resetForm() {
    this.leadData = {
      title: '',
      description: '',
      // status: 'normal',
      column: '',
      closingDate: null,
      assignedTo: [],
      category: '',
      priority: 'warm',
      contactDetails: {
        name: '',
        phone: '',
        email: '',
        address: '',
      },
      amount: '',
      product: [],
    };

    // Editor content is handled by ngModel

    // Reset to first editable column
    const firstEditableColumn = this.columnOptions.find((col: Column) => col.canEdit);
    if (firstEditableColumn) {
      this.leadData.column = firstEditableColumn._id;
    }
  }

  // Close popup
  closePopup() {
    this.popupClosed.emit();
  }

  // Get column title
  getColumnTitle(columnId: string): string {
    const column = this.columnOptions.find((col: Column) => col._id === columnId);
    return column ? column.title : '';
  }

  // Get category name
  getCategoryName(categoryId: string | null): string {
    if (!categoryId) return 'No Category';
    const category = this.categories.find((cat: any) => cat._id === categoryId);
    return category ? category.name : 'Unknown Category';
  }

  // Priority colors
  getPriorityColor(priority: 'cold' | 'warm' | 'hot'): string {
    const colors = {
      cold: 'tw-bg-blue-100 tw-text-blue-800',
      warm: 'tw-bg-yellow-100 tw-text-yellow-800',
      hot: 'tw-bg-red-100 tw-text-red-800',
    };
    return colors[priority] || colors.warm;
  }

  // Priority icons
  getPriorityIcon(priority: 'cold' | 'warm' | 'hot'): string {
    const icons = {
      cold: 'ri-snowy-line',
      warm: 'ri-sun-line',
      hot: 'ri-fire-line',
    };
    return icons[priority] || icons.warm;
  }

  formatDate(dateString: string | null): string {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

clearClosingDate() {
  this.leadData.closingDate = null;
  this.showCustomDatePicker = false;
}

// Set today as closing date
setTodayAsClosingDate() {
  this.selectDate(new Date());
}
}
