import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-our-clients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
  ],
  templateUrl: './our-clients.component.html',
  styleUrl: './our-clients.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OurClientsComponent implements OnInit {
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;
  clients: any[] = [];
  filteredClients: any[] = [];

  constructor() { }

  ngOnInit() {
    this.fetchClients();
  }

  fetchClients() {
    this.isLoading = true;
  
    this.clients = [
      {
        name: 'Company A',
        website: 'https://www.company-a.com',
        logo: 'src/assets/images/company-a-logo.png'
      },
      {
        name: 'Company B',
        website: 'https://www.company-b.com',
        logo: 'src/assets/images/company-b-logo.png'
      }
    ];
  
    this.filteredClients = [...this.clients];
    this.totalItems = this.clients.length;
    this.isLoading = false;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredClients = [...this.clients];
    } else {
      this.filteredClients = this.clients.filter(client =>
        client.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        client.website.toLowerCase().includes(this.searchTerm.toLowerCase())
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