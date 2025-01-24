import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-inquiry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-inquiry.component.html',
  styleUrl: './view-inquiry.component.scss'
})
export class ViewInquiryComponent {


  inquiries = [
    { name: 'John Doe', email: 'john@example.com', mobile: '1234567890', message: 'Inquiry message 1', date: '2025-01-24' },
    { name: 'Jane Smith', email: 'jane@example.com', mobile: '0987654321', message: 'Inquiry message 2', date: '2025-01-25' }
  ];

}
