import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-technologies',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>technologies works!</p>`,
  styleUrl: './technologies.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnologiesComponent { }
