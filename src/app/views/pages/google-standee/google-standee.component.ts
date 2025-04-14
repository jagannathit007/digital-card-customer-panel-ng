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
  isAiReviewActive: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  displayedData: any[] = [];
  Math = Math;
  searchTerm: string = '';
  itemsPerPageOptions: number[] = [10, 25, 50, 100];
  filteredData: any[] = [];
  isLoading = false;
  isQrLoading = false;
  qrData: any = null;

  constructor(private cdRef: ChangeDetectorRef, private storage: AppStorage, public authService: AuthService,) {
    this.currentBcardId = this.storage.get(common.BUSINESS_CARD);
  }

  async ngOnInit() {
    this.isLoading = true;

    if (this.currentBcardId) {

      this.isQrLoading = true;

      this.qrData = await this.authService.getQrdetails(this.currentBcardId);
      this.isAiReviewActive = this.qrData.isAIFeatureAllowed;
      if (Array.isArray(this.qrData) && this.qrData.length > 0) {
        this.qrData = this.qrData[0];
      } else {
        this.qrData = this.qrData;
      }

      this.isQrLoading = false;

      this.reviewData = await this.authService.getReviews(this.currentBcardId);
      if (this.reviewData && this.reviewData.length > 0) {
        this.totalItems = this.reviewData.length;
        this.updateDisplayedData();
      } else {
        this.reviewData = [];
        this.displayedData = [];
      }

      this.isLoading = true;
    } else {
      console.log("No business card ID found in localStorage");
    }
    this.isLoading = false;
    this.cdRef.detectChanges();
  }

  updateDisplayedData() {
    this.filteredData = this.reviewData.filter(review => {
      if (!this.searchTerm) return true;

      const searchLower = this.searchTerm.toLowerCase();
      return (
        (review.name && review.name.toLowerCase().includes(searchLower)) ||
        (review.mobile && review.mobile.toLowerCase().includes(searchLower)) ||
        (review.email && review.email.toLowerCase().includes(searchLower)) ||
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

  async toggleAiReview() {
    this.isAiReviewActive = !this.isAiReviewActive;
    const aiReview = await this.authService.upadteAiToggle(this.currentBcardId, this.isAiReviewActive);
  }
}
