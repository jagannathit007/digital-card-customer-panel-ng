import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrmService } from 'src/app/services/crm.service';
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

interface LeadReport {
  leadId: string;
  leadTitle: string;
  columnName: string;
  priority: string;
  closingDate: string;
  quotationDate: string;
  createdAt: string;
  wonAt: string;
  lostAt: string;
  isWon: string;
  isLost: string;
  amount: string;
  category: string;
  attachmentCount: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  createdBy: string;
}

interface ReportData {
  leads: { [columnName: string]: { [memberName: string]: LeadReport[] } };
  summary: {
    totalLeads: number;
    totalWon: number;
    totalLost: number;
    totalActive: number;
    totalAmount: number;
  };
}

@Component({
  selector: 'app-crm-team-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crm-team-report.component.html',
  styleUrl: './crm-team-report.component.scss',
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
export class CrmTeamReportComponent implements OnInit, OnDestroy {
  members: Member[] = [];
  reportData: ReportData | null = null;
  selectedMemberId: string = 'all';
  selectedMemberName: string = '';
  selectedDateField: string = '';
  selectedMonth: number | null | 'all' = null;
  selectedYear: number | null = null;
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

  openColumns: { [columnName: string]: boolean } = {};

  private queryParamsSubscription: Subscription | null = null;

  constructor(
    private crmService: CrmService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  toggleColumnAccordion(columnName: string): void {
    this.openColumns[columnName] = !this.openColumns[columnName];
  }

  isColumnOpen(columnName: string): boolean {
    // If the column state hasn't been set yet, default to true (open)
    if (this.openColumns[columnName] === undefined) {
      return true;
    }
    return this.openColumns[columnName];
  }

  async ngOnInit(): Promise<void> {
    await this.loadMembers();

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
          if (filter === 'closingDate') {
            this.selectedDateField = 'closingDate';
          } else if (filter === 'quotationDate') {
            this.selectedDateField = 'quotationDate';
          } else if (filter === 'createdAt') {
            this.selectedDateField = 'createdAt';
          } else if (filter === 'wonAt') {
            this.selectedDateField = 'wonAt';
          } else if (filter === 'lostAt') {
            this.selectedDateField = 'lostAt';
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
      this.selectedDateField = 'closingDate';
    }
  }

  async loadMembers(): Promise<void> {
    try {
      const response = await this.crmService.getSelectableTeamMembers({});
      console.log('Members response:', response);
      if (response && response.members) {
        this.members = response.members
      }
    } catch (error) {
      console.error('Error loading members:', error);
    }
  }

  resetFilters(): void {
    this.selectedMemberId = 'all';
    this.selectedMonth = null;
    this.selectedYear = null;
    this.selectedDateField = '';
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

      const requestData: any = {
        memberId
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

      const response = await this.crmService.getCrmMemberReport(requestData);

      // Immediately process the response without delay
      if (response) {
        this.reportData = response;
        // Check if there's actually data
        const hasData = this.reportData && 
          this.reportData.leads && 
          Object.keys(this.reportData.leads).length > 0 &&
          Object.values(this.reportData.leads).some(columnLeads => 
            Object.keys(columnLeads).length > 0
          );

        if (this.reportData && this.reportData.leads) {
          Object.keys(this.reportData.leads).forEach(columnName => {
            this.openColumns[columnName] = true;
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

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  redirectToLead(lead: LeadReport): void {
    // Navigate to lead details
    this.router.navigate(['/crm/leads/details', lead.leadId]);
  }

  trackByLeadId(index: number, lead: LeadReport): string {
    return lead.leadId + lead.leadTitle + index;
  }

  /**
   * Get the total unique lead count for a specific column
   * This counts unique leads across all members in the column, avoiding duplicates
   * when the same lead is assigned to multiple members
   */
  getColumnLeadCount(columnName: string): number {
    if (!this.reportData || !this.reportData.leads[columnName]) return 0;
    
    // Collect all unique lead IDs from all members in this column
    // This prevents counting the same lead multiple times when it's assigned to multiple members
    const uniqueLeadIds = new Set<string>();
    
    Object.values(this.reportData.leads[columnName]).forEach((leads: LeadReport[]) => {
      leads.forEach(lead => {
        uniqueLeadIds.add(lead.leadId);
      });
    });
    
    return uniqueLeadIds.size;
  }

  /**
   * Get the lead count for a specific member in a specific column
   * This shows how many leads are assigned to this individual member
   */
  getMemberLeadCount(columnName: string, memberName: string): number {
    if (!this.reportData || !this.reportData.leads[columnName] || !this.reportData.leads[columnName][memberName]) return 0;
    
    // For individual members, we can use the length since each member's leads are already unique
    return this.reportData.leads[columnName][memberName].length;
  }

  formatDateForExcel(dateString: string): string {
    if (!dateString || dateString === '-') {
      return 'N/A';
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
      worksheetData.push(['CRM MEMBER REPORT']);
      worksheetData.push([]);
      
      // Summary row
      worksheetData.push(['Summary']);
      worksheetData.push(['Total Leads', this.reportData.summary.totalLeads]);
      worksheetData.push(['Total Won', this.reportData.summary.totalWon]);
      worksheetData.push(['Total Lost', this.reportData.summary.totalLost]);
      worksheetData.push(['Total Active', this.reportData.summary.totalActive]);
      worksheetData.push(['Total Amount', `₹${this.reportData.summary.totalAmount.toLocaleString()}`]);
      worksheetData.push([]);
      
      let currentRow = 8;
      
      // Process data column-wise (frontend jaisa)
      Object.keys(this.reportData.leads).forEach((columnName, columnIndex) => {
        // Column header - frontend jaisa green header
        worksheetData.push([`📋 ${columnName.toUpperCase()} (${this.getColumnLeadCount(columnName)} leads)`]);
        worksheetData.push([]);
        currentRow += 2;
        
        // Process members under this column
        Object.keys(this.reportData!.leads[columnName]).forEach((memberName, memberIndex) => {
          if (this.selectedMemberId !== 'all' && memberName !== this.selectedMemberName) {
            return;
          }
          
          // Member header
          worksheetData.push([`👤 ${memberName} (${this.getMemberLeadCount(columnName, memberName)} leads)`]);
          worksheetData.push([]);
          
          // Table headers for this member
          worksheetData.push([
            'Lead Title',
            'Priority',
            'Status',
            'Amount',
            'Closing Date',
            'Created At',
            'Contact Name',
            'Contact Email',
            'Category',
            'Attachments'
          ]);
          
          currentRow += 3;
          
          // Add lead data
          this.reportData!.leads[columnName][memberName].forEach(lead => {
            worksheetData.push([
              lead.leadTitle,
              lead.priority,
              lead.isWon === 'Yes' ? 'Won' : lead.isLost === 'Yes' ? 'Lost' : 'Active',
              lead.amount !== '-' ? `₹${lead.amount}` : '-',
              this.formatDateForExcel(lead.closingDate),
              this.formatDateForExcel(lead.createdAt),
              lead.contactName,
              lead.contactEmail,
              lead.category,
              lead.attachmentCount || 0
            ]);
            currentRow++;
          });
          
          // Add space between members
          worksheetData.push([]);
          currentRow++;
        });
        
        // Add space between columns
        worksheetData.push([]);
        currentRow++;
      });

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Set column widths
      const columnWidths = [
        { wch: 35 }, // Lead Title / Headers
        { wch: 12 }, // Priority
        { wch: 12 }, // Status
        { wch: 15 }, // Amount
        { wch: 12 }, // Closing Date
        { wch: 12 }, // Created At
        { wch: 20 }, // Contact Name
        { wch: 25 }, // Contact Email
        { wch: 15 }, // Category
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
          // Column headers - green gradient jaisa
          else if (cell.v && typeof cell.v === 'string' && cell.v.includes('📋')) {
            cell.s = {
              font: { bold: true, sz: 14, color: { rgb: "1E40AF" } },
              fill: { fgColor: { rgb: "DCFCE7" } },
              alignment: { horizontal: "left", vertical: "center" },
              border: {
                top: { style: "medium", color: { rgb: "16A34A" } },
                bottom: { style: "medium", color: { rgb: "16A34A" } },
                left: { style: "medium", color: { rgb: "16A34A" } },
                right: { style: "medium", color: { rgb: "16A34A" } }
              }
            };
          }
          // Member headers
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
          else if (cell.v === 'Lead Title' || cell.v === 'Priority' || cell.v === 'Status' || 
                   cell.v === 'Amount' || cell.v === 'Closing Date' || cell.v === 'Created At' ||
                   cell.v === 'Contact Name' || cell.v === 'Contact Email' || cell.v === 'Category' || cell.v === 'Attachments') {
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
            
            // Special styling for priority column
            if (col === 1 && typeof cell.v === 'string') { // Priority column
              if (cell.v === 'hot') {
                cell.s.fill = { fgColor: { rgb: "FEE2E2" } }; // Red
                cell.s.font = { sz: 9, color: { rgb: "991B1B" }, bold: true };
              } else if (cell.v === 'warm') {
                cell.s.fill = { fgColor: { rgb: "FEF3C7" } }; // Yellow
                cell.s.font = { sz: 9, color: { rgb: "92400E" }, bold: true };
              } else if (cell.v === 'cold') {
                cell.s.fill = { fgColor: { rgb: "DBEAFE" } }; // Blue
                cell.s.font = { sz: 9, color: { rgb: "1E40AF" }, bold: true };
              }
            }
            
            // Special styling for status column
            if (col === 2) { // Status column
              if (cell.v === 'Won') {
                cell.s.fill = { fgColor: { rgb: "DCFCE7" } }; // Green
                cell.s.font = { sz: 9, color: { rgb: "166534" }, bold: true };
              } else if (cell.v === 'Lost') {
                cell.s.fill = { fgColor: { rgb: "FEE2E2" } }; // Red
                cell.s.font = { sz: 9, color: { rgb: "991B1B" }, bold: true };
              } else if (cell.v === 'Active') {
                cell.s.fill = { fgColor: { rgb: "FEF3C7" } }; // Yellow
                cell.s.font = { sz: 9, color: { rgb: "92400E" }, bold: true };
              }
            }
          }
        }
      }

      // Merge title cell across all columns
      worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'CRM Report');

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `CRM-Report-${currentDate}.xlsx`;

      // Save the file
      XLSX.writeFile(workbook, filename);

    } catch (error) {
      console.error('Error exporting report:', error);
    }
  }
}
