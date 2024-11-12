import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { apiEndpoints } from 'src/app/core/constants/api-endpoints';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioComponent implements OnInit {
  constructor(
    private cdr: ChangeDetectorRef,
    private masterService: MasterService
  ) {}
  ngOnInit(): void {
    this.getData();
  }

  form = {
    experience: '',
    projectCompleted: '',
    satisfiedClients: '',
    teamMembers: '',
  };

  getData = async () => {
    let result = await this.masterService.getData(
      {},
      apiEndpoints.GET_PORTFOLIO
    );
    if (result && Array.isArray(result) && result.length > 0) {
      this.form = {
        experience: result[0].experience,
        projectCompleted: result[0].projectCompleted,
        satisfiedClients: result[0].satisfiedClients,
        teamMembers: result[0].teamMembers,
      };
    }
    this.cdr.detectChanges();
  };

  onSubmit = async () => {
    let result = await this.masterService.createData(
      this.form,
      apiEndpoints.SAVE_PORTFOLIO
    );
    if (result) {
      swalHelper.showToast('Portfolio Saved!', 'success');
    }
  };
}
