// import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
// import { Modal } from 'bootstrap';
// import { common } from 'src/app/core/constants/common';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { TaskService } from 'src/app/services/task.service';
// import { swalHelper } from 'src/app/core/constants/swal-helper';
// import { environment } from 'src/env/env.local';

// @Component({
//   selector: 'app-add-comments',
//   standalone: true,
//   imports: [],
//   templateUrl: './add-comments.component.html',
//   styleUrl: './add-comments.component.scss'
// })
// export class AddCommentsComponent implements OnInit {
  
//   ngOnInit(): void {
//     console.log("there is chatpage")
//   }

// }


import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  styleUrl: './add-comments.component.scss'
})
export class AddCommentsComponent implements OnInit, OnDestroy {
  @ViewChild('chatInput', { static: false }) chatInput!: ElementRef<HTMLDivElement>;
  @Output() messageSent = new EventEmitter<ChatData>();

  // Dummy data
  private allUsers: User[] = [
    {
      _id: "684d4f7009a3bb3f943af737",
      name: "wregtrtgh",
      profileImage: "images/logo.png",
      role: "manager",
      id: "684d4f7009a3bb3f943af737"
    },
    {
      _id: "6847fe94b500d38c3460e9d3",
      name: "abcd",
      profileImage: "images/logo.png",
      role: "manager",
      id: "6847fe94b500d38c3460e9d3"
    },
    {
      _id: "6847fe94b500d38c3460e9d4",
      name: "Alice Johnson",
      profileImage: "images/logo.png",
      role: "developer",
      id: "6847fe94b500d38c3460e9d4"
    },
    {
      _id: "6847fe94b500d38c3460e9d5",
      name: "Bob Smith",
      profileImage: "images/logo.png",
      role: "designer",
      id: "6847fe94b500d38c3460e9d5"
    },
    {
      _id: "6847fe94b500d38c3460e9d6",
      name: "Charlie Brown",
      profileImage: "images/logo.png",
      role: "tester",
      id: "6847fe94b500d38c3460e9d6"
    },
    {
      _id: "6847fe94b500d38c3460e9d7",
      name: "David Wilson",
      profileImage: "images/logo.png",
      role: "manager",
      id: "6847fe94b500d38c3460e9d7"
    },
    {
      _id: "6847fe94b500d38c3460e9d8",
      name: "Emma Davis",
      profileImage: "images/logo.png",
      role: "developer",
      id: "6847fe94b500d38c3460e9d8"
    },
    {
      _id: "6847fe94b500d38c3460e9d9",
      name: "Frank Miller",
      profileImage: "images/logo.png",
      role: "designer",
      id: "6847fe94b500d38c3460e9d9"
    },
     {
      _id: "6847fe94b500d38c3460e9d6",
      name: "Charlie Brown",
      profileImage: "images/logo.png",
      role: "tester",
      id: "6847fe94b500d38c3460e9d6"
    },
    {
      _id: "6847fe94b500d38c3460e9d7",
      name: "David Wilson",
      profileImage: "images/logo.png",
      role: "manager",
      id: "6847fe94b500d38c3460e9d7"
    },
    {
      _id: "6847fe94b500d38c3460e9d8",
      name: "Emma Davis",
      profileImage: "images/logo.png",
      role: "developer",
      id: "6847fe94b500d38c3460e9d8"
    },
    {
      _id: "6847fe94b500d38c3460e9d9",
      name: "Frank Miller",
      profileImage: "images/logo.png",
      role: "designer",
      id: "6847fe94b500d38c3460e9d9"
    }
  ];

  // Component state
  inputText: string = '';
  showDropdown: boolean = false;
  filteredUsers: User[] = [];
  selectedUsers: User[] = [];
  mentionedMembers: string[] = [];
  dropdownPosition = { top: 0, left: 0 };
  currentMentionQuery: string = '';
  currentPage: number = 1;
  usersPerPage: number = 5;
  isLoading: boolean = false;
  
