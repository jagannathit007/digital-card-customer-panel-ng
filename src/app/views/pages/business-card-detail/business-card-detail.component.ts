import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';

declare var $: any;

@Component({
  selector: 'app-business-card-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './business-card-detail.component.html',
  styleUrl: './business-card-detail.component.scss',
})
export class BusinessCardDetailComponent {
  scannedCards: any;
  keywords: any[] = [];
  p: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  searchTerm: string = '';
  editCard: any = {};

  constructor(private authService: AuthService, private storage: AppStorage) {}

  ngOnInit(): void {
    this.getKeywords();
    this.fetchScannedCards();
  }

  fetchScannedCards = async () => {
    let query = {
      search: this.searchTerm,
      page: this.p,
      limit: this.itemsPerPage,
    };
    let response = await this.authService.getScannedCards(query);
    if (response != null) {
      this.scannedCards = response;
      this.totalItems = response.totalDocs;
    }
  };

  updateScannedCard = async () => {
    let response = await this.authService.updateScannedCard(this.editCard);
    if (response != null) {
      this.fetchScannedCards();
      $('#editModal').modal('hide');
      swalHelper.showToast('Card Updated Sucessfully!', 'success');
    }
  };
  
  selectedKeyword = "";
  getKeywords = async () => {
    let response = await this.authService.getKeywords({});
    if (response != null) {
      this.keywords = response;
      this.keywords.sort();
    }
  };

  deleteScannedCard = async (id: String) => {
    let confirm = await swalHelper.confirmation(
      'Delete',
      'Do you really want to delete?',
      'warning'
    );
    if (confirm.isConfirmed) {
      let response = await this.authService.deleteScannedCard(id);
      if (response != null) {
        this.p = 1;
        this.fetchScannedCards();
        swalHelper.showToast('Card Updated Sucessfully!', 'success');
      }
    }
  };

  exportExcel = async() => {
    let userId = this.storage.get(common.USER_DATA)._id;
    let businessCardId = this.storage.get(common.BUSINESS_CARD);
    let link = `${environment.baseURL}/${environment.route}/download-excel/scanned-cards?u=${userId}&b=${businessCardId}&k=${this.selectedKeyword}`;
    window.open(encodeURI(link), "_blank");
  }

  openEditModal(card: any): void {
    this.editCard = { ...card };
    $('#editModal').modal('show');
  }

  pageChangeEvent(event: number): void {
    this.p = event;
    this.fetchScannedCards();
  }

  onSearch(): void {
    this.p = 1;
    this.fetchScannedCards();
  }

  onItemsPerPageChange(): void {
    this.p = 1;
    this.fetchScannedCards();
  }
}
