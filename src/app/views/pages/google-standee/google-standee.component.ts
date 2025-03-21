import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-google-standee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './google-standee.component.html',
  styleUrl: './google-standee.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleStandeeComponent implements OnInit {

  currentBcardId: string = "";
  reviewData: any[] = [];
  isEnrollActive: boolean = false;
  isAiReviewActive: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  displayedData: any[] = [];
  Math = Math;
  searchTerm: string = '';
  itemsPerPageOptions: number[] = [10, 25, 50, 100];
  filteredData: any[] = [];

  constructor(private cdRef: ChangeDetectorRef, private storage: AppStorage, public authService: AuthService,) {
    this.currentBcardId = this.storage.get(common.BUSINESS_CARD);
  }

  async ngOnInit() {
    console.log(this.currentBcardId);

    if (this.currentBcardId) {
      this.reviewData = await this.authService.getReviews(this.currentBcardId);
      console.log('Review data from API:', this.reviewData);

      if (this.reviewData && this.reviewData.length > 0) {
        this.totalItems = this.reviewData.length;
        this.updateDisplayedData();
        console.log('Displayed data after update:', this.displayedData);
      } else {
        console.log('No review data returned from API');
        this.reviewData = [];
        this.displayedData = [];
      }
    } else {
      console.log("No business card ID found in localStorage");
    }
    this.cdRef.detectChanges();
  }

  updateDisplayedData() {
    this.filteredData = this.reviewData.filter(review => {
      if (!this.searchTerm) return true;

      const searchLower = this.searchTerm.toLowerCase();
      return (
        (review.name && review.name.toLowerCase().includes(searchLower)) ||
        (review.mobile && review.mobile.toLowerCase().includes(searchLower)) ||
        (review.message && review.message.toLowerCase().includes(searchLower))
      );
    });

    // Update total items based on filtered data
    this.totalItems = this.filteredData.length;

    // Calculate correct page number if current page is out of bounds
    const maxPage = Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }

    // Get paginated data
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.totalItems);
    this.displayedData = this.filteredData.slice(startIndex, endIndex);
  }
  // Method to handle search input changes
  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.currentPage = 1; // Reset to first page when searching
    this.updateDisplayedData();
  }

  // Method to handle items per page changes
  onItemsPerPageChange(event: any) {
    this.itemsPerPage = parseInt(event.target.value, 10);
    this.currentPage = 1; // Reset to first page when changing items per page
    this.updateDisplayedData();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedData();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedData();
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
  }

  toggleEnroll(): void {
    this.isEnrollActive = !this.isEnrollActive;
  }

  toggleAiReview(): void {
    this.isAiReviewActive = !this.isAiReviewActive;
  }
}
