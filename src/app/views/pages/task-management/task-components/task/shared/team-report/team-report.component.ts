import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskMemberAuthService } from 'src/app/services/task-member-auth.service';
import { TaskService } from 'src/app/services/task.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import * as XLSX from 'xlsx';
import { animate, state, style, transition, trigger } from '@angular/animations';

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
  taskId: string;
  taskTitle: string;
  columnName: string;
  status: string;
  dueDate: string;
  createdAt: string;
  completedAt: string;
  isCompleted: string;
  commentCount: number;
  attachmentCount: number;
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
  styleUrls: ['./team-report.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        height: '*',
        opacity: 1,
        overflow: 'hidden'
      })),
      state('out', style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden'
      })),
      transition('in <=> out', animate('300ms ease-in-out'))
    ])
  ]
})
export class TeamReportComponent implements OnInit, OnDestroy {
  members: Member[] = [];
  boards: Board[] = [];
  reportData: ReportData | null = null;
  selectedMemberId: string = 'all';
  selectedMemberName: string = '';
  selectedBoardId: string = 'all';
  selectedDateField: string = '';
  selectedMonth: number | null | 'all' = null;
  selectedYear: number | null = null;
  currentPage: number = 1;
  pageLimit: number = 10;
  isLoading: boolean = false;
  searchClicked: boolean = false;
  reportError: string = '';
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
  Math = Math;

  openBoards: { [boardName: string]: boolean } = {};


  private queryParamsSubscription: Subscription | null = null;

