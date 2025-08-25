import { Component, OnInit, signal, Signal } from '@angular/core';
import { CustomdataComponent } from '../../../../../../partials/task-managemnt/common-components/customdata/customdata.component';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { TaskService } from 'src/app/services/task.service';
import { CommonModule } from '@angular/common';
import { routes } from 'src/app/app.routes';
import { Router } from '@angular/router';
import { TaskPermissionsService } from 'src/app/services/task-permissions.service';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/env/env.local';

interface RecentActivity {
  type: 'team_task' | 'personal_task';
  action: string;
  title: string;
  boardName: string;
  user: {
    name: string;
    profileImage: string;
  };
  timestamp: string;
  taskId: string;
}

interface RecentlyCreatedTask {
  type: 'team_task' | 'personal_task';
  title: string;
  description: string;
  status: string;
  boardName: string;
  boardId: string;
  createdBy: {
    name: string;
    profileImage: string;
  };
  assignedTo: Array<{
    name: string;
    profileImage: string;
  }>;
  dueDate: string | null;
  createdAt: string;
  taskId: string;
}

interface EmployeeTaskDetails {
  employee: {
    _id: string;
    name: string;
    emailId: string;
    profileImage: string;
    role: string;
    isActive: boolean;
  };
  todaysDueTasksCount: number;
  statusWiseTasks: { [key: string]: number };
  completedTaskCount: number;
  deletedTaskCount: number;
  tasksCreatedByEmployee: number;
  personalTasksCount: number;
  personalCompletedCount: number;
  totalTasksForToday: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CustomdataComponent, CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  isLoading = signal<boolean>(true);
  dashboardStats: any = {};
  recentActivities: RecentActivity[] = [];
  recentlyCreatedTasks: RecentlyCreatedTask[] = [];
  employeeTaskDetails: EmployeeTaskDetails[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  imageBaseUrl = environment.imageURL;

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

  getActivityIcon(activity: RecentActivity): string {
    if (activity.type === 'team_task') {
      return activity.action === 'completed' ? 'fa-check-circle' : 'fa-edit';
    } else {
      return activity.action === 'completed' ? 'fa-check-circle' : 'fa-tasks';
    }
  }

  getActivityColor(activity: RecentActivity): string {
    if (activity.action === 'completed') {
      return 'tw-bg-green-600';
    } else if (activity.type === 'team_task') {
      return 'tw-bg-blue-600';
    } else {
      return 'tw-bg-purple-600';
    }
  }

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return activityTime.toLocaleDateString();
  }

  getStatusCount(statusWiseTasks: { [key: string]: number }, status: string): number {
    return statusWiseTasks[status] || 0;
  }

  async ngOnInit(): Promise<void> {
    this.loadDashboardStats();
    this.loadRecentActivities();
    this.loadRecentlyCreatedTasks();
    this.loadEmployeeDayWiseTasks();
  }

  async loadDashboardStats() {
    console.log('Loading dashboard stats...');
    const response = await this.taskService.getDashboardStats({});

    if (response) {
      this.dashboardStats = response;
      console.log('Dashboard stats:', this.dashboardStats);
    }
  }

  async loadRecentActivities() {
    console.log('Loading recent activities...');
    const response = await this.taskService.getRecentActivities({});

    if (response) {
      this.recentActivities = response;
      console.log('Recent activities:', this.recentActivities);
    }
  }

  async loadRecentlyCreatedTasks() {
    console.log('Loading recently created tasks...');
    const response = await this.taskService.getRecentlyCreatedTasks({});

    if (response) {
      this.recentlyCreatedTasks = response;
      console.log('Recently created tasks:', this.recentlyCreatedTasks);
    }
  }

  async loadEmployeeDayWiseTasks() {
    this.isLoading.set(true);
    console.log('Loading employee day-wise tasks...');
    const response = await this.taskService.getEmployeeDayWiseTasks({
      date: this.selectedDate
    });

    if (response) {
      this.employeeTaskDetails = response.employeeTaskDetails;
      this.isLoading.set(false);
      console.log('Employee task details:', this.employeeTaskDetails);
    }
    this.isLoading.set(false);
  }

  onDateChange() {
    this.loadEmployeeDayWiseTasks();
  }

  navigateToTask(task: any, type: string) {
    if (type === 'team_task') {
      this.router.navigate([`/task-management/teamtask/detail/${task.taskId}`], { queryParams: { boardId: task.boardId }});
    } else {
      this.router.navigate(['/task-management/personal-task/my-day'], { queryParams: { taskId:task.taskId } });
    }
  }

  showAllTasks() {
    // redirect to all tasks
    console.log('Redirect to all tasks...');
    this.router.navigate(['/task-management/teamtask']);
  }
}
