import { Component, OnInit } from '@angular/core';
import { TaskPermissionsService } from 'src/app/services/task-permissions.service';


@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent implements OnInit {

  constructor(
    public TaskPermissionsService: TaskPermissionsService

  ){}

  isAdmin = false;

  ngOnInit(): void{
    this.isAdmin = this.TaskPermissionsService.isAdminLevelPermission();
  }
   
  
}
