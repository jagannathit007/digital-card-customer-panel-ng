import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-seo-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
  ],
  templateUrl: './seo-details.component.html',
  styleUrl: './seo-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeoDetailsComponent implements OnInit {
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;
  seoDetails: any[] = [];
  filteredSeoDetails: any[] = [];

  constructor() { }

  ngOnInit() {
    this.fetchSeoDetails();
  }

  fetchSeoDetails() {
    this.isLoading = true;
  
    this.seoDetails = [
      {
        metaTitle: 'Best SEO Practices',
        metaDescription: 'Learn the best SEO practices to rank higher on search engines.',
        image: 'src/assets/images/seo1.png',
        keywords: 'SEO, ranking, optimization'
      },
      {
        metaTitle: 'Keyword Research Tips',
        metaDescription: 'Discover how to find the best keywords for your website.',
        image: 'src/assets/images/seo2.png',
        keywords: 'keywords, research, marketing'
      }
    ];
  
    this.filteredSeoDetails = [...this.seoDetails];
    this.totalItems = this.seoDetails.length;
    this.isLoading = false;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredSeoDetails = [...this.seoDetails];
    } else {
      this.filteredSeoDetails = this.seoDetails.filter(detail =>
        detail.metaTitle.toLowerCase().includes(this.searchTerm.toLowerCase())
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
