import { Component, OnInit } from '@angular/core';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';

@Component({
  selector: 'app-task-clock',
  standalone: true,
  imports: [],
  templateUrl: './task-clock.component.html',
  styleUrl: './task-clock.component.scss'
})
export class TaskClockComponent implements OnInit{
  
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

}
