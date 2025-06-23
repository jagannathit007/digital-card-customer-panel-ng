import { TaskPermissionsService } from './../../../../../../../services/task-permissions.service';
import { TaskService } from './../../../../../../../services/task.service';
import { TaskMemberAuthService } from './../../../../../../../services/task-member-auth.service';
import {
  ChangeDetectionStrategy,
  Component,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JoinedMembersComponent } from 'src/app/views/partials/task-managemnt/common-components/joinedMembers/joinedMembers.component';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { AddTeamMemberComponent } from '../../../../../../partials/task-managemnt/common-components/addTeamMember/addTeamMember.component';
import { CreateBoardComponent } from "../../../../../../partials/task-managemnt/common-components/create-board/create-board.component";
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { BoardNotificationService } from 'src/app/services/board-notification.service';

interface Category {
  _id: string;
  name: string;
  isDeleted: boolean;
}

interface Member {
  _id: string;
  name: string;
  emailId: string;
  role: string;
  profileImage?: string;
  isDeleted: boolean;
}

interface Board {
  _id: string;
  name: string;
  description: string;
  categories: Category[];
  members: Member[];
  createdAt: string;
  type: string;
}

interface TeamMember {
  _id: string;
  name: string;
  emailId: string;
  role: string;
  profileImage?: string;
  experience?: string;
  skills?: string[];
  isActive: boolean;
  isVerified: boolean;
}

