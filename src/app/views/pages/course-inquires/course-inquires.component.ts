import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-course-inquires',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>course-inquires works!</p>`,
  styleUrl: './course-inquires.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseInquiresComponent { }
