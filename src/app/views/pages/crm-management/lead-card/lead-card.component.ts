import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmService } from 'src/app/services/crm.service';
import { CrmPermissionsService } from 'src/app/services/crm-permissions.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { teamMemberCommon } from 'src/app/core/utilities/app-storage';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { Subject, takeUntil } from 'rxjs';

export interface TeamMember {
  _id: string;
  name: string;
  emailId: string;
  role: string;
  profileImage: string;
  isDeleted: boolean;
}

export interface Category {
  _id: string;
  name: string;
  isDeleted: boolean;
}

export interface Lead {
  _id: string;
  title: string;
  description?: string;
  status: string;
  category: string | null;
  priority: 'cold' | 'warm' | 'hot';
  assignedTo: TeamMember[];
  attachments: number;
  position: number;
  closingDate?: Date | null;
  column: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  wonAt?: Date | null;
  lostAt?: Date | null;
  assignedToMe: boolean;
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

@Component({
  selector: 'app-lead-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lead-card.component.html',
  styleUrl: './lead-card.component.scss',
})
export class LeadCardComponent implements OnInit, OnDestroy {
  @Input() lead!: Lead;
  @Input() isSelected: boolean = false;
  @Input() isDragging: boolean = false;
  @Input() assignedToMe: boolean = false;
  @Input() crmId: string = '';
  @Input() wonColumnId: string = '';
  @Input() lostColumnId: string = '';
  @Input() categories: Category[] = [];

  @Output() leadClick = new EventEmitter<Lead>();
  @Output() leadDoubleClick = new EventEmitter<Lead>();
  @Output() leadWin = new EventEmitter<Lead>();
  @Output() leadLose = new EventEmitter<Lead>();
  @Output() leadOpen = new EventEmitter<Lead>();
  @Output() dragStarted = new EventEmitter<Lead>();
  @Output() dragEnded = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  // UI State
  isEditingTitle = signal<boolean>(false);
  isEditingDescription = signal<boolean>(false);
  isEditingCategory = signal<boolean>(false);
  isEditingPriority = signal<boolean>(false);
  isEditingClosingDate = signal<boolean>(false);
  isEditingContactDetails = signal<boolean>(false);
  isEditingAmount = signal<boolean>(false);
  isEditingProduct = signal<boolean>(false);

