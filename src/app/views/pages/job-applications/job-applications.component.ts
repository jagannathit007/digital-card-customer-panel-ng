import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-job-applications',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './job-applications.component.html',
  styleUrl: './job-applications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobApplicationsComponent {
  onPageChanged(page: any) {}
}
