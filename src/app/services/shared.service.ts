import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private refreshHeaderSource = new Subject<void>();
  refreshHeader$ = this.refreshHeaderSource.asObservable();

  triggerHeaderRefresh() {
    this.refreshHeaderSource.next();
  }
}
