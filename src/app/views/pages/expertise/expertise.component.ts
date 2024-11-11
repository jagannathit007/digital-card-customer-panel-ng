import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-expertise',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>expertise works!</p>`,
  styleUrl: './expertise.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpertiseComponent { }
