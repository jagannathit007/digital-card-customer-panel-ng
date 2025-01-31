import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApiManager } from 'src/app/core/utilities/api-manager';
import { apiEndpoints } from 'src/app/core/constants/api-endpoints';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-document-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './document-details.component.html',
  styleUrl: './document-details.component.css',
})
export class DocumentDetailsComponent {

  constructor(private authService: AuthService) { }

  // Document details
  public documentDetails: any = {
    gstNo: '',
    personalPAN: '',
    companyPAN: ''
  };

  // Submit form
  submitForm = async () => {
    let result = await this.authService.updateDocumentDetails(this.documentDetails);
    if (result) {
      swalHelper.showToast('Document Details Updated Successfully!', "success");
    }
  }

  // Cancel form and reset data
  cancelForm = () => {
    this.documentDetails = {
      gstNo: '',
      personalPAN: '',
      companyPAN: ''
    };
  }
}
