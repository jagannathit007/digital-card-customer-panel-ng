import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-hiring-inquires',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './hiring-inquires.component.html',
  styleUrl: './hiring-inquires.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HiringInquiresComponent {
  onPageChanged(page: any) {}
}
