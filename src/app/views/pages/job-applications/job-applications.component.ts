import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-job-applications',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>job-applications works!</p>`,
  styleUrl: './job-applications.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobApplicationsComponent { }
