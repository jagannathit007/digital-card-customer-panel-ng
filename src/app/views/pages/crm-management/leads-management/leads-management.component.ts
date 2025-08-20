import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  signal,
  computed,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';
import { CrmService } from 'src/app/services/crm.service';
import { DragDropService } from 'src/app/services/drag-drop.service';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
import { CrmPermissionsService } from 'src/app/services/crm-permissions.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SocketService } from 'src/app/services/socket.service';

interface LeadUpdate {
  field: string;
  value: any;
  leadId: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  emailId: string;
  role: string;
  profileImage: string;
  isDeleted: boolean;
}

export interface LeadCategory {
  _id: string;
  name: string;
  color: string;
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
  closingDate?: Date;
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
    prise: string;
    quantity: string;
  }>;
}

export interface CrmColumn {
  _id: string;
  title: string;
  position: number;
  leads: Lead[];
  canEdit: boolean;
  canDelete: boolean;
}

@Component({
  selector: 'app-leads-management',
  templateUrl: './leads-management.component.html',
  styleUrl: './leads-management.component.scss',
})
export class LeadsManagementComponent implements OnInit, OnDestroy {
  // Kanban View Auto Scrolling Properties
  @ViewChild('kanbanContainer') kanbanContainer!: ElementRef<HTMLDivElement>;
  private autoScrollInterval: any = null;
  private autoScrollSpeed: number = 15;
  private isDragActive = false;

  baseURL = environment.baseURL;
  private destroy$ = new Subject<void>();

  // Reactive signals for state management
  crmColumns = signal<CrmColumn[]>([]);
  selectedLead = signal<Lead | null>(null);
  draggedLead = signal<Lead | null>(null);
  isDragging = signal<boolean>(false);

  // Column action states
  activeColumnMenu = signal<string | null>(null);
  editingColumnId = signal<string | null>(null);
  newColumnTitle = signal<string>('');
  crmId = signal<string>('');
  wonColumnId = signal<string>('');
  lostColumnId = signal<string>('');

  showColumnNamePopup = signal<boolean>(false);
  popupMode = signal<'add' | 'rename'>('add');
  positionForNewColumn: 'left' | 'right' = 'right';
  currentColumnId = signal<string | null>(null);
  isAssignmentFilterActive = signal<boolean>(
    !!this.storage.get(teamMemberCommon.ASSIGNMENT_FILTER) || false
  );

  categories = signal<Category[]>([]);

  // available user for selected crm
  availableUsersForSelectedCrm = signal<TeamMember[]>([]);

  createLeadData = signal<any>(null);

  columnForm!: FormGroup;
  showCreatePopup = signal<boolean>(false);

  // Loading state
  isLoading = signal<boolean>(true);

  adminId: string = '';

  // Computed properties
  editableColumns = computed(() =>
    this.crmColumns().filter((col) => col.canEdit)
  );

  fixedColumns = computed(() =>
    this.crmColumns().filter((col) => !col.canEdit)
  );

  // In your component class
  @ViewChild(CdkDrag) drag!: CdkDrag;

  ngAfterViewInit() {
    if (this.drag) {
      this.setupDragPreview();
    }
  }

  private setupDragPreview() {
    document.addEventListener('cdkDragStarted', (event: any) => {
      if (event.detail.source._dragRef instanceof CdkDrag) {
        setTimeout(() => {
          const preview = document.querySelector(
            '.cdk-drag-preview'
          ) as HTMLElement;
          if (preview) {
            preview.style.width = '20rem';
            preview.style.opacity = '0.9';
            preview.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.2)';
          }
        });
      }
    });
  }

  constructor(
    private storage: AppStorage,
    private cdr: ChangeDetectorRef,
    public modal: ModalService,
    private crmService: CrmService,
    public crmPermissionsService: CrmPermissionsService,
    private router: Router,
    private route: ActivatedRoute,
    private dragDropService: DragDropService,
    private fb: FormBuilder,
    private socketService: SocketService
  ) {}

  async ngOnInit() {
    this.adminId =
      this.crmPermissionsService.getCurrentUser().role === 'admin'
        ? this.crmPermissionsService.getCurrentUser()._id
        : this.crmPermissionsService.getCurrentUser().adminId;

    this.columnForm = this.fb.group({
      columnName: [
        '',
        [Validators.required, this.uniqueColumnNameValidator.bind(this)],
      ],
    });

    this.loadData();
    this.setupKeyboardListeners();
    this.setupDragDropSubscription();
    this.setupLeadUpdateSubscription();
  }

  ngOnDestroy() {
    this.clearAutoScroll();
    this.isDragActive = false;
    document.removeEventListener('mousemove', this.trackMouseDuringDrag);
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupDragDropSubscription() {
    this.dragDropService.dragState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((dragState) => {
        if (dragState.isDragging) {
          this.isDragging.set(true);
          this.draggedLead.set(dragState.draggedItem);
        } else {
          this.isDragging.set(false);
          this.draggedLead.set(null);
        }
      });
  }

  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.clearSelection();
    }
  };

  private setupKeyboardListeners() {
    document.addEventListener('keydown', this.handleKeydown);
  }

  async loadData() {
    const crmDetails = await this.crmService.getCrmDetails({});
    if (crmDetails) {
      this.crmId.set(crmDetails._id);
      this.categories.set(crmDetails.categories || []);

      const columns = await this.crmService.getCrmColumns({});
      if (columns) {
        this.crmColumns.set(columns);
        this.wonColumnId.set(
          columns.find(
            (col: any) => col.title.toLowerCase() === 'won'
          )?._id
        );
        this.lostColumnId.set(
          columns.find(
            (col: any) => col.title.toLowerCase() === 'lost'
          )?._id
        );

        const availableUsers = await this.loadAvailableUsers();
        if (availableUsers) {
          this.loadLeads();
        }
      }
    } else {
      this.isLoading.set(false);
      this.crmId.set('');
    }
  }

  async loadAvailableUsers(): Promise<boolean> {
    const users = await this.crmService.getSelectableTeamMembers({});
    if (users) {
      this.availableUsersForSelectedCrm.set(users);
      return true;
    } else {
      this.crmId.set('');
      this.isLoading.set(false);
      return false;
    }
  }

  async loadLeads() {
    const crmId = this.crmId();
    const leads = await this.crmService.getLeadsByCrmId({});

    if (leads) {
      // Update crm columns with leads
      const columns = this.crmColumns();
      columns.forEach((column) => {
        column.leads = leads.filter((lead: Lead) => lead.column === column._id);
      });
      this.crmColumns.set(columns);
    }
    this.isLoading.set(false);
  }

  private focusElement(selector: string, selectText = false) {
    setTimeout(() => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        element.focus();
        if (selectText && element instanceof HTMLInputElement) {
          element.select();
        }
      }
    });
  }

  openAddLeadModal() {
    this.showCreatePopup.set(true);
  }

  onPopupClosed() {
    this.showCreatePopup.set(false);
    this.createLeadData.set(null);
  }

  onLeadCreated(lead: any) {
    this.showCreatePopup.set(false);

    this.crmColumns.update((columns) => {
      const column = columns.find((col) => col._id === lead.column);
      if (column) {
        column.leads.push(lead);
      }
      return columns;
    });
  }

  // Drag and drop event handlers
  onDragStarted(lead: Lead) {
    this.isDragActive = true;

    this.isDragging.set(true);
    this.draggedLead.set(lead);
    this.clearSelection();
    this.dragDropService.startDrag(lead, lead.column, 'task');

    if (this.kanbanContainer) {
      this.kanbanContainer.nativeElement.classList.add('dragging');
    }

    // Add mouse tracking listener
    document.addEventListener('mousemove', this.trackMouseDuringDrag);
  }

  onColumnDragStarted(column: any) {
    this.dragDropService.startDrag(column, column._id, 'column');
  }

  onDragEnded() {
    this.isDragActive = false;

    setTimeout(() => {
      this.isDragging.set(false);
      this.draggedLead.set(null);
      this.dragDropService.endDrag();

      if (this.kanbanContainer) {
        this.kanbanContainer.nativeElement.classList.remove('dragging');
      }

      // Remove mouse tracking listener
      document.removeEventListener('mousemove', this.trackMouseDuringDrag);

      this.clearAutoScroll();
    }, 100);
  }

  // Column operations
  async onColumnDrop(event: CdkDragDrop<CrmColumn[]>) {
    if (event.previousIndex === event.currentIndex) return;

    const originalColumns = [...this.crmColumns()];
    const editableColumns = originalColumns.filter((col) => col.canEdit);
    const fixedColumns = originalColumns.filter((col) => !col.canEdit);

    // Safe check: drag happens within editable zone
    if (
      event.previousIndex < editableColumns.length &&
      event.currentIndex < editableColumns.length
    ) {
      // Clone editable for manipulation
      const newEditableColumns = [...editableColumns];
      moveItemInArray(
        newEditableColumns,
        event.previousIndex,
        event.currentIndex
      );

      // Update positions
      newEditableColumns.forEach((col, index) => (col.position = index));

      // Merge editable + fixed columns, sorted by position
      const newColumnList = [...newEditableColumns, ...fixedColumns].sort(
        (a, b) => a.position - b.position
      );
      const previousColumnState = [...originalColumns]; // backup for rollback

      this.crmColumns.set(newColumnList);
      this.cdr.detectChanges(); // for smooth animation

      const movedColumn = newEditableColumns[event.currentIndex];
      try {
        const success = await this.crmService.reorderCrmColumn({
          columnId: movedColumn._id,
          newPosition: movedColumn.position,
        });

        if (!success) {
          this.crmColumns.set(previousColumnState);
          console.warn('Failed to reorder columns on backend. Reverting...');
        }
      } catch (err) {
        this.crmColumns.set(previousColumnState);
        console.error('Error reordering column:', err);
      }
    }
  }

  // Lead drop handling for cross-column movement
  async onLeadDrop(event: CdkDragDrop<Lead[]>, targetColumnId: string) {
    // Immediately clear auto scroll
    this.isDragActive = false;
    this.clearAutoScroll();

    const columns = [...this.crmColumns()];
    const sourceColumnId = event.previousContainer.id;

    // Find source and target columns
    const sourceColumn = columns.find((col) => col._id === sourceColumnId);
    const targetColumn = columns.find((col) => col._id === targetColumnId);

    if (!sourceColumn || !targetColumn) return;

    // Update drag service with target info
    this.dragDropService.updateTarget(targetColumnId);

    // Prevent flickering by temporarily disabling selection
    this.clearSelection();

    if (sourceColumnId === targetColumnId) {
      // Reordering within same column
      const leads = [...targetColumn.leads];
      moveItemInArray(leads, event.previousIndex, event.currentIndex);

      // Update positions
      leads.forEach((lead, index) => {
        lead.position = index;
      });

      targetColumn.leads = leads;
    } else {
      // Moving between different columns
      const sourceData = [...sourceColumn.leads];
      const targetData = [...targetColumn.leads];

      // Transfer the item
      transferArrayItem(
        sourceData,
        targetData,
        event.previousIndex,
        event.currentIndex
      );

      // Update the moved lead's properties
      const movedLead = targetData[event.currentIndex];
      if (movedLead) {
        movedLead.column = targetColumnId;
        this.updateLeadStatus(movedLead, targetColumn, sourceColumn);
      }

      // Update both columns
      sourceColumn.leads = sourceData;
      targetColumn.leads = targetData;

      // Update positions for both columns
      sourceData.forEach((lead, index) => {
        lead.position = index;
      });

      targetData.forEach((lead, index) => {
        lead.position = index;
      });
    }

    // Update the signal to trigger reactivity
    this.crmColumns.set(columns);

    // Force change detection for smooth animations
    this.cdr.detectChanges();

    if (
      sourceColumnId !== targetColumnId ||
      (sourceColumnId === targetColumnId &&
        event.previousIndex !== event.currentIndex)
    ) {
      const updateInDatabase = await this.crmService.reorderLead({
        leadId: event.container.data[event.currentIndex]?._id,
        toColumn: targetColumnId,
        toPosition: event.currentIndex,
      });

      if (!updateInDatabase) {
        // Fallback: undo the move of local
        if (sourceColumnId === targetColumnId) {
          // Revert reordering within same column
          moveItemInArray(
            targetColumn.leads,
            event.currentIndex,
            event.previousIndex
          );
        } else {
          // Revert transfer between columns
          const revertedLead = targetColumn.leads.splice(
            event.currentIndex,
            1
          )[0];
          sourceColumn.leads.splice(event.previousIndex, 0, revertedLead);

          // undo status update to last when moving lead between column
          this.updateLeadStatus(revertedLead, sourceColumn, targetColumn);
        }
        this.crmColumns.set(columns);
      }
    }
  }

  private updateLeadStatus(
    lead: Lead,
    column: CrmColumn,
    sourceColumn: CrmColumn
  ) {
    if (
      !['won', 'lost'].includes(column.title.toLowerCase()) &&
      !['won', 'lost'].includes(sourceColumn.title.toLowerCase())
    )
      return;
    
    switch (column.title.toLowerCase()) {
      case 'won':
        lead.wonAt = new Date();
        lead.lostAt = null;
        break;
      case 'lost':
        lead.lostAt = new Date();
        lead.wonAt = null;
        break;
      default:
        lead.wonAt = null;
        lead.lostAt = null;
    }
  }

  // Add this custom validator
  private uniqueColumnNameValidator(control: any) {
    const value = control.value?.trim();
    if (!value) return null;

    const currentColumnId = this.currentColumnId();
    const existingColumns = this.crmColumns();

    // For rename operation, exclude the current column from validation
    const isDuplicate = existingColumns.some((column) => {
      const sameTitle = column.title.toLowerCase() === value.toLowerCase();

      if (this.popupMode() === 'rename') {
        // Exclude the current column being renamed
        return sameTitle && column._id !== currentColumnId;
      }

      return sameTitle;
    });

    return isDuplicate ? { duplicateName: true } : null;
  }

  // Column menu operations
  toggleColumnMenu(columnId: string, event: Event) {
    event.stopPropagation();
    this.activeColumnMenu.set(
      this.activeColumnMenu() === columnId ? null : columnId
    );
  }

  closeColumnMenu() {
    this.activeColumnMenu.set(null);
  }

  startRenameColumn(columnId: string) {
    const column = this.crmColumns().find((col) => col._id === columnId);
    if (column && column.canEdit) {
      this.editingColumnId.set(columnId);
      this.columnForm.patchValue({
        columnName: column.title,
      });
      this.closeColumnMenu();

      setTimeout(() => {
        const input = document.querySelector(
          `input[data-column-id="${columnId}"]`
        ) as HTMLInputElement;
        if (input) {
          input.focus();
          input.select();
        }
      }, 0);
    }
  }

  onColumnTitleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.newColumnTitle.set(target.value);
    }
  }

  async saveColumnRename(columnId: string, title: string) {
    const oldTitle = this.crmColumns().find(
      (col) => col._id === columnId
    )?.title;

    if (title) {
      const columns = [...this.crmColumns()];
      const columnIndex = columns.findIndex((col) => col._id === columnId);

      if (columnIndex !== -1) {
        columns[columnIndex].title = title;
        this.crmColumns.set(columns);

        const updateInDatabase = await this.crmService.updateCrmColumnName({
          columnId,
          newTitle: title,
        });

        if (!updateInDatabase) {
          columns[columnIndex].title = oldTitle || '';
          this.crmColumns.set(columns);
        }
      }
    }

    this.editingColumnId.set(null);
  }

  cancelColumnRename() {
    this.editingColumnId.set(null);
    this.newColumnTitle.set('');
  }

  async deleteColumn(columnId: string) {
    const columnDetails = this.crmColumns().find((col) => col._id == columnId);
    this.closeColumnMenu();
    
    const result = await swalHelper.confirmation(
      `Delete "${columnDetails?.title}" Column`,
      `Are you sure you want to delete this column?`,
      'question'
    );

    if (result.isConfirmed) {
      this.isLoading.set(true);

      const column = this.crmColumns().find(
        (col) => col._id === columnId
      );
      if (column && column.canDelete && column.leads.length === 0) {
        const response = await this.crmService.deleteCrmColumn({
          columnId: columnId,
        });

        if (response) {
          const columns = this.crmColumns().filter(
            (col) => col._id !== columnId
          );
          this.crmColumns.set(columns);
          console.log('Column deleted:', columnId);
        }
      } else if (column && column.leads.length > 0) {
        swalHelper.showToast('Please move all leads from this column before deleting it.', 'warning');
      }
      this.isLoading.set(false);
    }
  }

  openAddColumnPopup(position: 'left' | 'right', referenceColumnId: string) {
    this.closeColumnMenu();
    this.popupMode.set('add');
    this.currentColumnId.set(referenceColumnId);
    this.columnForm.reset();
    this.showColumnNamePopup.set(true);
    this.positionForNewColumn = position;

    this.focusElement('#columnNameInput');
  }

  // For renaming column
  openRenameColumnPopup(columnId: string) {
    const column = this.crmColumns().find((col) => col._id === columnId);
    if (column) {
      this.closeColumnMenu();
      this.popupMode.set('rename');
      this.currentColumnId.set(columnId);
      this.columnForm.patchValue({
        columnName: column.title,
      });
      this.showColumnNamePopup.set(true);

      this.focusElement('#columnNameInput', true);
    }
  }

  closeColumnNamePopup() {
    this.showColumnNamePopup.set(false);
    this.currentColumnId.set(null);
    this.columnForm.reset();
  }

  async handleColumnNameSubmit() {
    if (this.columnForm.invalid) return;

    const columnName = this.columnForm.get('columnName')?.value.trim();

    if (this.popupMode() === 'rename' && this.currentColumnId()) {
      await this.saveColumnRename(this.currentColumnId()!, columnName);
    } else if (this.popupMode() === 'add' && this.currentColumnId()) {
      await this.addColumn(
        this.positionForNewColumn,
        this.currentColumnId()!,
        columnName
      );
    }
    this.closeColumnNamePopup();
  }

  async addColumn(
    position: 'left' | 'right',
    referenceColumnId: string,
    title: string
  ) {
    this.isLoading.set(true);

    const columns = [...this.crmColumns()];
    const refIndex = columns.findIndex((col) => col._id === referenceColumnId);

    const response = await this.crmService.createCrmColumn({
      title: title,
      position: position === 'left' ? `${refIndex}` : `${refIndex + 1}`,
    });

    if (response) {
      columns.splice(response.position, 0, response);
      this.crmColumns.set(columns);
      console.log('Column added:', { position, referenceColumnId, response });
    }

    this.isLoading.set(false);
  }

  // Lead operations
  selectLead(lead: Lead) {
    if (!this.isDragging()) {
      this.selectedLead.set(lead);
      console.log()
      this.router.navigate(['details', lead._id], { relativeTo: this.route });
    }
  }

  clearSelection() {
    this.selectedLead.set(null);
  }

  async winLead(lead: Lead) {
    if (this.wonColumnId()) {
      this.moveLeadToColumn(lead, this.wonColumnId());
      this.clearSelection();
    }
  }

  loseLead(lead: Lead) {
    if (this.lostColumnId()) {
      this.moveLeadToColumn(lead, this.lostColumnId());
      this.clearSelection();
    }
  }

  openLead(lead: Lead) {
    this.router.navigate([lead._id], { relativeTo: this.route });
  }

  onLeadDoubleClick(lead: Lead) {
    this.router.navigate([lead._id], { relativeTo: this.route });
  }

  private async moveLeadToColumn(lead: Lead, targetColumnId: string) {
    const columns = [...this.crmColumns()];

    const sourceColumn = columns.find((col) => col._id === lead.column);
    const targetColumn = columns.find((col) => col._id === targetColumnId);

    if (sourceColumn && targetColumn) {
      const leadIndex = sourceColumn.leads.findIndex((l) => l._id === lead._id);
      if (leadIndex !== -1) {
        sourceColumn.leads.splice(leadIndex, 1);
      }

      lead.column = targetColumnId;
      lead.position = targetColumn.leads.length;
      this.updateLeadStatus(lead, targetColumn, sourceColumn);
      targetColumn.leads.unshift(lead);
      this.crmColumns.set(columns);

      const updateInDatabase = await this.crmService.reorderLead({
        leadId: lead._id,
        toColumn: targetColumnId,
        toPosition: 0,
      });
      
      if (!updateInDatabase) {
        // Fallback: undo the move of local
        targetColumn.leads.shift();
        lead.column = sourceColumn._id;
        sourceColumn.leads.push(lead);
        this.crmColumns.set(columns);
        console.error(
          'Failed to update lead in database, reverted changes locally.'
        );
      } else {
        console.log('Lead moved to column:', {
          leadId: lead._id,
          targetColumnId,
        });
      }
    }
  }

  // Click outside handler
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    if (!target.closest('.column-menu-container')) {
      this.closeColumnMenu();
    }

    if (!target.closest('.lead-card') && !target.closest('.lead-actions')) {
      this.clearSelection();
    }
  }

  // TrackBy functions for performance
  trackByColumnId(index: number, column: CrmColumn): string {
    return column._id;
  }

  trackByLeadId(index: number, lead: Lead): string {
    return lead._id;
  }

  onToggleAssignmentFilter() {
    this.isAssignmentFilterActive.set(!this.isAssignmentFilterActive());

    this.storage.set(
      teamMemberCommon.ASSIGNMENT_FILTER,
      this.isAssignmentFilterActive()
    );
  }

  // Auto-scroll methods
  private setupDragEventListeners() {
    document.addEventListener('dragover', this.handleCdkDragOver.bind(this), {
      passive: false,
    });
    document.addEventListener('dragend', this.handleCdkDragEnd.bind(this));
  }

  private handleCdkDragOver = (event: DragEvent) => {
    if (!this.isDragActive) return;
    this.handleAutoScrollWithDragEvent(event);
  };

  private handleCdkDragEnd = (event: DragEvent) => {
    this.isDragActive = false;
    this.clearAutoScroll();
  };

  private handleAutoScrollWithDragEvent(event: DragEvent): void {
    if (!this.kanbanContainer) {
      return;
    }

    const container = this.kanbanContainer.nativeElement;
    const rect = container.getBoundingClientRect();
    const scrollThreshold = 150;
    const x = event.clientX - rect.left;

    // Clear any existing scroll
    this.clearAutoScroll();

    // Check left scroll trigger
    if (x < scrollThreshold && container.scrollLeft > 0) {
      this.startContinuousScroll('left', container);
    }
    // Check right scroll trigger
    else if (x > rect.width - scrollThreshold) {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft < maxScroll) {
        this.startContinuousScroll('right', container);
      }
    }
  }

  private startContinuousScroll(
    direction: 'left' | 'right',
    container: HTMLElement
  ) {
    const scrollStep = () => {
      if (!this.isDragActive) {
        this.clearAutoScroll();
        return;
      }

      const scrollAmount =
        direction === 'left' ? -this.autoScrollSpeed : this.autoScrollSpeed;
      const beforeScroll = container.scrollLeft;

      container.scrollLeft += scrollAmount;

      // Check boundaries
      const maxScroll = container.scrollWidth - container.clientWidth;
      const canContinue =
        direction === 'left'
          ? container.scrollLeft > 0
          : container.scrollLeft < maxScroll;

      if (canContinue && this.isDragActive) {
        this.autoScrollInterval = requestAnimationFrame(scrollStep);
      } else {
        this.clearAutoScroll();
      }
    };

    this.autoScrollInterval = requestAnimationFrame(scrollStep);
  }

  private clearAutoScroll(): void {
    if (this.autoScrollInterval) {
      cancelAnimationFrame(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }

  private trackMouseDuringDrag = (event: MouseEvent) => {
    if (this.isDragActive) {
      this.handleAutoScrollFromMousePosition(event.clientX, event.clientY);
    }
  };

  private handleAutoScrollFromMousePosition(
    mouseX: number,
    mouseY: number
  ): void {
    if (!this.kanbanContainer) {
      return;
    }

    if (!this.isDragActive) {
      return;
    }

    const container = this.kanbanContainer.nativeElement;
    const rect = container.getBoundingClientRect();
    const scrollThreshold = 150;
    const x = mouseX - rect.left;

    // Check if mouse is within container vertically
    if (mouseY < rect.top || mouseY > rect.bottom) {
      this.clearAutoScroll();
      return;
    }

    // Clear any existing scroll
    this.clearAutoScroll();

    // Check left scroll trigger
    if (x < scrollThreshold && container.scrollLeft > 0) {
      this.startContinuousScroll('left', container);
    }
    // Check right scroll trigger
    else if (x > rect.width - scrollThreshold) {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft < maxScroll) {
        this.startContinuousScroll('right', container);
      }
    }
  }

  private setupLeadUpdateSubscription() {
    // This would be implemented when you have lead update events
    // Similar to task update subscription in team task component
  }
}
