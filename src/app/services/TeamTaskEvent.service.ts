import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

interface TaskUpdate {
  field: string;
  value: any;
  taskId: string;
}

@Injectable({
  providedIn: 'root',
})
export class TeamTaskEventService {
  private taskUpdatedSource = new Subject<TaskUpdate>();
  taskUpdated$ = this.taskUpdatedSource.asObservable();

  emitTaskUpdate(taskUpdate: TaskUpdate) {
    this.taskUpdatedSource.next(taskUpdate);
  }
}