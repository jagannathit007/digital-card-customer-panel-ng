import { Component, OnInit, signal, Signal } from '@angular/core';
import { CustomdataComponent } from '../../../../../../partials/task-managemnt/common-components/customdata/customdata.component';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { TaskService } from 'src/app/services/task.service';
import { CommonModule } from '@angular/common';
import { routes } from 'src/app/app.routes';
import { Router } from '@angular/router';
import { TaskPermissionsService } from 'src/app/services/task-permissions.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CustomdataComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  isLoading = signal<boolean>(true);
  dashboardStats: any = {};

  constructor(
    private storage: AppStorage,
    private taskService: TaskService,
    public router: Router,
    public taskPermissionsService: TaskPermissionsService
  ) {}

  getTime(date: any) {
    const dateObj = new Date(date);
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    return `${hours}:${minutes} ${ampm}`;
  }

  getStatusColorClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'tw-bg-green-100 tw-text-green-800';
      case 'in progress':
        return 'tw-bg-blue-100 tw-text-blue-800';
      case 'blocked':
        return 'tw-bg-red-100 tw-text-red-800';
      case 'on hold':
        return 'tw-bg-yellow-100 tw-text-yellow-800';
      case 'need review':
        return 'tw-bg-purple-100 tw-text-purple-800';
      case 'need rework':
        return 'tw-bg-orange-100 tw-text-orange-800';
      case 'deleted':
        return 'tw-bg-gray-100 tw-text-gray-800';
      default:
        return 'tw-bg-gray-100 tw-text-gray-800';
    }
  }

  async ngOnInit(): Promise<void> {
    this.loadDashboardStats();
  }

  async loadDashboardStats() {
    console.log('Loading dashboard stats...');
    const response = await this.taskService.getDashboardStats({});

    if (this.dashboardStats) {
      this.dashboardStats = response;
      console.log('Dashboard stats:', this.dashboardStats);
      this.isLoading.set(false);
    } else {
      this.isLoading.set(false);
    }
  }

  showAllTasks() {
    // redirect to all tasks
    console.log('Redirect to all tasks...');
    this.router.navigate(['/task-management/teamtask']);
  }
}
