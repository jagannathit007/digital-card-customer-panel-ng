import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CrmService } from 'src/app/services/crm.service';

@Component({
  selector: 'app-lead-detail-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lead-detail-popup.component.html',
  styleUrl: './lead-detail-popup.component.scss'
})
export class LeadDetailPopupComponent implements OnInit {
  leadId: string = '';
  lead: any = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private crmService: CrmService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.leadId = params['leadId'];

      console.log('Lead ID from route:', this.leadId);
      if (this.leadId) {
        this.loadLeadDetails();
      }
    });
  }

  async loadLeadDetails() {
    try {
      this.isLoading = true;
      const response = await this.crmService.getLeadById({ leadId: this.leadId });
      if (response) {
        this.lead = response;
      }
    } catch (error) {
      console.error('Error loading lead details:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
