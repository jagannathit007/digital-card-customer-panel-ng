import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskMemberAuthService } from 'src/app/services/task-member-auth.service';
import { TaskService } from 'src/app/services/task.service';

interface Member {
  _id: string;
  name: string;
  emailId: string;
  role: string;
  profileImage: string;
  isActive: boolean;
}

interface Board {
  _id: string;
  name: string;
  description: string;
  members: Member[];
}

interface TaskReport {
  boardId: string;
  boardName: string;
  memberName: string;
  taskTitle: string;
  columnName: string;
  status: string;
  dueDate: string;
  isCompleted: string;
  commentCount: string;
  attachmentCount: string;
  assignedTo: string;
}

interface ReportData {
  tasks: { [boardName: string]: TaskReport[] };
  pagination: {
    totalDocs: string;
    limit: string;
    page: string;
    totalPages: string;
    pagingCounter: string;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  };
}

@Component({
  selector: 'app-team-report',
  templateUrl: './team-report.component.html',
  styleUrl: './team-report.component.scss'
})
export class TeamReportComponent implements OnInit {

  // Data
  members: Member[] = [];
  boards: Board[] = [];
  reportData: ReportData | null = null;

  // Form Data
  selectedMemberId: string = 'all';
  selectedBoardId: string = 'all';
  selectedMonth: number | null = null;
  selectedYear: number | null = null;
  currentPage: number = 1;
  pageLimit: number = 10;

  // UI State
  isLoading: boolean = false;
  searchClicked: boolean = false;

  // Helper Data
  months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];
  years: number[] = [];
  selectedMemberName: string = '';

  // Make Math available in template
  Math = Math;

  constructor(
    private taskService: TaskService,
    private taskMemberAuthService: TaskMemberAuthService
  ) { }

  async ngOnInit(): Promise<void> {
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 20;
    for (let y = minYear; y <= currentYear; y++) {
      this.years.push(y);
    }
    this.selectedYear = currentYear;

    await this.loadMembers();
    await this.loadBoards();
  }

  // Data Loading Methods
  async loadMembers(): Promise<void> {
    try {
      const response = await this.taskService.GetAllMembers({});

      if (response) {
        this.members = response.docs.filter((member: Member) => member.isActive);
        console.log('Members loaded:', this.members);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    }
  }

  async loadBoards(): Promise<void> {
    try {
      const response = await this.taskService.GetBoardByAdmin({});

      if (response) {
        this.boards = response;
        console.log('Boards loaded:', this.boards);
      }
    } catch (error) {
      console.error('Error loading boards:', error);
    }
  }

  // Report Methods
  async getReport(): Promise<void> {
    this.isLoading = true;
    this.searchClicked = true;
    this.reportData = null;

    if (this.selectedMemberId !== 'all') {
      this.selectedMemberName = this.members.find(m => m._id === this.selectedMemberId)?.name || '';
    } else {
      this.selectedMemberName = '';
    }

    try {
      const memberId = this.selectedMemberId === 'all' ? this.members.map(m => m._id) : [this.selectedMemberId];
      const boardId = this.selectedBoardId === 'all' ? this.boards.map(b => b._id) : [this.selectedBoardId];

      const requestData = {
        memberId,
        boardId,
        month: this.selectedMonth || undefined,
        year: this.selectedYear || undefined,
        page: this.currentPage,
        limit: this.pageLimit
      };

      console.log('Getting report with data:', requestData);

      const response = await this.taskMemberAuthService.getMemberTaskReport(requestData);

      if (response) {
        this.reportData = response;
        console.log('Report data loaded:', this.reportData);
      } else {
        console.log('No data received in response');
      }

    } catch (error) {
      console.error('Error getting report:', error);
      alert('Failed to get report. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  // Pagination Methods
  changePage(page: number | null): void {
    if (page && page !== this.currentPage) {
      this.currentPage = page;
      this.getReport();
    }
  }

  // Helper Methods
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  trackByTaskId(index: number, task: TaskReport): string {
    return task.boardId + task.taskTitle + index;
  }

  get isSingleMemberSelected(): boolean {
    return this.selectedMemberId !== 'all' && !!this.selectedMemberName;
  }

  // Export Methods
  exportReport(): void {
    if (!this.reportData) return;

    console.log('Exporting report data:', this.reportData);

    // Here you can implement CSV/Excel export
    // For now, just log the data
    let csvContent = "Board Name,Task Title,Column,Status,Due Date,Completed,Comments,Attachments,Assigned To\n";

    Object.keys(this.reportData.tasks).forEach(boardName => {
      this.reportData!.tasks[boardName].forEach(task => {
        csvContent += `"${task.boardName}","${task.taskTitle}","${task.columnName}","${task.status}","${task.dueDate}","${task.isCompleted}","${task.commentCount}","${task.attachmentCount}","${task.assignedTo}"\n`;
      });
    });

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `task-report-${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
    window.URL.revokeObjectURL(url);
  }

}