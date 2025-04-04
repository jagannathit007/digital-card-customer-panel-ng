import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { TooltipComponent } from 'src/app/views/partials/tooltip/tooltip.component';
import { TooltipDirective } from 'src/app/views/partials/tooltip/tooltip.directive';
import { ModalService } from 'src/app/core/utilities/modal';
declare var $:any;
@Component({
  selector: 'app-our-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    TooltipDirective
],
  templateUrl: './our-products.component.html',
  styleUrl: './our-products.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OurProductsComponent implements OnInit {

  constructor(
    private modal:ModalService
  ) { }

  ngOnInit() {
    this.fetchProducts();
  }

  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;
  products:any;
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

  

  fetchProducts() {
    this.isLoading = true;
  
    this.products = [
      {
        name: 'Product 1',
        price: 29.99,
        description: 'This is a sample product.',
        images: [
          '../../../../../../assets/images/avatar.png',
          '../../../../../../assets/images/logo.png',
          '../../../../../../assets/images/title.png',
          '../../../../../../assets/images/avatar.png',
          '../../../../../../assets/images/logo.png',
        ]
      },
      {
        name: 'Product 2',
        price: 49.99,
        description: 'Another sample product.',
        images: [
          '../../../../../../assets/images/avatar.png',
          '../../../../../../assets/images/logo.png',
          '../../../../../../assets/images/title.png',
          '../../../../../../assets/images/avatar.png',
          '../../../../../../assets/images/logo.png',
        ]
      }
    ];
  
    this.filteredProducts = [...this.products];
    this.totalItems = this.products.length;
    this.isLoading = false;
    console.log("filter products",this.filteredProducts);
    
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter((product:any) =>
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

imageForCarousel:any
  onOpenImageModal(image:any){
    this.imageForCarousel=image
    console.log(this.imageForCarousel);
    
    this.modal.open('image-carousel');
  }
}
