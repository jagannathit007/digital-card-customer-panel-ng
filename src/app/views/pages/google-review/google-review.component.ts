import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-google-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './google-review.component.html',
  styleUrl: './google-review.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleReviewComponent implements OnInit {
  // Toggle status for enrollment button
  isEnrollActive: boolean = false;
  
  // Variables for search and pagination
  searchTerm: string = '';
  itemsPerPage: number = 10;
  p: number = 1;
  totalItems: number = 0;
  isLoading: boolean = false;
  isAiReviewActive: boolean = false;
  
  constructor() { }

  ngOnInit(): void {
    // Initialize component
  }
  
  // Toggle enrollment status
  toggleEnroll(): void {
    this.isEnrollActive = !this.isEnrollActive;
  }

  toggleAiReview(): void {
    this.isAiReviewActive = !this.isAiReviewActive;
  }
  
  // Methods for pagination and search (placeholders)
  onSearch(): void {
    // Implement search functionality
  }
  
  onItemsPerPageChange(): void {
    // Handle items per page change
  }
  
  pageChangeEvent(event: number): void {
    this.p = event;
    // Load data for the current page
  }
}
