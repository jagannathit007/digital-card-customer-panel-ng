import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

interface LeadUpdate {
  field: string;
  value: any;
  leadId: string;
}

@Injectable({
  providedIn: 'root',
})
export class LeadEventService {
  private leadUpdatedSource = new Subject<LeadUpdate>();
  leadUpdated$ = this.leadUpdatedSource.asObservable();

  emitLeadUpdate(leadUpdate: LeadUpdate) {
    this.leadUpdatedSource.next(leadUpdate);
  }
}
