import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';

@Component({
  selector: 'app-business-details',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './business-details.component.html',
  styleUrl: './business-details.component.scss',
})
export class BusinessDetailsComponent {

  constructor(private storage: AppStorage) { }


  profileImage: File | undefined;
  coverImage: File | undefined;

  form = {
    company: '',
    companyEmail: '',
    companyMobile: '',
    companyAddress: '',
    aboutCompany: '',
    companyURL: '',
    map: '',
    businessCardId: '',
    companySocial: {
      facebook: '',
      google: '',
      twitter: '',
      linkedIn: '',
      instagram: '',
      youtube: ''
    },
    message: {
      whatsApp: '',
      email: ''
    }
  }

  onSubmit = async () => {
    let formData = new FormData();
    formData.append('company', this.form.company);
    formData.append('companyEmail', this.form.companyEmail);
    formData.append('companyMobile', this.form.companyMobile);
    formData.append('companyAddress', this.form.companyAddress);
    formData.append('aboutCompany', this.form.aboutCompany);
    formData.append('companyURL', this.form.companyURL);
    formData.append('map', this.form.map);
    formData.append('businessCardId', this.storage.get(common.BUSINESS_CARD));
    formData.append('companySocial', JSON.stringify(this.form.companySocial));
    formData.append('message', JSON.stringify(this.form.message));

    if (this.profileImage) {
      formData.append('profileImage', this.profileImage, this.profileImage.name);
    }

    if (this.coverImage) {
      formData.append('coverImage', this.coverImage, this.coverImage.name);
    }

    

  }
}
