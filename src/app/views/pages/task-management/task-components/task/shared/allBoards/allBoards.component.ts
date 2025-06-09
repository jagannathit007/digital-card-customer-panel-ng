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
  imports: [CommonModule, FormsModule, JoinedMembersComponent],
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
  editingCategories = signal<Category[]>([]);
  newCategoryName = signal('');
  searchTerm = signal('');
  hoveredDescription = signal<string>('');
  expandingBoardId = signal<string>('');

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
    return categories.filter(c => !c.isDeleted).length;
  }

  availableTeamMembers = computed(() => {
    const selectedBoard = this.selectedBoard();
    if (!selectedBoard) return this.teamMembers();

    const existingMemberIds = selectedBoard.members.map((m) => m._id);
    return this.teamMembers().filter(
      (member) => !existingMemberIds.includes(member._id) && member.isActive
    );
  });

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadDummyData();
  }

  private loadDummyData() {
    // Dummy boards data
    const dummyBoards: Board[] = [
      {
        _id: '1',
        name: 'Development Board',
        description:
          'In this board all the development related tasks will be assigned to team members for efficient project management and tracking.',
        categories: [
          { _id: '1', name: 'Frontend', isDeleted: false },
          { _id: '2', name: 'Backend', isDeleted: false },
          { _id: '3', name: 'R&D', isDeleted: false },
        ],
        members: [
          {
            _id: '1',
            name: 'John Doe',
            emailId: 'john@example.com',
            role: 'leader',
            profileImage:
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            isDeleted: false,
          },
          {
            _id: '2',
            name: 'Jane Smith',
            emailId: 'jane@example.com',
            role: 'developer',
            profileImage:
              'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            isDeleted: false,
          },
        ],
        createdAt: '2025-01-15T10:30:00Z',
        type: 'board',
      },
      {
        _id: '2',
        name: 'Sales Board',
        description:
          'Sales related activities and lead management board for tracking customer interactions.',
        categories: [
          { _id: '4', name: 'Lead', isDeleted: false },
          { _id: '5', name: 'Inquiry', isDeleted: false },
          { _id: '6', name: 'Follow-up', isDeleted: false },
        ],
        members: [
          {
            _id: '3',
            name: 'Mike Johnson',
            emailId: 'mike@example.com',
            role: 'manager',
            profileImage:
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            isDeleted: false,
          },
        ],
        createdAt: '2025-01-10T14:20:00Z',
        type: 'task',
      },
      {
        _id: '3',
        name: 'Marketing Campaigns',
        description:
          'Strategic marketing initiatives and campaign management for brand awareness and lead generation activities across multiple channels.',
        categories: [
          { _id: '7', name: 'Social Media', isDeleted: false },
          { _id: '8', name: 'Email Marketing', isDeleted: false },
        ],
        members: [
          {
            _id: '4',
            name: 'Sarah Wilson',
            emailId: 'sarah@example.com',
            role: 'editor',
            profileImage:
              'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            isDeleted: false,
          },
          {
            _id: '5',
            name: 'David Brown',
            emailId: 'david@example.com',
            role: 'developer',
            profileImage:
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            isDeleted: false,
          },
          {
            _id: '6',
            name: 'Emma Davis',
            emailId: 'emma@example.com',
            role: 'designer',
            profileImage:
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
            isDeleted: false,
          },
        ],
        createdAt: '2025-01-08T09:15:00Z',
        type: 'task',
      },
    ];

    // Dummy team members data
    const dummyTeamMembers: TeamMember[] = [
      {
        _id: '7',
        name: 'Alex Turner',
        emailId: 'alex@example.com',
        role: 'developer',
        profileImage:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
        experience: '3 years',
        skills: ['React', 'Node.js'],
        isActive: true,
        isVerified: true,
      },
      {
        _id: '8',
        name: 'Lisa Chen',
        emailId: 'lisa@example.com',
        role: 'designer',
        profileImage:
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
        experience: '5 years',
        skills: ['UI/UX', 'Figma'],
        isActive: true,
        isVerified: true,
      },
    ];

    this.boards.set(dummyBoards);
    this.teamMembers.set(dummyTeamMembers);
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

    // Simulate animation delay before navigation
    setTimeout(() => {
      this.router.navigate(['/task-management/members-task'], {
        queryParams: { boardId: board._id },
      });
    }, 500);
  }

  onCreateNewBoard() {
    this.router.navigate(['/create-board']);
  }

  onShowCategories(board: Board, event: Event) {
    event.stopPropagation();
    this.selectedBoard.set(board);
    this.editingCategories.set([
      ...board.categories.filter((cat) => !cat.isDeleted),
    ]);
    this.showCategoriesModal.set(true);
  }

  onShowMembers(board: Board, event: Event) {
    event.stopPropagation();
    this.selectedBoard.set(board);
    this.showMembersModal.set(true);
  }

  onShowAddMember(event: Event) {
    event.stopPropagation();
    this.showMembersModal.set(false);
    this.showAddMemberModal.set(true);
  }

  // ...existing code...
  trackByCategoryId(index: number, category: any): string {
    return category._id;
  }
  // ...existing code...

  onAddCategory() {
    const name = this.newCategoryName();
    if (!name.trim()) return;

    const newCategory: Category = {
      _id: Date.now().toString(), // Temporary ID
      name: name.trim(),
      isDeleted: false
    };

    this.editingCategories.update(cats => [...cats, newCategory]);
    this.newCategoryName.set('');
  }

  isNewCategoryNameEmpty(): boolean {
    return !this.newCategoryName().trim();
  }

  onRemoveCategory(categoryId: string) {
    this.editingCategories.update((cats) =>
      cats.filter((cat) => cat._id !== categoryId)
    );
  }

  onUpdateCategories() {
    const board = this.selectedBoard();
    if (!board) return;

    const existingCategoryIds = this.editingCategories().map((cat) => cat._id);
    const newCategoryNames = this.editingCategories()
      .filter(
        (cat) => !board.categories.some((existing) => existing._id === cat._id)
      )
      .map((cat) => cat.name);

    // Simulate API call
    console.log('Updating categories:', {
      boardId: board._id,
      existingCategoryIds,
      newCategoryNames,
    });

    // Update local state
    this.boards.update((boards) =>
      boards.map((b) =>
        b._id === board._id
          ? { ...b, categories: [...this.editingCategories()] }
          : b
      )
    );

    this.showCategoriesModal.set(false);
  }

  onAddMemberToBoard(memberId: string) {
    const board = this.selectedBoard();
    const member = this.teamMembers().find((m) => m._id === memberId);

    if (!board || !member) return;

    const newMember: Member = {
      _id: member._id,
      name: member.name,
      emailId: member.emailId,
      role: member.role,
      profileImage: member.profileImage,
      isDeleted: false,
    };

    // Update local state
    this.boards.update((boards) =>
      boards.map((b) =>
        b._id === board._id ? { ...b, members: [...b.members, newMember] } : b
      )
    );

    this.showAddMemberModal.set(false);
  }

  onCloseModal() {
    this.showCategoriesModal.set(false);
    this.showMembersModal.set(false);
    this.showAddMemberModal.set(false);
    this.newCategoryName.set('');
  }

  onDocumentClick() {
    this.selectedBoard.set(null);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  truncateDescription(description: string, maxLength: number = 60): string {
    return description.length > maxLength
      ? description.substring(0, maxLength) + '...'
      : description;
  }

  onDescriptionHover(description: string) {
    this.hoveredDescription.set(description);
  }

  getMemberInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
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
      console.log('Member added:', memberId);
    }
  }

  onMemberRemoved(memberId: string) {
    // Handle member removed event
    if (this.selectedBoard()) {
      // Remove member from board logic here
      console.log('Member removed:', memberId);
    }
  }

  onMemberRoleChanged(event: {memberId: string, newRole: string}) {
    // Handle member role changed event
    if (this.selectedBoard()) {
      // Change member role logic here
      console.log('Member role changed:', event);
    }
  }
}
