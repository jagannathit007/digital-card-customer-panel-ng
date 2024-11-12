import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-contact-inquires',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './contact-inquires.component.html',
  styleUrl: './contact-inquires.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactInquiresComponent {
  onPageChanged(page: any) {}
}
