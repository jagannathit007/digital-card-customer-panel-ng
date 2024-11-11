import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-contact-inquires',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>contact-inquires works!</p>`,
  styleUrl: './contact-inquires.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactInquiresComponent { }
