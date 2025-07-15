import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-demo-task-management',
  standalone: true,
  imports: [],
  templateUrl: './demo-task-management.component.html',
  styleUrl: './demo-task-management.component.scss',
})
export class DemoTaskManagementComponent { 
  countdown = 5;
  countdownInterval: any;
  taskManagerUrl = 'https://task.itfuturz.in';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.startCountdown();
  }

  startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      document.querySelector('.countdown')!.textContent = this.countdown.toString();
      
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.redirectToTaskManager();
      }
    }, 1000);
  }

  redirectToTaskManager(): void {
    clearInterval(this.countdownInterval);
    // In a real app, you might want to use window.open() with specific parameters
    console.log("Task Manager Calling");
    window.open(this.taskManagerUrl, "_blank");
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
