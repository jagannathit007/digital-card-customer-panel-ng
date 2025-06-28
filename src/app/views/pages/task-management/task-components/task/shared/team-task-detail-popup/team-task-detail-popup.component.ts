import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-team-task-detail-popup',
  standalone: true,
  imports: [],
  templateUrl: './team-task-detail-popup.component.html',
  styleUrl: './team-task-detail-popup.component.scss',
})
export class TeamTaskDetailPopupComponent {
  constructor(private router: Router) {}
  closePopup() {
    this.router.navigate(['/task-management/teamtask']);
  }
}