  constructor(
    private taskService: TaskService,
    private taskMemberAuthService: TaskMemberAuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  toggleBoardAccordion(boardName: string): void {
    this.openBoards[boardName] = !this.openBoards[boardName];
  }

isBoardOpen(boardName: string): boolean {
    // If the board state hasn't been set yet, default to true (open)
    if (this.openBoards[boardName] === undefined) {
      return true;
    }
    return this.openBoards[boardName];
  }


  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadMembers(), this.loadBoards()]);

    this.queryParamsSubscription = this.activatedRoute.queryParams.subscribe(params => {
      if (Object.keys(params).length > 0) {
        // Set member (match by name)
        const memberName = params['member_name'] || 'All Members';
        if (memberName === 'All Members') {
          this.selectedMemberId = 'all';
        } else {
          const member = this.members.find(m => m.name.toLowerCase() === memberName.toLowerCase());
          this.selectedMemberId = member ? member._id : 'all';
        }

        // Set board (match by name)
        const boardName = params['board_name'] || 'All Boards';
        if (boardName === 'All Boards') {
          this.selectedBoardId = 'all';
        } else {
          const board = this.boards.find(b => b.name.toLowerCase() === boardName.toLowerCase());
          this.selectedBoardId = board ? board._id : 'all';
        }

        // Set year
        this.selectedYear = params['year'] ? Number(params['year']) : null;

        // Set month (handle 'all', number, or name)
        let monthParam = params['month'];
        if (monthParam) {
          if (monthParam.toLowerCase() === 'all') {
            this.selectedMonth = 'all';
          } else if (!isNaN(Number(monthParam))) {
            this.selectedMonth = Number(monthParam);
          } else {
            const monthObj = this.months.find(m => m.name.toLowerCase() === monthParam.toLowerCase());
            this.selectedMonth = monthObj ? monthObj.value : null;
          }
        } else {
          this.selectedMonth = null;
        }

        // Set dateField based on filter
        const filter = params['filter'];
        if (filter) {
          if (filter === 'dueOn') {
            this.selectedDateField = 'dueDate';
          } else if (filter === 'createdAt') {
            this.selectedDateField = 'createdAt';
          } else if (filter === 'completed') {
            this.selectedDateField = 'completedAt';
          } else if (filter === 'overdue') {
            this.selectedDateField = 'dueDate';
          }
        }
      }
    });

    this.getReport();
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  onYearChange(): void {
    if (this.selectedYear !== null && !this.selectedDateField) {
      this.selectedDateField = 'dueDate';
    }
  }

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

  resetFilters(): void {
    this.selectedMemberId = 'all';
    this.selectedBoardId = 'all';
    this.selectedMonth = null;
    this.selectedYear = null;
    this.selectedDateField = '';
    this.currentPage = 1;
    this.searchClicked = false;
    this.reportData = null;
    this.reportError = '';

    this.getReport();
  }

  async getReport(): Promise<void> {
    // Reset previous state
    this.isLoading = true;
    this.searchClicked = true;
    this.reportData = null;
    this.reportError = '';

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

      // Immediately process the response without delay
      if (response) {
        this.reportData = response;
        // Check if there's actually data
        const hasData = this.reportData && 
          this.reportData.tasks && 
          Object.keys(this.reportData.tasks).length > 0 &&
          Object.values(this.reportData.tasks).some(boardTasks => 
            Object.keys(boardTasks).length > 0
          );
        
        // if (!hasData) {
        //   this.reportError = 'No reports found for the selected filters.';
        // }

        if (this.reportData && this.reportData.tasks) {
        Object.keys(this.reportData.tasks).forEach(boardName => {
          this.openBoards[boardName] = true;
        });
      }
      } else {
        this.reportError = 'No reports found for the selected filters.';
      }
    } catch (error: any) {
      this.reportError = error.message || 'Failed to get report. Please try again.';
    } finally {
      // Quick loader stop
      this.isLoading = false;
    }
  }

  changePage(page: number | null): void {
    if (page && page !== this.currentPage) {
      this.currentPage = page;
      this.getReport();
    }
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  redirectToTask(task: TaskReport): void {
    // task-management/teamtask/detail/68a2bc65400f29a610da0eff?boardId=689dc70826b30bf9447fa567
    this.router.navigate(['/task-management/teamtask/detail', task.taskId], {
      queryParams: { boardId: task.boardId },
    });
  }

  trackByTaskId(index: number, task: TaskReport): string {
    return task.boardId + task.taskTitle + index;
  }

  getBoardTaskCount(boardName: string): number {
    if (!this.reportData || !this.reportData.tasks[boardName]) return 0;
    return Object.values(this.reportData.tasks[boardName]).reduce((total, tasks) => total + tasks.length, 0);
  }

  getTotalTaskCountForMember(): number {
    if (!this.reportData || !this.selectedMemberName || this.selectedMemberId === 'all') return 0;
    
    let totalCount = 0;
    Object.keys(this.reportData.tasks).forEach(boardName => {
      if (this.reportData!.tasks[boardName][this.selectedMemberName]) {
        totalCount += this.reportData!.tasks[boardName][this.selectedMemberName].length;
      }
    });
    return totalCount;
  }

  formatDateForExcel(dateString: string): string {
    if (!dateString || dateString === 'No due date' || dateString === 'No created date' || dateString === 'No') {
      return dateString || 'N/A';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  exportReport(): void {
    if (!this.reportData) return;

    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Create worksheet data - frontend jaisa structure
      const worksheetData: any[] = [];
      
      // Title row
      worksheetData.push(['TEAM TASK REPORT']);
      worksheetData.push([]);
      
      let currentRow = 3;
      
      // If specific member is selected, show member header first
      if (this.selectedMemberId !== 'all' && this.selectedMemberName) {
        worksheetData.push([`👤 ${this.selectedMemberName.toUpperCase()} (${this.getTotalTaskCountForMember()} total tasks)`]);
        worksheetData.push([]);
        currentRow += 2;
      }
      
      // Process data board-wise (frontend jaisa)
      Object.keys(this.reportData.tasks).forEach((boardName, boardIndex) => {
        // Board header - frontend jaisa blue header
        worksheetData.push([`📋 ${boardName.toUpperCase()} (${this.getBoardTaskCount(boardName)} tasks)`]);
        worksheetData.push([]);
        currentRow += 2;
        
        // Process members under this board
        Object.keys(this.reportData!.tasks[boardName]).forEach((memberName, memberIndex) => {
          if (this.selectedMemberId !== 'all' && memberName !== this.selectedMemberName) {
            return;
          }
          
          // Member header (only show if all members are selected)
          if (this.selectedMemberId === 'all') {
            worksheetData.push([`👤 ${memberName} (${this.reportData!.tasks[boardName][memberName].length} tasks)`]);
            worksheetData.push([]);
            currentRow += 2;
          }
          
          // Table headers for this member
          worksheetData.push([
            'Task Title',
            'Column',
            'Status',
            'Due Date',
            'Created At',
            'Completed At',
            'Completed',
            'Comments',
            'Attachments'
          ]);
          
          currentRow += 3;
          
          // Add task data
          this.reportData!.tasks[boardName][memberName].forEach(task => {
            worksheetData.push([
              task.taskTitle,
              task.columnName,
              task.status,
              this.formatDateForExcel(task.dueDate),
              this.formatDateForExcel(task.createdAt),
              this.formatDateForExcel(task.completedAt),
              task.isCompleted,
              task.commentCount || 0,
              task.attachmentCount || 0
            ]);
            currentRow++;
          });
          
          // Add space between members
          worksheetData.push([]);
          currentRow++;
        });
        
        // Add space between boards
        worksheetData.push([]);
        currentRow++;
      });

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Set column widths
      const columnWidths = [
        { wch: 35 }, // Task Title / Headers
        { wch: 15 }, // Column
        { wch: 15 }, // Status
        { wch: 12 }, // Due Date
        { wch: 12 }, // Created At
        { wch: 12 }, // Completed At
        { wch: 10 }, // Completed
        { wch: 10 }, // Comments
        { wch: 12 }  // Attachments
      ];
      worksheet['!cols'] = columnWidths;

      // Styling - Frontend jaisa colors
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      for (let row = 0; row <= range.e.r; row++) {
        for (let col = 0; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          
          if (!cell) continue;
          
          // Title styling (row 0)
          if (row === 0) {
            cell.s = {
              font: { bold: true, sz: 16, color: { rgb: "1F2937" } },
              fill: { fgColor: { rgb: "EBF4FF" } },
              alignment: { horizontal: "center", vertical: "center" },
              border: {
                top: { style: "thick", color: { rgb: "2563EB" } },
                bottom: { style: "thick", color: { rgb: "2563EB" } },
                left: { style: "thick", color: { rgb: "2563EB" } },
                right: { style: "thick", color: { rgb: "2563EB" } }
              }
            };
          }
          // Board headers - blue gradient jaisa
          else if (cell.v && typeof cell.v === 'string' && cell.v.includes('📋')) {
            cell.s = {
              font: { bold: true, sz: 14, color: { rgb: "1E40AF" } },
              fill: { fgColor: { rgb: "DBEAFE" } },
              alignment: { horizontal: "left", vertical: "center" },
              border: {
                top: { style: "medium", color: { rgb: "3B82F6" } },
                bottom: { style: "medium", color: { rgb: "3B82F6" } },
                left: { style: "medium", color: { rgb: "3B82F6" } },
                right: { style: "medium", color: { rgb: "3B82F6" } }
              }
            };
          }
          // Member headers (main member header when specific member is selected)
          else if (cell.v && typeof cell.v === 'string' && cell.v.includes('👤') && cell.v.includes('total tasks')) {
            cell.s = {
              font: { bold: true, sz: 14, color: { rgb: "7C3AED" } },
              fill: { fgColor: { rgb: "F3E8FF" } },
              alignment: { horizontal: "left", vertical: "center" },
              border: {
                top: { style: "medium", color: { rgb: "7C3AED" } },
                bottom: { style: "medium", color: { rgb: "7C3AED" } },
                left: { style: "medium", color: { rgb: "7C3AED" } },
                right: { style: "medium", color: { rgb: "7C3AED" } }
              }
            };
          }
          // Member headers (individual member headers when all members are selected)
          else if (cell.v && typeof cell.v === 'string' && cell.v.includes('👤')) {
            cell.s = {
              font: { bold: true, sz: 12, color: { rgb: "374151" } },
              fill: { fgColor: { rgb: "F9FAFB" } },
              alignment: { horizontal: "left", vertical: "center" },
              border: {
                top: { style: "thin", color: { rgb: "6B7280" } },
                bottom: { style: "thin", color: { rgb: "6B7280" } },
                left: { style: "thin", color: { rgb: "6B7280" } },
                right: { style: "thin", color: { rgb: "6B7280" } }
              }
            };
          }
          // Table headers
          else if (cell.v === 'Task Title' || cell.v === 'Column' || cell.v === 'Status' || 
                   cell.v === 'Due Date' || cell.v === 'Created At' || cell.v === 'Completed At' ||
                   cell.v === 'Completed' || cell.v === 'Comments' || cell.v === 'Attachments') {
            cell.s = {
              font: { bold: true, sz: 10, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "374151" } },
              alignment: { horizontal: "center", vertical: "center" },
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
              }
            };
          }
          // Data rows - alternating colors
          else if (cell.v && cell.v !== '' && !cell.v.toString().includes('📋') && !cell.v.toString().includes('👤')) {
            const isEvenDataRow = row % 2 === 0;
            cell.s = {
              font: { sz: 9 },
              fill: { fgColor: { rgb: isEvenDataRow ? "F8FAFC" : "FFFFFF" } },
              alignment: { horizontal: "left", vertical: "center" },
              border: {
                top: { style: "thin", color: { rgb: "E5E7EB" } },
                bottom: { style: "thin", color: { rgb: "E5E7EB" } },
                left: { style: "thin", color: { rgb: "E5E7EB" } },
                right: { style: "thin", color: { rgb: "E5E7EB" } }
              }
            };
            
            // Special styling for status column
            if (col === 2 && typeof cell.v === 'string') { // Status column
              if (cell.v === 'completed') {
                cell.s.fill = { fgColor: { rgb: "DCFCE7" } }; // Green
                cell.s.font = { sz: 9, color: { rgb: "166534" }, bold: true };
              } else if (cell.v === 'in-progress') {
                cell.s.fill = { fgColor: { rgb: "FEF3C7" } }; // Yellow
                cell.s.font = { sz: 9, color: { rgb: "92400E" }, bold: true };
              } else if (cell.v === 'pending') {
                cell.s.fill = { fgColor: { rgb: "FEE2E2" } }; // Red
                cell.s.font = { sz: 9, color: { rgb: "991B1B" }, bold: true };
              }
            }
            
            // Special styling for completed column
            if (col === 6) { // Completed column
              if (cell.v === 'Yes') {
                cell.s.fill = { fgColor: { rgb: "DCFCE7" } }; // Green
                cell.s.font = { sz: 9, color: { rgb: "166534" }, bold: true };
              } else if (cell.v === 'No') {
                cell.s.fill = { fgColor: { rgb: "FEE2E2" } }; // Red
                cell.s.font = { sz: 9, color: { rgb: "991B1B" }, bold: true };
              }
            }
          }
        }
      }

      // Merge title cell across all columns
      worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Task Report');

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `Task-Report-${currentDate}.xlsx`;

      // Save the file
      XLSX.writeFile(workbook, filename);

    } catch (error) {
      console.error('Error exporting report:', error);
    }
  }
}