  // Mention tracking
  private mentionTags: MentionTag[] = [];
  private lastCursorPosition: number = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log("Chat component initialized");
    this.loadUsers();
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.closeDropdown.bind(this));
  }

  loadUsers(page: number = 1): void {
    this.isLoading = true;
    
    // Simulate API call with pagination
    setTimeout(() => {
      const startIndex = (page - 1) * this.usersPerPage;
      const endIndex = startIndex + this.usersPerPage;
      const paginatedUsers = this.allUsers.slice(startIndex, endIndex);
      
      if (page === 1) {
        this.filteredUsers = paginatedUsers;
      } else {
        this.filteredUsers = [...this.filteredUsers, ...paginatedUsers];
      }
      
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 300);
  }

  onInputChange(event: any): void {
    const input = event.target;
    const value = input.textContent || '';
    const cursorPos = this.getCursorPosition(input);
    
    this.inputText = value;
    this.lastCursorPosition = cursorPos;

    // Check for @ mention
    const mentionMatch = this.findMentionAtCursor(value, cursorPos);
    
    if (mentionMatch) {
      this.currentMentionQuery = mentionMatch.query;
      this.showMentionDropdown(mentionMatch.startPos);
      this.filterUsers(mentionMatch.query);
    } else {
      this.hideDropdown();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    const input = event.target as HTMLElement;
    
    if (event.key === 'Backspace') {
      this.handleBackspace(event, input);
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    } else if (this.showDropdown) {
      this.handleDropdownNavigation(event);
    }
  }

  private handleBackspace(event: KeyboardEvent, input: HTMLElement): void {
    const cursorPos = this.getCursorPosition(input);
    const textContent = input.textContent || '';
    
    // Check if cursor is at the end of a mention tag
    const mentionTag = this.findMentionTagAtPosition(cursorPos - 1);
    
    if (mentionTag) {
      event.preventDefault();
      this.removeMentionTag(mentionTag);
    }
  }

  private handleDropdownNavigation(event: KeyboardEvent): void {
    // Handle arrow keys and enter for dropdown navigation
    // Implementation for keyboard navigation in dropdown
  }

  private findMentionAtCursor(text: string, cursorPos: number): { query: string; startPos: number } | null {
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
    
    return { query, startPos: atPos };
  }

  private findMentionTagAtPosition(pos: number): MentionTag | null {
    return this.mentionTags.find(tag => 
      pos >= tag.startPos && pos <= tag.endPos
    ) || null;
  }

  private showMentionDropdown(atPosition: number): void {
    this.showDropdown = true;
    this.currentPage = 1;
    
    // Calculate dropdown position
    const input = this.chatInput.nativeElement;
    const rect = input.getBoundingClientRect();
    
    this.dropdownPosition = {
      top: rect.bottom + 5,
      left: rect.left
    };
    
    // Add click outside listener
    setTimeout(() => {
      document.addEventListener('click', this.closeDropdown.bind(this));
    });
  }

  private hideDropdown(): void {
    this.showDropdown = false;
    document.removeEventListener('click', this.closeDropdown.bind(this));
  }

  private closeDropdown(event?: Event): void {
    if (event && this.chatInput && this.chatInput.nativeElement.contains(event.target as Node)) {
      return;
    }
    this.hideDropdown();
  }

  private filterUsers(query: string): void {
    if (query.trim() === '') {
      this.filteredUsers = this.allUsers.slice(0, this.usersPerPage);
    } else {
      this.filteredUsers = this.allUsers
        .filter(user => user.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, this.usersPerPage);
    }
    this.cdr.detectChanges();
  }

  selectUser(user: User): void {
    const input = this.chatInput.nativeElement;
    const text = input.textContent || '';
    const cursorPos = this.lastCursorPosition;
    
    // Find the @ symbol position
    const mentionMatch = this.findMentionAtCursor(text, cursorPos);
    
    if (mentionMatch) {
      // Replace @query with @username
      const beforeMention = text.substring(0, mentionMatch.startPos);
      const afterMention = text.substring(cursorPos);
      const mentionText = `@${user.name}`;
      
      const newText = beforeMention + mentionText + afterMention;
      
      // Create mention tag
      const newTag: MentionTag = {
        id: user.id,
        name: user.name,
        startPos: mentionMatch.startPos,
        endPos: mentionMatch.startPos + mentionText.length
      };
      
      // Update mention tags
      this.mentionTags.push(newTag);
      
      // Add to mentioned members if not already present
      if (!this.mentionedMembers.includes(user.id)) {
        this.mentionedMembers.push(user.id);
        this.selectedUsers.push(user);
      }
      
      // Update input
      this.updateInputWithMentions(newText);
    }
    
    this.hideDropdown();
  }

  public removeMentionTag(tag: MentionTag): void {
    const input = this.chatInput.nativeElement;
    const text = input.textContent || '';
    
    // Remove mention from text
    const beforeMention = text.substring(0, tag.startPos);
    const afterMention = text.substring(tag.endPos);
    const newText = beforeMention + afterMention;
    
    // Remove from arrays
    this.mentionTags = this.mentionTags.filter(t => t.id !== tag.id);
    this.mentionedMembers = this.mentionedMembers.filter(id => id !== tag.id);
    this.selectedUsers = this.selectedUsers.filter(user => user.id !== tag.id);
    
    // Update input
    this.updateInputWithMentions(newText);
    
    // Set cursor position
    this.setCursorPosition(input, tag.startPos);
  }

  private updateInputWithMentions(text: string): void {
    const input = this.chatInput.nativeElement;
    
    // Clear and set new content
    input.innerHTML = '';
    
    let lastIndex = 0;
    const sortedTags = [...this.mentionTags].sort((a, b) => a.startPos - b.startPos);
    
    sortedTags.forEach(tag => {
      // Add text before mention
      if (lastIndex < tag.startPos) {
        const textNode = document.createTextNode(text.substring(lastIndex, tag.startPos));
        input.appendChild(textNode);
      }
      
      // Add mention tag
      const mentionSpan = document.createElement('span');
      mentionSpan.className = 'tw-bg-blue-100 tw-text-blue-800 tw-px-2 tw-py-1 tw-rounded tw-font-medium tw-inline-block tw-mx-1';
      mentionSpan.textContent = `@${tag.name}`;
      mentionSpan.contentEditable = 'false';
      input.appendChild(mentionSpan);
      
      lastIndex = tag.endPos;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      const textNode = document.createTextNode(text.substring(lastIndex));
      input.appendChild(textNode);
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
    
    if (element.childNodes.length > 0) {
      range.setStart(element.childNodes[0], Math.min(position, element.textContent?.length || 0));
    } else {
      range.setStart(element, 0);
    }
    
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  onDropdownScroll(event: any): void {
    const element = event.target;
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 5) {
      this.loadMoreUsers();
    }
  }

  loadMoreUsers(): void {
    if (this.isLoading) return;
    
    const maxPage = Math.ceil(this.allUsers.length / this.usersPerPage);
    if (this.currentPage < maxPage) {
      this.currentPage++;
      this.loadUsers(this.currentPage);
    }
  }

  sendMessage(): void {
    if (!this.inputText.trim()) return;
    
    // Convert @mentions to *mentions* format
    let processedText = this.inputText;
    this.mentionTags.forEach(tag => {
      const mentionPattern = new RegExp(`@${tag.name}`, 'g');
      processedText = processedText.replace(mentionPattern, `*${tag.name}*`);
    });
    
    const chatData: ChatData = {
      taskId: '',
      text: processedText,
      mentionedMembers: [...this.mentionedMembers],
      type: '',
      boardId: ''
    };
    
    console.log('Message Data:', chatData);
    
    // Show success message
    this.showSuccessMessage();
    
    // Emit the data
    this.messageSent.emit(chatData);
    
    // Reset form
    this.resetForm();
  }

  private showSuccessMessage(): void {
    // You can replace this with your preferred notification system
    const successDiv = document.createElement('div');
    successDiv.className = 'tw-fixed tw-top-4 tw-right-4 tw-bg-green-500 tw-text-white tw-px-4 tw-py-2 tw-rounded tw-shadow-lg tw-z-50 tw-transition-all tw-duration-300';
    successDiv.textContent = 'Message sent successfully!';
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }

  private resetForm(): void {
    this.inputText = '';
    this.mentionTags = [];
    this.mentionedMembers = [];
    this.selectedUsers = [];
    this.hideDropdown();
    
    const input = this.chatInput.nativeElement;
    input.innerHTML = '';
    input.focus();
  }

  getProfileImageUrl(imagePath: string): string {
    // You can modify this based on your actual image serving logic
    return imagePath.includes('http') ? imagePath : `assets/${imagePath}`;
  }

  trackByUserId(index: number, user: User): string {
  return user.id;
}
}