import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seo-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './seo-details.component.html',
  styleUrl: './seo-details.component.scss',
})
export class SeoDetailsComponent implements OnInit {

  totalItems: number = 0;
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

  

}
