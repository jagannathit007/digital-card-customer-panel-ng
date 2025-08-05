import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface AttendanceRecord {
  id: number;
  empId: string;
  name: string;
  avatar: string;
  department: string;
  status: 'Present' | 'Absent' | 'Leave';
  punchIn?: Date;
  punchOut?: Date;
  workingHours?: string;
  leaveType?: string;
}

interface AttendanceStats {
  present: number;
  absent: number;
  leave: number;
  total: number;
}

@Component({
  selector: 'app-demo-attendance',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './demo-attendance.component.html',
  styleUrl: './demo-attendance.component.scss',
})
export class DemoAttendanceComponent {
  selectedDate: string = '';
  attendanceRecords: AttendanceRecord[] = [];
  filteredRecords: AttendanceRecord[] = [];
  stats: AttendanceStats = {
    present: 0,
    absent: 0,
    leave: 0,
    total: 0
  };

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalRecords = 0;
  totalPages = 1;
  pages: number[] = [];

  ngOnInit(): void {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.generateDummyData();
    this.calculateStats();
    this.setupPagination();
  }

  generateDummyData(): void {
    const departments = ['Development', 'Marketing', 'HR', 'Finance', 'Operations'];
    const leaveTypes = ['Sick Leave', 'Casual Leave', 'Earned Leave', 'Maternity Leave'];
    
    this.attendanceRecords = [
      {
        id: 1,
        empId: 'EMP001',
        name: 'Rahul Sharma',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        department: 'Development',
        status: 'Present',
        punchIn: new Date(new Date().setHours(9, 15, 0)),
        punchOut: new Date(new Date().setHours(18, 30, 0)),
        workingHours: '9.25'
      },
      {
        id: 2,
        empId: 'EMP002',
        name: 'Priya Patel',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        department: 'Marketing',
        status: 'Present',
        punchIn: new Date(new Date().setHours(9, 45, 0)),
        punchOut: new Date(new Date().setHours(18, 15, 0)),
        workingHours: '8.50'
      },
      {
        id: 3,
        empId: 'EMP003',
        name: 'Aarav Singh',
        avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
        department: 'HR',
        status: 'Leave',
        leaveType: 'Sick Leave'
      },
      {
        id: 4,
        empId: 'EMP004',
        name: 'Neha Gupta',
        avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
        department: 'Finance',
        status: 'Present',
        punchIn: new Date(new Date().setHours(8, 55, 0)),
        punchOut: new Date(new Date().setHours(17, 45, 0)),
        workingHours: '8.83'
      },
      {
        id: 5,
        empId: 'EMP005',
        name: 'Vikram Joshi',
        avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
        department: 'Operations',
        status: 'Absent'
      },
      {
        id: 6,
        empId: 'EMP006',
        name: 'Ananya Reddy',
        avatar: 'https://randomuser.me/api/portraits/women/71.jpg',
        department: 'Development',
        status: 'Present',
        punchIn: new Date(new Date().setHours(10, 5, 0)),
        punchOut: new Date(new Date().setHours(19, 20, 0)),
        workingHours: '9.25'
      },
      {
        id: 7,
        empId: 'EMP007',
        name: 'Arjun Malhotra',
        avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
        department: 'Marketing',
        status: 'Present',
        punchIn: new Date(new Date().setHours(9, 30, 0)),
        workingHours: '--'
      },
      {
        id: 8,
        empId: 'EMP008',
        name: 'Divya Iyer',
        avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
        department: 'HR',
        status: 'Leave',
        leaveType: 'Casual Leave'
      },
      {
        id: 9,
        empId: 'EMP009',
        name: 'Rohan Verma',
        avatar: 'https://randomuser.me/api/portraits/men/29.jpg',
        department: 'Finance',
        status: 'Present',
        punchIn: new Date(new Date().setHours(9, 10, 0)),
        punchOut: new Date(new Date().setHours(18, 45, 0)),
        workingHours: '9.58'
      },
      {
        id: 10,
        empId: 'EMP010',
        name: 'Ishita Chatterjee',
        avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
        department: 'Operations',
        status: 'Present',
        punchIn: new Date(new Date().setHours(9, 0, 0)),
        punchOut: new Date(new Date().setHours(17, 30, 0)),
        workingHours: '8.50'
      },
      {
        id: 11,
        empId: 'EMP011',
        name: 'Aditya Nair',
        avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
        department: 'Development',
        status: 'Present',
        punchIn: new Date(new Date().setHours(9, 20, 0)),
        punchOut: new Date(new Date().setHours(18, 15, 0)),
        workingHours: '8.92'
      },
      {
        id: 12,
        empId: 'EMP012',
        name: 'Meera Kapoor',
        avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
        department: 'Marketing',
        status: 'Leave',
        leaveType: 'Maternity Leave'
      }
    ];

    this.totalRecords = this.attendanceRecords.length;
    this.filteredRecords = [...this.attendanceRecords];
  }

  calculateStats(): void {
    this.stats = {
      present: this.attendanceRecords.filter(r => r.status === 'Present').length,
      absent: this.attendanceRecords.filter(r => r.status === 'Absent').length,
      leave: this.attendanceRecords.filter(r => r.status === 'Leave').length,
      total: this.attendanceRecords.length
    };
  }

  setupPagination(): void {
    this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage);
    this.pages = Array.from({length: this.totalPages}, (_, i) => i + 1);
    this.paginateRecords();
  }

  paginateRecords(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredRecords = this.attendanceRecords.slice(startIndex, endIndex);
  }

  onDateChange(): void {
    console.log('Date changed to:', this.selectedDate);
    // In real app, you would fetch data for the selected date
    this.refreshData();
  }

  refreshData(): void {
    // Simulate data refresh
    this.calculateStats();
    this.setupPagination();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateRecords();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateRecords();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.paginateRecords();
  }
}
