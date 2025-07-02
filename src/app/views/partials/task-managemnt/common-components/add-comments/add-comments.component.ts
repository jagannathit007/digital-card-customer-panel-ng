import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnDestroy,
  ViewChild,
  ElementRef,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from 'src/app/services/task.service';
import { environment } from 'src/env/env.local';
import { swalHelper } from 'src/app/core/constants/swal-helper';

interface User {
  _id: string;
  name: string;
  profileImage: string;
  role: string;
  id: string;
}

interface MentionTag {
  id: string;
  name: string;
  startPos: number;
  endPos: number;
  uniqueId: string;
}

interface ChatData {
  taskId: string;
  text: string;
  mentionedMembers: string[];
  type: string;
  boardId: string;
}

@Component({
  selector: 'app-add-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-comments.component.html',
  styleUrl: './add-comments.component.scss',
})
export class AddCommentsComponent implements OnInit, OnDestroy {
  @ViewChild('chatInput', { static: false })
  chatInput!: ElementRef<HTMLDivElement>;
  @Output() messageSent = new EventEmitter<ChatData>();

  @Input() boardId: string = '';
  @Input() taskId: string = '';
  @Input() type: string = 'board';
  @Input() placement: Partial<string> = 'top'; // 'top' or 'bottom'

  // API data properties
  // boardId: string = '';
  private allUsers: User[] = [];
  private totalUsers: number = 0;
  private hasMoreUsers: boolean = true;

  // message sent button property
  isSending = false;
  // Component state
  inputText: string = '';
  showDropdown: boolean = false;
  filteredUsers: User[] = [];
  selectedUsers: User[] = [];
  mentionedMembers: string[] = [];
  dropdownPosition = { top: 0, left: 0 };
  currentMentionQuery: string = '';
  currentPage: number = 1;
  usersPerPage: number = 10;
  isLoading: boolean = false;
  searchQuery: string = '';

  // Keyboard navigation
  selectedUserIndex: number = 0;

