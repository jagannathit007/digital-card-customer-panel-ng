import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
  ],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsComponent implements OnInit {
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;
  testimonialList: any[] = [];
  filteredTestimonialList: any[] = [];

  constructor() {}

  ngOnInit() {
    this.fetchTestimonials();
  }

  fetchTestimonials() {
    this.isLoading = true;

    this.testimonialList = [
      {
        image: 'https://via.placeholder.com/50',
        rating: 5,
        clientName: 'John Doe',
        feedback: 'Excellent service and great experience!',
      },
      {
        image: 'https://via.placeholder.com/50',
        rating: 4,
        clientName: 'Jane Smith',
        feedback: 'Very satisfied with the product quality.',
      }
    ];

    this.filteredTestimonialList = [...this.testimonialList];
    this.totalItems = this.testimonialList.length;
    this.isLoading = false;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredTestimonialList = [...this.testimonialList];
    } else {
      this.filteredTestimonialList = this.testimonialList.filter(testimonial =>
        testimonial.clientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        testimonial.feedback.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  onItemsPerPageChange() {
    this.p = 1;
  }

  pageChangeEvent(event: number) {
    this.p = event;
  }
}
