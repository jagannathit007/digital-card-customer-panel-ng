import { ChangeDetectionStrategy, Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface TeamMemberData {
  fullName: string;
  email: string;
  mobile: string;
  role: string;
  skills: string[];
  experience: string;
  sendInviteEmail: boolean;
  activateImmediately: boolean;
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
    fullName: '',
    email: '',
    mobile: '',
    role: '',
    skills: [],
    experience: '',
    sendInviteEmail: true,
    activateImmediately: false
  };

  currentSkill: string = '';
  isSubmitting: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  closeModal(): void {
    this.closeModalEvent.emit();
  }

  addSkill(): void {
    if (this.currentSkill && this.currentSkill.trim()) {
      const skill = this.currentSkill.trim();
      
      // Check if skill already exists (case insensitive)
      const existingSkill = this.memberData.skills.find(
        s => s.toLowerCase() === skill.toLowerCase()
      );
      
      if (!existingSkill) {
        this.memberData.skills.push(skill);
        this.currentSkill = '';
        this.cdr.markForCheck();
      }
    }
  }

  removeSkill(index: number): void {
    if (index >= 0 && index < this.memberData.skills.length) {
      this.memberData.skills.splice(index, 1);
      this.cdr.markForCheck();
    }
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting) {
      return;
    }

    // Basic validation
    if (!this.memberData.fullName || !this.memberData.email || !this.memberData.role) {
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Emit the member data to parent component
      this.memberAdded.emit({ ...this.memberData });
      
      // Reset form
      this.resetForm();
      
      // Close modal
      this.closeModal();
      
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
      fullName: '',
      email: '',
      mobile: '',
      role: '',
      skills: [],
      experience: '',
      sendInviteEmail: true,
      activateImmediately: false
    };
    this.currentSkill = '';
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }

  // Utility methods for validation
  isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isMobileValid(mobile: string): boolean {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
  }

  // Method to handle role selection and set appropriate permissions
  onRoleChange(): void {
    // You can set default permissions based on role
    switch (this.memberData.role) {
      case 'admin':
        this.memberData.activateImmediately = true;
        break;
      case 'manager':
        this.memberData.activateImmediately = true;
        break;
      case 'member':
        this.memberData.activateImmediately = false;
        break;
      default:
        this.memberData.activateImmediately = false;
    }
    this.cdr.markForCheck();
  }
}