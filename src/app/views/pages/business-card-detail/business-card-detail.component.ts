import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-business-card-detail',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './business-card-detail.component.html',
  styleUrl: './business-card-detail.component.scss'
})
export class BusinessCardDetailComponent {
  rows = [
    {
      name: 'PRIYAM GANGRADE',
      mobile: '400053',
      email: 'priyam.vdesi@gmail.com',
      company: 'Non-leather Bags & Accessories',
      city: 'vesu',
      label: 'new',
      date: '18-01-2025',
    },
    // Add more rows here
  ];
  
  searchTerm: string = '';
  filteredRows: any[] = [];
  paginatedRows: any[] = [];
  currentPage: number = 1;
  rowsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];
  recordsOptions: number[] = [5, 10, 25, 50, 100];
  showAddCard: boolean = false;
  showManageLabel: boolean = false;


  toggleAddCard() {
    this.showAddCard = !this.showAddCard;
    this.showManageLabel = false; // Ensure the other toggle is closed
  }

  toggleManageLabel() {
    this.showManageLabel = !this.showManageLabel;
    this.showAddCard = false; // Ensure the other toggle is closed
  }

  ngOnInit() {
    this.filteredRows = [...this.rows];
    this.updatePagination();
  }

  searchTable() {
    this.filteredRows = this.rows.filter((row) => {
      return Object.values(row).some((value: any) =>
        value.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    });
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredRows.length / this.rowsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.paginateRows();
  }

  paginateRows() {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedRows = this.filteredRows.slice(startIndex, endIndex);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.paginateRows();
  }
}
