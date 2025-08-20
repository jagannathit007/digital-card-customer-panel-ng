import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmService } from 'src/app/services/crm.service';

@Component({
  selector: 'app-crm-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crm-dashboard.component.html',
  styleUrl: './crm-dashboard.component.scss'
})
export class CrmDashboardComponent implements OnInit {
  crmDetails: any = null;
  leads: any[] = [];
  isLoading = true;

  constructor(private crmService: CrmService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  async loadDashboardData() {
    try {
      this.isLoading = true;
      
      // Load CRM details
      const crmResponse = await this.crmService.getCrmDetails({});
      if (crmResponse) {
        this.crmDetails = crmResponse;
      }

      // Load leads
      const leadsResponse = await this.crmService.getLeadsByCrmId({});
      if (leadsResponse) {
        this.leads = leadsResponse;
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getTotalLeads(): number {
    return this.leads.length;
  }

  getWonLeads(): number {
    return this.leads.filter(lead => lead.wonAt).length;
  }

  getLostLeads(): number {
    return this.leads.filter(lead => lead.lostAt).length;
  }

  getActiveLeads(): number {
    return this.leads.filter(lead => !lead.wonAt && !lead.lostAt).length;
  }

  getLeadsByPriority(priority: string): number {
    return this.leads.filter(lead => lead.priority === priority).length;
  }
}
