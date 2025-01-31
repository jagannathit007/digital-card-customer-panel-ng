import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApiManager } from 'src/app/core/utilities/api-manager';
import { apiEndpoints } from 'src/app/core/constants/api-endpoints';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './personal-details.component.html',
  styleUrl: './personal-details.component.scss',
})
export class PersonalDetailsComponent { 

  constructor(private authService: AuthService){}

  public personalDetails: any = {
    name: '',
    mobile: '',
    whatsApp: '',
    emailId: '',
    businessCardId: '',
    personalSocial: {
      facebook: '',
      google: '',
      twitter: '',
      linkedIn: '',
      instagram: '',
      youtube: ''
    }
  };

  cancelForm = () => {
    this.personalDetails = {
      name: '',
      mobile: '',
      whatsApp: '',
      emailId: '',
      businessCardId: '',
      personalSocial: {
        facebook: '',
        google: '',
        twitter: '',
        linkedIn: '',
        instagram: '',
        youtube: ''
      }
    };
  }
 

  submitForm = async()=> {
    let result = await this.authService.updatePersonalDetails(this.personalDetails);
    if(result) {
      swalHelper.showToast('Personal Details Updated Successfully!',"success");
      this.cancelForm();
    }
  }
  
  
  }
  

 
