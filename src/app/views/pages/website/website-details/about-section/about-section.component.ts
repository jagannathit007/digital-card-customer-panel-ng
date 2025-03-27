import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
  ],
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutSectionComponent implements OnInit {
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;
  aboutCompanyList: any[] = [];
  filteredCompanyList: any[] = [];

  constructor() { }

  ngOnInit() {
    this.fetchCompanyDetails();
  }

  fetchCompanyDetails() {
    this.isLoading = true;

    this.aboutCompanyList = [
      {
        mission: 'To provide the best services to our customers.',
        vision: 'To be the leading company in the industry.',
        history: 'Founded in 2005, our company has been growing ever since.'
      },
      {
        mission: 'Deliver quality and value to clients.',
        vision: 'To create sustainable business solutions.',
        history: 'Started in 2010, expanding globally by 2020.'
      }
    ];

    this.filteredCompanyList = [...this.aboutCompanyList];
    this.totalItems = this.aboutCompanyList.length;
    this.isLoading = false;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredCompanyList = [...this.aboutCompanyList];
    } else {
      this.filteredCompanyList = this.aboutCompanyList.filter(company =>
        company.mission.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        company.vision.toLowerCase().includes(this.searchTerm.toLowerCase())
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
