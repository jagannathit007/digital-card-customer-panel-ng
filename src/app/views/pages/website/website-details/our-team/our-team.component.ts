import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-our-team',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule
  ],
  templateUrl: './our-team.component.html',
  styleUrl: './our-team.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OurTeamComponent implements OnInit {
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;
  teamMembers: any[] = [];
  filteredMembers: any[] = [];

  constructor() {}

  ngOnInit() {
    this.fetchTeamMembers();
  }

  fetchTeamMembers() {
    this.isLoading = true;

    // Dummy Team Data
    this.teamMembers = [
      {
        name: 'John Doe',
        role: 'Software Engineer',
        image: 'src/assets/images/john.jpg'
      },
      {
        name: 'Jane Smith',
        role: 'UI/UX Designer',
        image: 'src/assets/images/jane.jpg'
      }
    ];

    this.filteredMembers = [...this.teamMembers];
    this.totalItems = this.teamMembers.length;
    this.isLoading = false;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredMembers = [...this.teamMembers];
    } else {
      this.filteredMembers = this.teamMembers.filter(member =>
        member.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(this.searchTerm.toLowerCase())
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