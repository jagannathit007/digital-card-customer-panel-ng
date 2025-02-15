import { Component, OnInit } from '@angular/core';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';

@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './personal-details.component.html',
  styleUrl: './personal-details.component.scss',
})
export class PersonalDetailsComponent implements OnInit {
  newSocialMedia = { name: '', link: '', image: '', isVisible: true };

  personalDetails: any;

  constructor(private authService: AuthService, private storage: AppStorage) { }

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
          personalSocialMedia: card.personalSocialMedia
        };
      }
    }
  }

  addSocialMedia() {
    this.personalDetails.personalSocialMedia.push({
      name: this.newSocialMedia.name,
      link: this.newSocialMedia.link,
      image: this.newSocialMedia.image,
      visibility: this.newSocialMedia.isVisible,
      isDefault: false,
    });
  }

  toggleSocialMedia(index: number) {
    let toggledValue = !this.personalDetails.personalSocialMedia[index].visibility;
    this.personalDetails.personalSocialMedia[index].visibility = toggledValue;
  }

  submitForm = async () => {
    let result = await this.authService.updatePersonalDetails(this.personalDetails);
    if (result) {
      swalHelper.showToast('Personal Details Updated Successfully!', "success");
    }
  }
}