import { TaskService } from 'src/app/services/task.service';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskMemberAuthService } from 'src/app/services/task-member-auth.service';

export interface TeamMemberData {
  name: string;
  emailId: string;
  // mobile: string;
  role: string;
  password: string;
  // skills: string[];
  // experience: string;
  // sendInviteEmail: boolean;
  // activateImmediately: boolean;
}

@Component({
  selector: 'app-add-team-member',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addTeamMember.component.html',
  styleUrl: './addTeamMember.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTeamMemberComponent {
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() memberAdded = new EventEmitter<TeamMemberData>();

  memberData: TeamMemberData = {
    name: '',
    emailId: '',
    // mobile: '',
    role: '',
    password: '',
    // skills: [],
    // experience: '',
    // sendInviteEmail: true,
    // activateImmediately: false
  };

  // currentSkill: string = '';
  isSubmitting: boolean = false;
  availableRoles: string[] = ['member'];
  showPassword: boolean = false;

  constructor(private cdr: ChangeDetectorRef, public taskMemberAuthService: TaskMemberAuthService, public taskService: TaskService) {
    // Initialize memberData with default values if needed
    // this.memberData = { ...this.memberData };
  }

  ngOnInit(): void {
    this.showAvailableRoles();
  }

  closeModal(): void {
    this.closeModalEvent.emit();
  }

  // addSkill(): void {
  //   if (this.currentSkill && this.currentSkill.trim()) {
  //     const skill = this.currentSkill.trim();

  //     // Check if skill already exists (case insensitive)
  //     const existingSkill = this.memberData.skills.find(
  //       s => s.toLowerCase() === skill.toLowerCase()
  //     ); 

  //     if (!existingSkill) {
  //       this.memberData.skills.push(skill);
  //       this.currentSkill = '';
  //       this.cdr.markForCheck();
  //     }
  //   }
  // }

  // removeSkill(index: number): void {
  //   if (index >= 0 && index < this.memberData.skills.length) {
  //     this.memberData.skills.splice(index, 1);
  //     this.cdr.markForCheck();
  //   }
  // }

  async onSubmit(): Promise<void> {
    console.log('Submitting member data:', this.memberData);
    if (this.isSubmitting) {
      return;
    }

    // Basic validation
    if (!this.memberData.name || !this.memberData.emailId || !this.memberData.password || !this.memberData.role) {
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    try {
      // Simulate API call delay
      // await new Promise(resolve => setTimeout(resolve, 2000));
      const result = await this.taskService.AddTeamMember(this.memberData);

      if (result) {


        // Emit the member data to parent component
        this.memberAdded.emit({ ...this.memberData });

        // Reset form
        this.resetForm();

        // Close modal
        this.closeModal();
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      // Handle error - you might want to show an error message
    } finally {
      this.isSubmitting = false;
      this.cdr.markForCheck();
    }
  }

  private resetForm(): void {
    this.memberData = {
      name: '',
      emailId: '',
      // mobile: '',
      role: '',
      password: '',
      // skills: [],
      // experience: '',
      // sendInviteEmail: true,
      // activateImmediately: false
    };
    // this.currentSkill = '';
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }

  // Utility methods for validation
  isEmailValid(emailId: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailId);
  }

  isMobileValid(mobile: string): boolean {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
  }

  isPasswordValid(password: string): boolean {
    return password.length >= 6;
  }

  // Method to handle role selection
  showAvailableRoles(): void {
    // You can set default permissions based on role
    switch (this.taskMemberAuthService.memberDetails.role) {
      case 'admin':
        this.availableRoles = ['editor', 'manager', 'leader', 'member'];
        break;
      case 'editor':
        this.availableRoles = ['manager', 'leader', 'member'];
        break;
      case 'manager':
        this.availableRoles = ['leader', 'member'];
        break;
      default:
        this.availableRoles = [];
    }
    this.cdr.markForCheck();
  }
}