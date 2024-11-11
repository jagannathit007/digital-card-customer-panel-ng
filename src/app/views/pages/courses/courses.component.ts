import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>courses works!</p>`,
  styleUrl: './courses.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursesComponent { }
