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
  createdAt: string;
  completedAt: string;
  isCompleted: string;
  commentCount: string;
  attachmentCount: string;
  assignedTo: string;
}

interface ReportData {
  tasks: { [boardName: string]: { [memberName: string]: TaskReport[] } };
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
  styleUrl: './team-report.component.scss',
})
export class TeamReportComponent implements OnInit {
  // Data
  members: Member[] = [];
  boards: Board[] = [];
  reportData: ReportData | null = null;

  // Form Data
  selectedMemberId: string = 'all';
  selectedMemberName: string = '';
  selectedBoardId: string = 'all';
  selectedDateField: string = '';
  selectedMonth: number | null | 'all' = null;
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
  years: number[] = [2023, 2024, 2025, 2026];

  // Make Math available in template
  Math = Math;

  constructor(
    private taskService: TaskService,
    private taskMemberAuthService: TaskMemberAuthService
  ) {}

  ngOnInit(): void {
    this.loadMembers();
    this.loadBoards();
  }

  onYearChange(): void {
    if (this.selectedYear !== null && !this.selectedDateField) {
      this.selectedDateField = 'dueDate';
    }
  }

  // Data Loading Methods
  async loadMembers(): Promise<void> {
    try {
      const response = await this.taskService.GetAllMembers({});
      if (response) {
        this.members = response.docs.filter((member: Member) => member.isActive);
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
      const memberId = this.selectedMemberId === 'all' ? this.members.map(m => m._id) : this.selectedMemberId;
      const boardId = this.selectedBoardId === 'all' ? this.boards.map(b => b._id) : [this.selectedBoardId];

      const requestData: any = {
        memberId,
        boardId,
        page: this.currentPage,
        limit: this.pageLimit
      };

      if (this.selectedMonth !== null && this.selectedMonth !== 'all') {
        requestData.month = this.selectedMonth;
      }
      if (this.selectedYear !== null) {
        requestData.year = this.selectedYear;
      }
      if (this.selectedDateField) {
        requestData.dateField = this.selectedDateField;
      }


      const response = await this.taskMemberAuthService.getMemberTaskReport(requestData);

      if (response) {
        this.reportData = response;
      } else {
      }
    } catch (error: any) {
      console.error('Error getting report:', error);
      alert(error.message || 'Failed to get report. Please try again.');
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

  getBoardTaskCount(boardName: string): number {
    if (!this.reportData || !this.reportData.tasks[boardName]) return 0;
    return Object.values(this.reportData.tasks[boardName]).reduce((total, tasks) => total + tasks.length, 0);
  }

  // Export Methods
  exportReport(): void {
    if (!this.reportData) return;


    let csvContent = "";

    Object.keys(this.reportData?.tasks ?? {}).forEach(boardName => {
      csvContent += `Board: ${boardName}\n\n`;

      if (this.reportData?.tasks[boardName]) {
        Object.keys(this.reportData.tasks[boardName]).forEach(memberName => {
          // Only include the selected member if single member is chosen
          if (this.selectedMemberId !== 'all' && memberName !== this.selectedMemberName) {
            return;
          }
          csvContent += `Member: ${memberName}\n`;
          csvContent += "Task Title,Column,Status,Due Date,Created At,Completed At,Completed,Comments,Attachments\n";

          this.reportData!.tasks[boardName][memberName].forEach(task => {
            csvContent += `"${task.taskTitle}","${task.columnName}","${task.status}","${task.dueDate || 'No due date'}","${task.createdAt || 'No created date'}","${task.completedAt || 'No'}","${task.isCompleted}","${task.commentCount || 0}","${task.attachmentCount || 0}"\n`;
          });
          csvContent += "\n"; // Blank line after member's tasks
        });
      }
      csvContent += "\n"; // Blank line after board
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `task-report-${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
    window.URL.revokeObjectURL(url);
  }
}