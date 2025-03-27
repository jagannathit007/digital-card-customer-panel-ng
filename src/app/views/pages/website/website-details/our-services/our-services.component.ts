import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-our-services',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
  ],
  templateUrl: './our-services.component.html',
  styleUrl: './our-services.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OurServicesComponent implements OnInit {
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;
  services: any[] = [];
  filteredServices: any[] = [];

  constructor() { }

  ngOnInit() {
    this.fetchServices();
  }

  fetchServices() {
    this.isLoading = true;
  
    this.services = [
      {
        title: 'Web Development',
        description: 'We provide professional web development services using modern technologies.',
        image: 'src/assets/images/web-development.png'
      },
      {
        title: 'Graphic Design',
        description: 'Our graphic design services include logo design, branding, and UI/UX design.',
        image: 'src/assets/images/graphic-design.png'
      }
    ];
  
    this.filteredServices = [...this.services];
    this.totalItems = this.services.length;
    this.isLoading = false;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredServices = [...this.services];
    } else {
      this.filteredServices = this.services.filter(service =>
        service.title.toLowerCase().includes(this.searchTerm.toLowerCase())
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
