import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';

interface SocialMediaLink {
  name: string;
  link: string;
  isVisible?: boolean;
}

@Component({
  selector: 'app-business-details',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './business-details.component.html',
  styleUrl: './business-details.component.scss',
})
export class BusinessDetailsComponent {

  socialMediaList: SocialMediaLink[] = [];
  newSocialMedia: SocialMediaLink = { name: '', link: '', isVisible: true };

  constructor(private storage: AppStorage, public authService: AuthService) { 
    // this.authService.getBusinessCards();
  }


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



  toggleSocialMedia(platform: string) {
    

  }

  addSocialMedia(){
    if (this.newSocialMedia.name && this.newSocialMedia.link) {
      // Add new social media link to the list
      this.socialMediaList.push({
        ...this.newSocialMedia,
        isVisible: true
      });

      // Update personalDetails.personalSocial if the platform matches
      const platformName = this.newSocialMedia.name.toLowerCase();
      if (platformName in this.form.companySocial) {
        (this.form.companySocial as any)[platformName] = this.newSocialMedia.link;
      }

      // Reset the form
      this.newSocialMedia = { name: '', link: '', isVisible: true };
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
