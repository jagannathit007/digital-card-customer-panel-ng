import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';

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
  newSocialMedia = { name: '', image: '', link: '', isVisible: true };
  constructor(private storage: AppStorage, public authService: AuthService) {
    this.getCards();
  }

  profileImage: File | undefined;
  coverImage: File | undefined;
  businessProfile: any;

  getCards = async () => {
    let results = await this.authService.getBusinessCards();
    if (results != null) {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let card = results.find((v: any) => v._id == businessCardId);
      if (card != null) {
        this.businessProfile = {
          company: card.company,
          aboutCompany: card.aboutCompany,
          companyAddress: card.companyAddress,
          message: card.message,
          companySocialMedia: card.companySocialMedia
        };
      }
    }
  }

  addSocialMedia() {
    this.businessProfile.companySocialMedia.push({
      name: this.newSocialMedia.name,
      link: this.newSocialMedia.link,
      image: this.newSocialMedia.image,
      visibility: this.newSocialMedia.isVisible,
      isDefault: false,
    });
  }

  onSubmit = async () => {
    let formData = new FormData();
    formData.append('company', this.businessProfile.company);
    formData.append('aboutCompany', this.businessProfile.aboutCompany);
    formData.append('companyAddress', this.businessProfile.companyAddress);
    formData.append('businessCardId', this.storage.get(common.BUSINESS_CARD));
    formData.append('companySocialMedia', JSON.stringify(this.businessProfile.companySocialMedia));
    formData.append('message', JSON.stringify(this.businessProfile.message));

    if (this.profileImage) {
      formData.append('profileImage', this.profileImage, this.profileImage.name);
    }

    if (this.coverImage) {
      formData.append('coverImage', this.coverImage, this.coverImage.name);
    }

    let result = await this.authService.updateBusinessDetails(formData);
    if (result) {
      swalHelper.showToast('Business Details Updated Successfully!', "success");
    }
  }
}