  // Mention tracking
  private mentionTags: MentionTag[] = [];
  private lastAtPosition: number = -1;
  private isProcessingMention: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.closeDropdown.bind(this));
  }

  async loadUsers(page: number = 1, search: string = ''): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      const response = await this.taskService.GetSelectableTeamMembers({
        page: page,
        limit: this.usersPerPage,
        search: search.trim(),
        boardId: this.boardId,
        taskId: this.taskId,
        type: 'task_add',
      });

      // Handle different possible response structures
      let users: User[] = [];
      let pagination: any = null;

      if (response && response.data && response.data.users) {
        users = response.data.users;
        pagination = response.data.pagination;
      } else if (response && response.data && Array.isArray(response.data)) {
        users = response.data;
      } else if (response && Array.isArray(response)) {
        users = response;
      } else if (response && response.users) {
        users = response.users;
        pagination = response.pagination;
      } else {
        console.warn('Invalid API response structure:', response);
        users = [];
      }

      if (users.length > 0) {
        if (page === 1) {
          // First page - replace all users
          this.allUsers = users;
          this.filteredUsers = [...users];
        } else {
          // Subsequent pages - append users
          this.allUsers = [...this.allUsers, ...users];
          this.filteredUsers = [...this.filteredUsers, ...users];
        }

        // Update pagination info
        if (pagination) {
          this.totalUsers = parseInt(pagination.totalUsers) || users.length;
          this.hasMoreUsers = pagination.hasNextPage || false;
        } else {
          this.totalUsers = users.length;
          this.hasMoreUsers = users.length === this.usersPerPage;
        }
      } else {
        console.warn('No users found in response');
        if (page === 1) {
          this.allUsers = [];
          this.filteredUsers = [];
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to empty array on error
      if (page === 1) {
        this.allUsers = [];
        this.filteredUsers = [];
      }
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  onInputChange(event: any): void {
    const input = event.target;

    // Preserve mention tags during input changes
    this.preserveMentionTags(input);

    const value = this.getPlainTextContent(input);
    const cursorPos = this.getCursorPosition(input);

    this.inputText = value;

    // If input is empty, reset all mention-related state
    if (!this.inputText.trim()) {
      this.mentionTags = [];
      this.mentionedMembers = [];
      this.selectedUsers = [];
      this.isProcessingMention = false;
      this.selectedUserIndex = 0;
      this.hideDropdown();
      this.cdr.detectChanges();
      return;
    }

    // Always check for mentions
    const mentionMatch = this.findMentionAtCursor(value, cursorPos);

    if (
      mentionMatch &&
      !this.isAfterCompletedMention(value, mentionMatch.startPos)
    ) {
      this.currentMentionQuery = mentionMatch.query;
      this.lastAtPosition = mentionMatch.startPos;
      this.showMentionDropdown(input, mentionMatch.startPos);
      this.filterUsers(mentionMatch.query);
      this.selectedUserIndex = 0; // Reset selection to first user
    } else {
      this.hideDropdown();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    const input = event.target as HTMLElement;

    // Handle Ctrl+Enter for message submission
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      this.sendMessage();
      return;
    }

    // Handle dropdown navigation
    if (this.showDropdown) {
      this.handleDropdownNavigation(event);
      return;
    }

    // Handle regular Enter without dropdown
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      // Don't send message on regular Enter - only on Ctrl+Enter
      return;
    }

    if (event.key === 'Backspace') {
      this.handleBackspace(event, input);
    }
  }

  private preserveMentionTags(input: HTMLElement): void {
    // Find all mention spans and update their positions
    const mentionSpans = input.querySelectorAll('[data-mention-id]');
    const newMentionTags: MentionTag[] = [];

    mentionSpans.forEach((span) => {
      const uniqueId = span.getAttribute('data-mention-id');
      const existingTag = this.mentionTags.find((t) => t.uniqueId === uniqueId);

      if (existingTag) {
        // Calculate new position
        const range = document.createRange();
        range.selectNode(span);

        const beforeRange = document.createRange();
        beforeRange.selectNodeContents(input);
        beforeRange.setEnd(range.startContainer, range.startOffset);

        const startPos = beforeRange.toString().length;
        const endPos = startPos + existingTag.name.length + 1; // +1 for @

        newMentionTags.push({
          ...existingTag,
          startPos,
          endPos,
        });
      }
    });

    this.mentionTags = newMentionTags;
  }

  private getPlainTextContent(input: HTMLElement): string {
    let text = '';

    for (let node of Array.from(input.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent || '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.hasAttribute('data-mention-id')) {
          text += element.textContent || '';
        } else {
          text += element.textContent || '';
        }
      }
    }

    return text;
  }

  private handleBackspace(event: KeyboardEvent, input: HTMLElement): void {
    const cursorPos = this.getCursorPosition(input);

    // Check if cursor is at the end of a mention tag
    const mentionTag = this.findMentionTagAtPosition(cursorPos - 1);

    if (mentionTag) {
      event.preventDefault();
      this.removeMentionTag(mentionTag);
    }
  }

  private handleDropdownNavigation(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedUserIndex = Math.min(
          this.selectedUserIndex + 1,
          this.filteredUsers.length - 1
        );
        this.scrollToSelectedUser();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.selectedUserIndex = Math.max(this.selectedUserIndex - 1, 0);
        this.scrollToSelectedUser();
        break;

      case 'Enter':
        event.preventDefault();
        if (this.filteredUsers[this.selectedUserIndex]) {
          this.selectUser(this.filteredUsers[this.selectedUserIndex]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.hideDropdown();
        break;
    }
  }

  private scrollToSelectedUser(): void {
    setTimeout(() => {
      const dropdown = document.querySelector('.mention-dropdown-list');
      const selectedItem = dropdown?.querySelector(
        `[data-user-index="${this.selectedUserIndex}"]`
      );

      if (selectedItem && dropdown) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  private findMentionAtCursor(
    text: string,
    cursorPos: number
  ): { query: string; startPos: number } | null {
    // Find @ symbol before cursor
    let atPos = -1;
    for (let i = cursorPos - 1; i >= 0; i--) {
      if (text[i] === '@') {
        atPos = i;
        break;
      } else if (text[i] === ' ' || text[i] === '\n') {
        break;
      }
    }

    if (atPos === -1) return null;

    // Extract query after @
    const query = text.substring(atPos + 1, cursorPos);

    // Don't show dropdown if query contains spaces (completed mention)
    if (query.includes(' ')) return null;

    return { query, startPos: atPos };
  }

  private isAfterCompletedMention(text: string, atPos: number): boolean {
    return this.mentionTags.some(
      (tag) => atPos >= tag.startPos && atPos < tag.endPos
    );
  }

  private findMentionTagAtPosition(pos: number): MentionTag | null {
    return (
      this.mentionTags.find((tag) => pos >= tag.startPos && pos < tag.endPos) ||
      null
    );
  }

  private showMentionDropdown(input: HTMLElement, atPosition: number): void {
    this.showDropdown = true;
    this.currentPage = 1;
    this.selectedUserIndex = 0; // Always start with first user selected

    // Calculate dropdown position relative to the input element
    const inputRect = input.getBoundingClientRect();
    const containerRect =
      input.closest('.tw-relative')?.getBoundingClientRect() || inputRect;

    // Get cursor position within the input
    const range = document.createRange();
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      const currentRange = selection.getRangeAt(0);

      // Create a temporary element at cursor position
      const tempSpan = document.createElement('span');
      tempSpan.textContent = '|';
      currentRange.insertNode(tempSpan);

      const spanRect = tempSpan.getBoundingClientRect();
      tempSpan.remove();
      
      // Position dropdown relative to container
      this.dropdownPosition = {
        top: spanRect.bottom - containerRect.top + 5,
        left: spanRect.left - containerRect.left,
      };
    } else {
      console.log(inputRect.height + 5);
      // Fallback positioning
      this.dropdownPosition = {
        top: inputRect.height + 5,
        left: 0,
      };
    }

    // Force change detection
    this.cdr.detectChanges();

    // Add click outside listener
    setTimeout(() => {
      document.addEventListener('click', this.closeDropdown.bind(this));
    });
  }

  private hideDropdown(): void {
    this.showDropdown = false;
    this.lastAtPosition = -1;
    this.selectedUserIndex = 0;
    document.removeEventListener('click', this.closeDropdown.bind(this));
  }

  private closeDropdown(event?: Event): void {
    if (
      event &&
      this.chatInput &&
      this.chatInput.nativeElement.contains(event.target as Node)
    ) {
      return;
    }
    this.hideDropdown();
  }

  // Updated filterUsers method to use API
  private async filterUsers(query: string): Promise<void> {
    this.searchQuery = query;
    this.currentPage = 1;

    // Reset filtered users and load from API
    this.filteredUsers = [];
    await this.loadUsers(1, query);

    // Reset selection if current index is out of bounds
    if (this.selectedUserIndex >= this.filteredUsers.length) {
      this.selectedUserIndex = Math.max(0, this.filteredUsers.length - 1);
    }
  }

  selectUser(user: User): void {
    const input = this.chatInput.nativeElement;
    const text = this.getPlainTextContent(input);
    const cursorPos = this.getCursorPosition(input);

    // Find the @ symbol position
    const mentionMatch = this.findMentionAtCursor(text, cursorPos);

    if (mentionMatch) {
      // Replace @query with @username and add space
      const beforeMention = text.substring(0, mentionMatch.startPos);
      const afterMention = text.substring(cursorPos);
      const mentionText = `@${user.name}`;

      const newText = beforeMention + mentionText + ' ' + afterMention;

      // Create unique mention tag with timestamp for uniqueness
      const uniqueId = `${user._id}_${Date.now()}_${Math.random()}`;
      const newTag: MentionTag = {
        id: user._id,
        name: user.name,
        startPos: mentionMatch.startPos,
        endPos: mentionMatch.startPos + mentionText.length,
        uniqueId: uniqueId,
      };

      // Update mention tags
      this.mentionTags.push(newTag);

      // Add to mentioned members if not already present
      if (!this.mentionedMembers.includes(user._id)) {
        this.mentionedMembers.push(user._id);
        this.selectedUsers.push(user);
      }

      // Update input with proper spacing
      this.updateInputWithMentions(newText);

      // Set cursor position after the mention and space
      setTimeout(() => {
        const newCursorPos = mentionMatch.startPos + mentionText.length + 1;
        this.setCursorPosition(input, newCursorPos);
      }, 50);
    }

    this.hideDropdown();
  }

  onUserHover(index: number): void {
    this.selectedUserIndex = index;
  }

  public removeMentionTag(tag: MentionTag): void {
    const input = this.chatInput.nativeElement;
    const text = this.getPlainTextContent(input);

    // Remove mention from text
    const beforeMention = text.substring(0, tag.startPos);
    const afterMention = text.substring(tag.endPos);
    const newText = beforeMention + afterMention;

    // Remove only this specific mention tag using uniqueId
    this.mentionTags = this.mentionTags.filter(
      (t) => t.uniqueId !== tag.uniqueId
    );

    // Check if this user has any other mentions remaining
    const hasOtherMentions = this.mentionTags.some((t) => t.id === tag.id);
    if (!hasOtherMentions) {
      this.mentionedMembers = this.mentionedMembers.filter(
        (id) => id !== tag.id
      );
      this.selectedUsers = this.selectedUsers.filter(
        (user) => user._id !== tag.id
      );
    }

    // Update mention tag positions after removal
    const removedLength = tag.endPos - tag.startPos;
    this.mentionTags.forEach((t) => {
      if (t.startPos > tag.endPos) {
        t.startPos -= removedLength;
        t.endPos -= removedLength;
      }
    });

    // Update input
    this.updateInputWithMentions(newText);

    // Set cursor position
    this.setCursorPosition(input, tag.startPos);
  }

  private updateInputWithMentions(text: string): void {
    const input = this.chatInput.nativeElement;

    // Store current cursor position before clearing
    const currentCursorPos = this.getCursorPosition(input);

    // Clear and set new content
    input.innerHTML = '';

    if (this.mentionTags.length === 0) {
      // No mentions, just add text
      const textNode = document.createTextNode(text);
      input.appendChild(textNode);
      this.inputText = text;
      return;
    }

    let lastIndex = 0;
    const sortedTags = [...this.mentionTags].sort(
      (a, b) => a.startPos - b.startPos
    );

    sortedTags.forEach((tag) => {
      // Add text before mention
      if (lastIndex < tag.startPos) {
        const textBefore = text.substring(lastIndex, tag.startPos);
        if (textBefore) {
          const textNode = document.createTextNode(textBefore);
          input.appendChild(textNode);
        }
      }

      // Add mention tag as styled span
      const mentionSpan = document.createElement('span');
      mentionSpan.className =
        'tw-bg-blue-100 tw-text-blue-800 tw-px-2 tw-py-1 tw-rounded tw-font-medium tw-inline-block tw-mx-1';
      mentionSpan.textContent = `@${tag.name}`;
      mentionSpan.contentEditable = 'false';
      mentionSpan.setAttribute('data-mention-id', tag.uniqueId);

      // Add click handler for removal
      mentionSpan.addEventListener('click', (e) => {
        e.preventDefault();
        this.removeMentionTag(tag);
      });

      input.appendChild(mentionSpan);
      lastIndex = tag.endPos;
    });

    // Add remaining text after last mention
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText) {
        const textNode = document.createTextNode(remainingText);
        input.appendChild(textNode);
      }
    }

    this.inputText = text;
  }

  private getCursorPosition(element: HTMLElement): number {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 0;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    return preCaretRange.toString().length;
  }

  private setCursorPosition(element: HTMLElement, position: number): void {
    const range = document.createRange();
    const selection = window.getSelection();

    let charCount = 0;
    let nodeStack: Node[] = [element];
    let node: Node | undefined;
    let foundPosition = false;

    while (!foundPosition && (node = nodeStack.pop())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharCount = charCount + (node.textContent?.length || 0);
        if (position >= charCount && position <= nextCharCount) {
          range.setStart(node, position - charCount);
          range.setEnd(node, position - charCount);
          foundPosition = true;
        }
        charCount = nextCharCount;
      } else {
        // Add child nodes to stack in reverse order
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }

    if (foundPosition) {
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  onDropdownScroll(event: any): void {
    const element = event.target;
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 5) {
      this.loadMoreUsers();
    }
  }

  // Updated loadMoreUsers method for API pagination
  async loadMoreUsers(): Promise<void> {
    if (this.isLoading || !this.hasMoreUsers) return;

    this.currentPage++;
    await this.loadUsers(this.currentPage, this.searchQuery);
  }

  async sendMessage(): Promise<void> {
    if (!this.inputText.trim()) return;

    // Convert @mentions to *mentions* format
    let processedText = this.inputText;
    this.mentionTags.forEach((tag) => {
      const mentionPattern = new RegExp(`@${tag.name}`, 'g');
      processedText = processedText.replace(mentionPattern, `*${tag.name}*`);
    });

    // const chatData: ChatData = {
    //   taskId: '',
    //   text: processedText,
    //   mentionedMembers: [...this.mentionedMembers],
    //   type: 'board',
    //   boardId: '6836fc455260ac3ab0ed07a5'
    // };

    const chatData: ChatData = {
      taskId: this.taskId || '',
      text: processedText,
      mentionedMembers: [...this.mentionedMembers],
      type: this.type || 'board',
      boardId: this.boardId || '',
    };

    try {
      const response = await this.taskService.AddComment(chatData);
      if (response) {
        console.log('Comment sent successfully:', response);
        this.messageSent.emit(response);
      }
    } catch (error) {
      swalHelper.showToast('Failed to send comment:', 'error');
    } finally {
      this.isSending = false;
      this.cdr.detectChanges();
    }
    // Reset form after sending
    this.resetForm();
  }

  private resetForm(): void {
    this.inputText = '';
    this.mentionTags = [];
    this.mentionedMembers = [];
    this.selectedUsers = [];
    this.isProcessingMention = false;
    this.selectedUserIndex = 0;
    this.searchQuery = '';
    this.currentPage = 1;
    this.hasMoreUsers = true;
    this.hideDropdown();

    const input = this.chatInput.nativeElement;
    input.innerHTML = '';
    input.focus();
  }

  getProfileImageUrl(imagePath: string): string {
    if (!imagePath) {
      return `${environment.imageURL}/task_management/profiles/default-profile-image.png`;
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    const cleanPath = imagePath.startsWith('/')
      ? imagePath.substring(1)
      : imagePath;
    return `${environment.imageURL}/${cleanPath}`;
  }

  trackByUserId(index: number, user: User): string {
    return user._id;
  }
}