@Component({
  selector: 'app-all-boards',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    JoinedMembersComponent,
    AddTeamMemberComponent,
    CreateBoardComponent
],
  templateUrl: './allBoards.component.html',
  styleUrl: './allBoards.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllBoardsComponent implements OnInit {
  // Signals for reactive state management
  boards = signal<Board[]>([]);
  teamMembers = signal<TeamMember[]>([]);
  selectedBoard = signal<Board | null>(null);
  showCategoriesModal = signal(false);
  showMembersModal = signal(false);
  showAddMemberModal = signal(false);
  showCreateMemberModal = signal(false);
  newCategoryName = signal('');
  originalCategories = signal<Category[]>([]);
  editingCategories = signal<Category[]>([]);
  newCategories = signal<Category[]>([]);
  hasChanges = signal(false);
  searchTerm = signal('');
  hoveredDescription = signal<string>('');
  expandingBoardId = signal<string>('');
  loading: boolean = false;
  currentUser: any;
  allMembersDetails: any[] = [];
  membersLoading = signal(false);
  imageURL = environment.imageURL;
  selectedMemberIds = signal<string[]>([]);
  originalSelectedMemberIds = signal<string[]>([]);
  hasSelectedMembersChanged = signal(false);
  showCreateBoardModal = signal(false);
  showActionDropdown = signal<string>('');
editingBoard = signal<Board | null>(null);

  // Computed values
  filteredBoards = computed(() => {
    const search = this.searchTerm().toLowerCase();
    return this.boards().filter(
      (board) =>
        board.name.toLowerCase().includes(search) ||
        board.description.toLowerCase().includes(search)
    );
  });

  getNonDeletedCategoriesCount(categories: Category[]): number {
    return categories.filter((c) => !c.isDeleted).length;
  }

  availableTeamMembers = computed(() => {
    const selectedBoard = this.selectedBoard();
    if (!selectedBoard) return this.teamMembers();

    const existingMemberIds = selectedBoard.members.map((m) => m._id);
    return this.teamMembers().filter(
      (member) => !existingMemberIds.includes(member._id) && member.isActive
    );
  });

  constructor(
    private router: Router,
    private taskService: TaskService,
    public taskPermissionsService: TaskPermissionsService,
    private boardNotificationService: BoardNotificationService,
    public storage: AppStorage
  ) {}

  ngOnInit() {
    this.currentUser = this.taskPermissionsService.getCurrentUser();
    // this.loadDummyData();
    this.loadData();
  }

  private async loadData() {
    this.loading = true;
    let result: any = null;
    if (
      this.currentUser.role === 'admin' ||
      this.currentUser.role === 'editor'
    ) {
      result = await this.taskService.GetBoardByAdmin({});
    } else {
      result = await this.taskService.GetJoinedBoards({});
    }
    if (result && result) {
      this.boards.set(result);
      this.teamMembers.set(result.members);
      this.loading = false;
    } else {
      this.boards.set([]);
      this.teamMembers.set([]);
      this.loading = false;
    }
  }

  onBoardClick(board: Board, event: Event) {
    event.stopPropagation();
    if (this.selectedBoard()?._id === board._id) {
      this.selectedBoard.set(null);
    } else {
      this.selectedBoard.set(board);
    }
  }

  onOpenBoard(board: Board) {

    this.expandingBoardId.set(board._id);

    // Store board data in storage
  this.storage.set(teamMemberCommon.BOARD_DATA, board);
  
  // IMPORTANT: Notify the header component about board change
  this.boardNotificationService.setCurrentBoard(board._id);

    // Simulate animation delay before navigation
    setTimeout(() => {
      this.router.navigate(['/task-management/teamtask'], {
        queryParams: { boardId: board._id },
      });
    }, 500);
  }

  onCreateNewBoard() {
    // this.router.navigate(['/create-board']);
    this.showCreateBoardModal.set(true);
  }

  onCreateBoardModalClose() {
  this.showCreateBoardModal.set(false);
  this.editingBoard.set(null); // Reset editing board
}

  onBoardCreated(board: any) {
    // this.boards().push(board);
    console.log("board created from all boards page  : ", board)
    this.loadData();
    this.showCreateBoardModal.set(false);
  }

  async availableTeamMembersToAdd(board: Board | null) {
    if (!board) return;
    this.membersLoading.set(true);

    const result = await this.taskService.GetAllAvailableMembers({
      boardId: board._id,
    });

    if (result) {
      this.allMembersDetails = result;

      // Initialize selected members with current board members
      const currentMemberIds = board.members
        .filter((m) => !m.isDeleted)
        .map((m) => m._id);

      this.selectedMemberIds.set([...currentMemberIds]);
      this.originalSelectedMemberIds.set([...currentMemberIds]);
      this.hasSelectedMembersChanged.set(false);

      this.membersLoading.set(false);
    } else {
      console.error('Failed to fetch available members');
      this.allMembersDetails = [];
      this.selectedMemberIds.set([]);
      this.originalSelectedMemberIds.set([]);
      this.membersLoading.set(false);
    }
  }

  onToggleMemberSelection(memberId: string) {
    const currentSelected = this.selectedMemberIds();
    if (currentSelected.includes(memberId)) {
      // Remove member
      this.selectedMemberIds.set(
        currentSelected.filter((id) => id !== memberId)
      );
    } else {
      // Add member
      this.selectedMemberIds.set([...currentSelected, memberId]);
    }
    this.checkForMemberChanges();
  }

  // Add method to check if member is selected
  isMemberSelected(memberId: string): boolean {
    return this.selectedMemberIds().includes(memberId);
  }

  // Add method to check for changes
  private checkForMemberChanges() {
    const original = [...this.originalSelectedMemberIds()].sort();
    const current = [...this.selectedMemberIds()].sort();
    this.hasSelectedMembersChanged.set(
      JSON.stringify(original) !== JSON.stringify(current)
    );
  }

  // Add method to check if member should be disabled
  isMemberDisabled(member: any): boolean {
    return this.taskPermissionsService.isRoleHigherOrEqual(member.role) || !member.isActive || !member.isVerified;
  }

  // Add method to get disabled reason
  getMemberDisabledReason(member: any): string {
    if (this.taskPermissionsService.isRoleHigherOrEqual(member.role)) {
      return 'Cannot update members with higher or equal role';
    }
    if (!member.isActive && !member.isVerified) {
      return 'Member is inactive and not verified';
    }
    if (!member.isActive) {
      return 'Member is inactive';
    }
    if (!member.isVerified) {
      return 'Member is not verified';
    }
    return '';
  }

  toggleActionDropdown(boardId: string) {
  if (this.showActionDropdown() === boardId) {
    this.showActionDropdown.set('');
  } else {
    this.showActionDropdown.set(boardId);
  }
}

onEditBoard(board: Board, event: Event) {
  event.stopPropagation();
  this.editingBoard.set(board);
  this.showCreateBoardModal.set(true);
  this.showActionDropdown.set('');
}

onDeleteBoard(board: Board, event: Event) {
  event.stopPropagation();
  
  swalHelper
    .confirmation(
      `Delete Board`,
      `Are you sure you want to delete "${board.name}"? This action cannot be undone.`,
      'warning'
    )
    .then((result) => {
      if (result.isConfirmed) {
        console.log('Board to delete:', board);
        // Add your delete logic here later
      }
    });
  
  this.showActionDropdown.set('');
}

  onShowCategories(board: Board, event: Event) {
  event.stopPropagation();
  this.selectedBoard.set(board);
  this.showActionDropdown.set(''); // Close dropdown

  // Store original categories for comparison
  const originalCats = board.categories.filter((cat) => !cat.isDeleted);
  this.originalCategories.set([...originalCats]);
  this.editingCategories.set([...originalCats]);
  this.newCategories.set([]);
  this.hasChanges.set(false);

  this.showCategoriesModal.set(true);
}


  onShowMembers(board: Board, event: Event) {
    event.stopPropagation();
    this.selectedBoard.set(board);
    this.showMembersModal.set(true);
  }

  onShowAddMember(board: Board | null, event: Event) {
    event.stopPropagation();
    if (!board) return;
    this.showMembersModal.set(false);
    this.showAddMemberModal.set(true);

    this.availableTeamMembersToAdd(board);
  }

  trackByCategoryId(index: number, category: any): string {
    return category._id;
  }

  onAddCategory() {
    const name = this.newCategoryName().trim();
    if (!name) return;

    const newCategory: Category = {
      _id: Date.now().toString(), // Temporary ID for new categories
      name: name,
      isDeleted: false,
    };

    // Add to new categories array
    this.newCategories.update((cats) => [...cats, newCategory]);
    this.newCategoryName.set('');
    this.checkForChanges();
  }

  onRemoveExistingCategory(categoryId: string) {
    // Remove from editing categories (this will mark it as deleted)
    this.editingCategories.update((cats) =>
      cats.filter((cat) => cat._id !== categoryId)
    );
    this.checkForChanges();
  }

  onRemoveNewCategory(categoryId: string) {
    // Remove from new categories array
    this.newCategories.update((cats) =>
      cats.filter((cat) => cat._id !== categoryId)
    );
    this.checkForChanges();
  }

  private checkForChanges() {
    const originalIds = this.originalCategories()
      .map((cat) => cat._id)
      .sort();
    const currentIds = this.editingCategories()
      .map((cat) => cat._id)
      .sort();
    const hasNewCategories = this.newCategories().length > 0;

    // Check if existing categories changed or new categories added
    const existingChanged =
      JSON.stringify(originalIds) !== JSON.stringify(currentIds);
    this.hasChanges.set(existingChanged || hasNewCategories);
  }

  isNewCategoryNameEmpty(): boolean {
    return !this.newCategoryName().trim();
  }

  isNewCategoryNameIsUnique(): boolean {
    const name = this.newCategoryName().trim();
    if (!name) return true; // Empty name is considered unique
    const allCategories = [
      ...this.editingCategories().map((cat) => cat.name),
      ...this.newCategories().map((cat) => cat.name),
    ];
    return !allCategories.includes(name);
  }

  onRemoveCategory(categoryId: string) {
    this.editingCategories.update((cats) =>
      cats.filter((cat) => cat._id !== categoryId)
    );
  }

  onUpdateCategories() {
    const board = this.selectedBoard();
    if (!board) return;

    // Prepare data for API call
    const existingCategoryIds = this.editingCategories().map((cat) => cat._id);
    const newCategoryNames = this.newCategories().map((cat) => cat.name);

    const data = {
      boardId: board._id,
      existingCategoryIds,
      newCategoryNames,
    };

    swalHelper
      .confirmation(
        `Update Categories`,
        `Are you sure you want to update categories for ${board.name}?`,
        'question'
      )
      .then(async (result) => {
        if (result.isConfirmed) {
          // Call your toggle status API here
          const response = await this.taskService.UpdateBoardCategories(data);
          if (response) {
            const allCategories = [
              ...this.editingCategories(),
              ...this.newCategories().map((cat) => ({
                ...cat,
                _id: `new_${Date.now()}_${Math.random()}`, // Simulate server-generated ID
              })),
            ];

            // Update local board state
            this.boards.update((boards) =>
              boards.map((b) =>
                b._id === board._id ? { ...b, categories: allCategories } : b
              )
            );

            this.showCategoriesModal.set(false);
            this.resetCategoryModal();
          }
        }
      });
  }
  // Here you would make the actual API call:
  /*
    const updateData = {
      boardId: board._id,
      existingCategoryIds,
      newCategoryNames
    };
    
    // Call your service method here
    // await this.taskService.updateBoardCategories(updateData);
    */

  // For now, just update local state to simulate the update

  private resetCategoryModal() {
    this.originalCategories.set([]);
    this.editingCategories.set([]);
    this.newCategories.set([]);
    this.newCategoryName.set('');
    this.hasChanges.set(false);
  }

  // onAddMemberToBoard(memberId: string) {
  //   const board = this.selectedBoard();
  //   const member = this.teamMembers().find((m) => m._id === memberId);

  //   if (!board || !member) return;

  //   const newMember: Member = {
  //     _id: member._id,
  //     name: member.name,
  //     emailId: member.emailId,
  //     role: member.role,
  //     profileImage: member.profileImage,
  //     isDeleted: false,
  //   };

  //   // Update local state
  //   this.boards.update((boards) =>
  //     boards.map((b) =>
  //       b._id === board._id ? { ...b, members: [...b.members, newMember] } : b
  //     )
  //   );

  //   this.showAddMemberModal.set(false);
  // }

  async onUpdateBoardMembers() {
    const board = this.selectedBoard();
    if (!board || !this.hasSelectedMembersChanged()) return;

    const selectedIds = this.selectedMemberIds();

    swalHelper
      .confirmation(
        `Update Members`,
        `Are you sure you want to update members for ${board.name}?`,
        'question'
      )
      .then(async (result) => {
        if (result.isConfirmed) {
          const response = await this.taskService.UpdateBoardMembers({
            boardId: board._id,
            members: selectedIds,
          });

          if (response) {
            // Update local board state
            const updatedMembers = this.allMembersDetails
              .filter((member) => selectedIds.includes(member._id))
              .map((member) => ({
                _id: member._id,
                name: member.name,
                emailId: member.emailId,
                role: member.role,
                profileImage: member.profileImage,
                isDeleted: false,
              }));

            this.boards.update((boards) =>
              boards.map((b) =>
                b._id === board._id ? { ...b, members: updatedMembers } : b
              )
            );

            // Update original selection to reflect saved state
            this.originalSelectedMemberIds.set([...selectedIds]);
            this.hasSelectedMembersChanged.set(false);
          }

          this.showAddMemberModal.set(false);
        }
      });
  }

  onCloseModal() {
    this.showCategoriesModal.set(false);
    this.showMembersModal.set(false);
    this.showAddMemberModal.set(false);
    this.resetCategoryModal();
    this.resetMemberModal();
  }

  private resetMemberModal() {
    this.selectedMemberIds.set([]);
    this.originalSelectedMemberIds.set([]);
    this.hasSelectedMembersChanged.set(false);
    this.allMembersDetails = [];
  }

  onDocumentClick() {
  this.selectedBoard.set(null);
  this.showActionDropdown.set(''); // Close dropdown on document click
}

  allCategoriesToShow = computed(() => {
    return [...this.editingCategories(), ...this.newCategories()];
  });

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  onDescriptionHover(description: string) {
    this.hoveredDescription.set(description);
  }

  getMemberInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  onDescriptionLeave() {
    this.hoveredDescription.set('');
  }

  onMemberAdded(memberId: string) {
    // Handle member added event
    if (this.selectedBoard()) {
      // Add member to board logic here
    }
  }

  onMemberRemoved(memberId: string) {
    // Handle member removed event
    if (this.selectedBoard()) {
      // Remove member from board logic here
    }
  }

  onMemberRoleChanged(event: { memberId: string; newRole: string }) {
    // Handle member role changed event
    if (this.selectedBoard()) {
      // Change member role logic here
    }
  }

  // Method to open the modal for adding a new member
  onCreateNewUser() {
    this.showCreateMemberModal.set(true);
  }

  // New method to handle modal close
  onAddMemberModalClose() {
    this.showCreateMemberModal.set(false);
  }

  async onMemberCreated(memberData: any) {
    this.showCreateMemberModal.set(false);

    this.availableTeamMembersToAdd(this.selectedBoard());
  }
}
