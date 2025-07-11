// customdata.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileCheckService } from 'src/app/services/profile-check.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-customdata',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customdata.component.html',
  styleUrl: './customdata.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomdataComponent implements OnInit, OnDestroy {
  showModal: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private profileCheckService: ProfileCheckService
  ) {}

  ngOnInit() {
    // Service se modal status listen karo
    this.profileCheckService.showModal$
      .pipe(takeUntil(this.destroy$))
      .subscribe(shouldShow => {
        this.showModal = shouldShow;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToProfile() {
    this.profileCheckService.hideModal();
    this.router.navigate(['/task-management/profile']);
  }
}