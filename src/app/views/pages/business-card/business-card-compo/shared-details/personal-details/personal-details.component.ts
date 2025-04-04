import { Component, OnInit } from '@angular/core';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AuthService } from 'src/app/services/auth.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';
import { environment } from 'src/env/env.local';
declare var $: any;

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
  styleUrl: './personal-details.component.scss',
})
export class PersonalDetailsComponent implements OnInit {
  baseURL = environment.baseURL;
  newSocialMedia = { name: '', link: '' };

  personalDetails: any;

  constructor(private authService: AuthService, private storage: AppStorage) {}

  ngOnInit() {
    this.getCards();
  }

  getCards = async () => {
    let results = await this.authService.getBusinessCards();
    if (results != null) {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let card = results.find((v: any) => v._id == businessCardId);
      if (card != null) {
        this.personalDetails = {
          name: card.name,
          businessCardId: card._id,
          personalSocialMedia: card.personalSocialMedia,
        };
      }
    }
  };

  socialMediaImage: File | undefined;
  addSocialMedia = async () => {
    console.log(this.newSocialMedia.name, this.socialMediaImage);
    if (this.socialMediaImage != null) {
      let formData = new FormData();
      formData.append('name', this.newSocialMedia.name);
      formData.append('link', this.newSocialMedia.link);
      formData.append('type', 'personal');
      formData.append('businessCardId', this.storage.get(common.BUSINESS_CARD));
      formData.append(
        'file',
        this.socialMediaImage,
        this.socialMediaImage.name
      );

      let result = await this.authService.updateBusinessSocialDetails(formData);
      if (result) {
        this.personalDetails.personalSocialMedia = result;
        this.socialMediaImage = undefined;
        $('#addSocialMediaModal').modal('hide');
        $('#platformImage').val(null);
        this.newSocialMedia = {
          name: '',
          link: '',
        };
        swalHelper.showToast(
          'Business Details Social Updated Successfully!',
          'success'
        );
      }
    }
  };

  onSocialMediaIcon(event: any): void {
    const files = event.target.files;
    if (files) {
      this.socialMediaImage = files[0];
      console.log(this.socialMediaImage);
    }
  }

  deleteSocial(index: number) {
    this.personalDetails.personalSocialMedia.splice(index, 1);
  }

  toggleSocialMedia(index: number) {
    let toggledValue =
      !this.personalDetails.personalSocialMedia[index].visibility;
    this.personalDetails.personalSocialMedia[index].visibility = toggledValue;
  }

  submitForm = async () => {
    let result = await this.authService.updatePersonalDetails(
      this.personalDetails
    );
    if (result) {
      swalHelper.showToast('Personal Details Updated Successfully!', 'success');
    }
  };
}
