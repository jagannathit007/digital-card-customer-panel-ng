import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-hiring-inquires',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>hiring-inquires works!</p>`,
  styleUrl: './hiring-inquires.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HiringInquiresComponent { }