  // Form values
  editedTitle = signal<string>('');
  editedDescription = signal<string>('');
  editedCategory = signal<string | null>(null);
  editedPriority = signal<'cold' | 'warm' | 'hot'>('warm');
  editedClosingDate = signal<string>('');
  editedContactDetails = signal<{
    name: string;
    phone: string;
    email: string;
    address: string;
  }>({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  editedAmount = signal<string>('');
  editedProduct = signal<Array<{
    name: string;
    price: string;
    quantity: string;
  }>>([]);

  // Priority colors
  priorityColors = {
    cold: 'tw-bg-blue-100 tw-text-blue-800',
    warm: 'tw-bg-yellow-100 tw-text-yellow-800',
    hot: 'tw-bg-red-100 tw-text-red-800',
  };

  baseURL = environment.baseURL;
  imageBaseUrl = environment.imageURL;


  constructor(
    private crmService: CrmService,
    public crmPermissionsService: CrmPermissionsService,
    private storage: AppStorage,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initializeFormValues();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFormValues() {
    this.editedTitle.set(this.lead.title || '');
    this.editedDescription.set(this.lead.description || '');
    this.editedCategory.set(this.lead.category);
    this.editedPriority.set(this.lead.priority);
    this.editedClosingDate.set(
      this.lead.closingDate
        ? new Date(this.lead.closingDate).toISOString().split('T')[0]
        : ''
    );
    this.editedContactDetails.set({
      name: this.lead.contactDetails?.name || '',
      phone: this.lead.contactDetails?.phone || '',
      email: this.lead.contactDetails?.email || '',
      address: this.lead.contactDetails?.address || '',
    });
    this.editedAmount.set(this.lead.amount || '');
    this.editedProduct.set(this.lead.product || []);
  }

  // Event handlers
  onLeadClick() {
    this.leadClick.emit(this.lead);
  }

  onLeadDoubleClick(event: Event) {
    event.stopPropagation();
    this.leadDoubleClick.emit(this.lead);
  }

  onDragStarted(event: any) {
    this.dragStarted.emit(this.lead);
  }

  onDragEnded(event: any) {
    this.dragEnded.emit();
  }

  // Action handlers
  onWinLead(event: Event) {
    event.stopPropagation();
    this.leadWin.emit(this.lead);
  }

  onLoseLead(event: Event) {
    event.stopPropagation();
    this.leadLose.emit(this.lead);
  }

  onOpenLead(event: Event) {
    event.stopPropagation();
    this.leadOpen.emit(this.lead);
  }

  // Edit handlers
  startEditTitle() {
    this.isEditingTitle.set(true);
    setTimeout(() => {
      const input = document.querySelector(
        `input[data-lead-title="${this.lead._id}"]`
      ) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
  }

  async saveTitle() {
    if (this.editedTitle().trim() === '') return;

    const success = await this.crmService.updateLeadTitle({
      leadId: this.lead._id,
      title: this.editedTitle().trim(),
    });

    if (success) {
      this.lead.title = this.editedTitle().trim();
      this.isEditingTitle.set(false);
    } else {
      this.editedTitle.set(this.lead.title || '');
    }
  }

  cancelTitleEdit() {
    this.editedTitle.set(this.lead.title || '');
    this.isEditingTitle.set(false);
  }

  startEditDescription() {
    this.isEditingDescription.set(true);
  }

  async saveDescription() {
    const success = await this.crmService.updateLeadDescription({
      leadId: this.lead._id,
      description: this.editedDescription(),
    });

    if (success) {
      this.lead.description = this.editedDescription();
      this.isEditingDescription.set(false);
    }
  }

  cancelDescriptionEdit() {
    this.editedDescription.set(this.lead.description || '');
    this.isEditingDescription.set(false);
  }

  startEditCategory() {
    this.isEditingCategory.set(true);
  }

  async saveCategory() {
    const success = await this.crmService.updateLeadCategory({
      leadId: this.lead._id,
      category: this.editedCategory(),
    });

    if (success) {
      this.lead.category = this.editedCategory();
      this.isEditingCategory.set(false);
    }
  }

  cancelCategoryEdit() {
    this.editedCategory.set(this.lead.category);
    this.isEditingCategory.set(false);
  }

  startEditPriority() {
    this.isEditingPriority.set(true);
  }

  async savePriority() {
    const success = await this.crmService.updateLeadPriority({
      leadId: this.lead._id,
      priority: this.editedPriority(),
    });

    if (success) {
      this.lead.priority = this.editedPriority();
      this.isEditingPriority.set(false);
    }
  }

  cancelPriorityEdit() {
    this.editedPriority.set(this.lead.priority);
    this.isEditingPriority.set(false);
  }

  startEditClosingDate() {
    this.isEditingClosingDate.set(true);
  }

  async saveClosingDate() {
    const success = await this.crmService.updateLeadClosingDate({
      leadId: this.lead._id,
      closingDate: this.editedClosingDate() || null,
    });

    if (success) {
      this.lead.closingDate = this.editedClosingDate() || undefined
        ? new Date(this.editedClosingDate())
        : null;
      this.isEditingClosingDate.set(false);
    }
  }

  cancelClosingDateEdit() {
    this.editedClosingDate.set(
      this.lead.closingDate
        ? new Date(this.lead.closingDate).toISOString().split('T')[0]
        : ''
    );
    this.isEditingClosingDate.set(false);
  }

  startEditContactDetails() {
    this.isEditingContactDetails.set(true);
  }

  async saveContactDetails() {
    const success = await this.crmService.updateLeadContactDetails({
      leadId: this.lead._id,
      contactDetails: this.editedContactDetails(),
    });

    if (success) {
      this.lead.contactDetails = this.editedContactDetails();
      this.isEditingContactDetails.set(false);
    }
  }

  cancelContactDetailsEdit() {
    this.editedContactDetails.set({
      name: this.lead.contactDetails?.name || '',
      phone: this.lead.contactDetails?.phone || '',
      email: this.lead.contactDetails?.email || '',
      address: this.lead.contactDetails?.address || '',
    });
    this.isEditingContactDetails.set(false);
  }

  startEditAmount() {
    this.isEditingAmount.set(true);
  }

  async saveAmount() {
    const success = await this.crmService.updateLeadAmount({
      leadId: this.lead._id,
      amount: this.editedAmount(),
    });

    if (success) {
      this.lead.amount = this.editedAmount();
      this.isEditingAmount.set(false);
    }
  }

  cancelAmountEdit() {
    this.editedAmount.set(this.lead.amount || '');
    this.isEditingAmount.set(false);
  }

  startEditProduct() {
    this.isEditingProduct.set(true);
  }

  async saveProduct() {
    const success = await this.crmService.updateLeadProduct({
      leadId: this.lead._id,
      product: this.editedProduct(),
    });

    if (success) {
      this.lead.product = this.editedProduct();
      this.isEditingProduct.set(false);
    }
  }

  cancelProductEdit() {
    this.editedProduct.set(this.lead.product || []);
    this.isEditingProduct.set(false);
  }

  // Utility methods
  getCategoryName(categoryId: string | null): string {
    if (!categoryId) return 'No Category';
    const category = this.categories.find((cat) => cat._id === categoryId);
    return category ? category.name : 'Unknown Category';
  }

  getPriorityColor(priority: 'cold' | 'warm' | 'hot'): string {
    return this.priorityColors[priority] || this.priorityColors.warm;
  }

  getPriorityIcon(priority: 'cold' | 'warm' | 'hot'): string {
    switch (priority) {
      case 'cold':
        return 'ri-snowy-line';
      case 'warm':
        return 'ri-sun-line';
      case 'hot':
        return 'ri-fire-line';
      default:
        return 'ri-sun-line';
    }
  }

  canWinLead(): boolean {
    return this.lead.column !== this.wonColumnId;
  }

  canLoseLead(): boolean {
    return this.lead.column !== this.lostColumnId;
  }

  canEditLead(): boolean {
    return this.crmPermissionsService.isTaskLevelPermission();
  }

  getAssignedMembersText(): string {
    if (!this.lead.assignedTo || this.lead.assignedTo.length === 0) {
      return 'Unassigned';
    }
    if (this.lead.assignedTo.length === 1) {
      return this.lead.assignedTo[0].name;
    }
    return `${this.lead.assignedTo[0].name} +${this.lead.assignedTo.length - 1}`;
  }

  getFormattedClosingDate(): string {
    if (!this.lead.closingDate) return 'No closing date';
    return new Date(this.lead.closingDate).toLocaleDateString();
  }

  getFormattedAmount(): string {
    if (!this.lead.amount) return 'No amount set';
    return this.lead.amount;
  }

  getProductSummary(): string {
    if (!this.lead.product || this.lead.product.length === 0) {
      return 'No products';
    }
    if (this.lead.product.length === 1) {
      return this.lead.product[0].name;
    }
    return `${this.lead.product[0].name} +${this.lead.product.length - 1}`;
  }

  onLeadWin(event: Event) {
    event.stopPropagation();
    this.leadWin.emit(this.lead);
  }

  onLeadLose(event: Event) {
    event.stopPropagation();
    this.leadLose.emit(this.lead);
  }

  getFormattedCreatedDate(): string {
    if (!this.lead.updatedAt) return '';
    return new Date(this.lead.updatedAt).toLocaleDateString();
  }
}
