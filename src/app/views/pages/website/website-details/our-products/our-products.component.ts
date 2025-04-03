import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-our-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
  ],
  templateUrl: './our-products.component.html',
  styleUrl: './our-products.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OurProductsComponent implements OnInit {
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;
  products: any[] = [];
  filteredProducts: any[] = [];

  sliderOptions = {
    loop: true,
    margin: 10,
    nav: true,
    dots: false,
    autoplay: true,
    autoHeight: true,
    responsive: {
      0: { items: 1 },
      600: { items: 3 },
      1000: { items: 5 }
    }
  };

  constructor() { }

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.isLoading = true;
  
    this.products = [
      {
        name: 'Product 1',
        price: 29.99,
        description: 'This is a sample product.',
        images: ['']
      },
      {
        name: 'Product 2',
        price: 49.99,
        description: 'Another sample product.',
        images: ['']
      }
    ];
  
    this.filteredProducts = [...this.products];
    this.totalItems = this.products.length;
    this.isLoading = false;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase())
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
