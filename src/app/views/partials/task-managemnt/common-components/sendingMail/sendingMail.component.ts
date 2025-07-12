import { TaskService } from 'src/app/services/task.service';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from 'src/env/env.local';

export interface Member {
  _id: string;
  name: string;
  mobile: string;
  emailId: string;
  profileImage: string;
  role: string;
  skills: string[];
  experience: string;
  isVerified: boolean;
  isActive: boolean;
}

@Component({
  selector: 'app-sending-mail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sendingMail.component.html',
  styleUrl: './sendingMail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendingMailComponent implements OnInit {
  @Input() member!: Member;
  @Input() isVisible: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() mailSent = new EventEmitter<Member>();

  baseURL = environment.imageURL;
  isAnimating: boolean = false;
  showSuccess: boolean = false;

  constructor(
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.isVisible) {
      // Don't auto-start animation on init
      this.cdr.detectChanges();
    }
  }

  async startAnimation() {
    this.isAnimating = true;
    this.showSuccess = false;
    this.cdr.detectChanges(); // Trigger change detection

    try {
      const result = await this.taskService.ReinviteUser({
        memberId: this.member._id,
      });

      if (result) {
        this.isAnimating = false;
        this.showSuccess = true;
        this.cdr.detectChanges(); // Trigger change detection for success state
        
        setTimeout(() => {
          this.mailSent.emit(this.member);
          this.onClose();
        }, 4000);
      } else {
        // Handle failure case
        this.isAnimating = false;
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      this.isAnimating = false;
      this.cdr.detectChanges();
    }
  }

  onClose() {
    this.closeModal.emit();
    this.resetComponent();
  }

  private resetComponent() {
    this.isAnimating = false;
    this.showSuccess = false;
    this.cdr.detectChanges();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}