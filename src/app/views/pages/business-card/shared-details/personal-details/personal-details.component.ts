// import { ChangeDetectionStrategy, Component } from '@angular/core';
// import { ApiManager } from 'src/app/core/utilities/api-manager';
// import { apiEndpoints } from 'src/app/core/constants/api-endpoints';
// import { swalHelper } from 'src/app/core/constants/swal-helper';
// import { FormsModule } from '@angular/forms';
// import { RouterModule } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { AuthService } from 'src/app/services/auth.service';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { common } from 'src/app/core/constants/common';

// @Component({
//   selector: 'app-personal-details',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterModule],
//   templateUrl: './personal-details.component.html',
//   styleUrl: './personal-details.component.scss',
// })
// export class PersonalDetailsComponent {

//   constructor(private authService: AuthService, private storage: AppStorage) {
//     // this.getCards();
//   }

//   getCards = async () => {
//     let results = await this.authService.getBusinessCards();
//     if (results != null) {
//       let businessCardId = this.storage.get(common.BUSINESS_CARD);
//       let card = results.find((v: any) => v._id == businessCardId);
//       if (card != null) {
//         this.personalDetails = {
//           name: card.name,
//           mobile: card.mobile,
//           whatsApp: card.whatsApp,
//           emailId: card.emailId,
//           businessCardId: card._id,
//           personalSocial: card.personalSocial
//         };
//       }
//     }
//   }

//   socialMediaList: { name: string; link: string }[] = [];
//   newSocialMedia = { name: '', link: '' };

//   addSocialMedia() {
//     if (this.newSocialMedia.name && this.newSocialMedia.link) {
//       this.socialMediaList.push({ ...this.newSocialMedia });
//       this.newSocialMedia = { name: '', link: '' };
//     }
//   }

//   toggleSocialMedia(platform: string) {
//     console.log(`Toggled ${platform}`);
    
//   }

//   personalDetails = {
//     name: '',
//     mobile: '',
//     whatsApp: '',
//     emailId: '',
//     businessCardId: '',
//     personalSocial: {
//       facebook: '',
//       google: '',
//       twitter: '',
//       linkedIn: '',
//       instagram: '',
//       youtube: ''
//     }
//   };

//   submitForm = async () => {
//     let result = await this.authService.updatePersonalDetails(this.personalDetails);
//     if (result) {
//       swalHelper.showToast('Personal Details Updated Successfully!', "success");
//     }
//   }
// }



import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ApiManager } from 'src/app/core/utilities/api-manager';
import { apiEndpoints } from 'src/app/core/constants/api-endpoints';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';

interface SocialMediaLink {
  name: string;
  link: string;
  isVisible?: boolean;
}

@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './personal-details.component.html',
  styleUrl: './personal-details.component.scss',
})
export class PersonalDetailsComponent implements OnInit {
  socialMediaList: SocialMediaLink[] = [];
  newSocialMedia: SocialMediaLink = { name: '', link: '', isVisible: true };
  
  personalDetails = {
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

  visibilitySettings: { [key: string]: boolean } = {
    mobile: true,
    email: true,
    whatsApp: true,
    facebook: true,
    google: true,
    twitter: true,
    linkedIn: true,
    instagram: true,
    youtube: true
  };

  constructor(private authService: AuthService, private storage: AppStorage) {}

  ngOnInit() {
    this.getCards();
    // Load existing social media links if any
    this.loadExistingSocialMedia();
  }

  loadExistingSocialMedia() {
    // Convert existing social media links to the list format
    const existingSocial = this.personalDetails.personalSocial;
    for (const [platform, link] of Object.entries(existingSocial)) {
      if (link) {
        this.socialMediaList.push({
          name: platform.charAt(0).toUpperCase() + platform.slice(1),
          link: link,
          isVisible: this.visibilitySettings[platform.toLowerCase()]
        });
      }
    }
  }

  getCards = async () => {
    let results = await this.authService.getBusinessCards();
    if (results != null) {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let card = results.find((v: any) => v._id == businessCardId);
      if (card != null) {
        this.personalDetails = {
          name: card.name,
          mobile: card.mobile,
          whatsApp: card.whatsApp,
          emailId: card.emailId,
          businessCardId: card._id,
          personalSocial: card.personalSocial
        };
        this.loadExistingSocialMedia();
      }
    }
  }

  addSocialMedia() {
    if (this.newSocialMedia.name && this.newSocialMedia.link) {
      // Add new social media link to the list
      this.socialMediaList.push({
        ...this.newSocialMedia,
        isVisible: true
      });

      // Update personalDetails.personalSocial if the platform matches
      const platformName = this.newSocialMedia.name.toLowerCase();
      if (platformName in this.personalDetails.personalSocial) {
        (this.personalDetails.personalSocial as any)[platformName] = this.newSocialMedia.link;
      }

      // Reset the form
      this.newSocialMedia = { name: '', link: '', isVisible: true };
    }
  }


  toggleSocialMedia(platform: string) {
    this.visibilitySettings[platform] = !this.visibilitySettings[platform];
    
    // Update visibility in socialMediaList if the platform exists there
    const index = this.socialMediaList.findIndex(
      item => item.name.toLowerCase() === platform.toLowerCase()
    );
    if (index !== -1) {
      this.socialMediaList[index].isVisible = this.visibilitySettings[platform];
    }
  }

  submitForm = async () => {
    // Update personalDetails with current social media list
    for (const social of this.socialMediaList) {
      const platformName = social.name.toLowerCase();
      if (platformName in this.personalDetails.personalSocial) {
        (this.personalDetails.personalSocial as any)[platformName] = social.link;
      }
    }

    let result = await this.authService.updatePersonalDetails(this.personalDetails);
    if (result) {
      swalHelper.showToast('Personal Details Updated Successfully!', "success");
    }
  }
}






// REMOVE FUNCTIONALITY OF EACH SOCIAL LINK DELETED

  // removeSocialMedia(index: number) {
    // <button class="btn btn-danger btn-sm" (click)="removeSocialMedia(i)">Remove</button>
  //   const removed = this.socialMediaList[index];
  //   this.socialMediaList.splice(index, 1);

  //   // Also remove from personalDetails if it exists there
  //   const platformName = removed.name.toLowerCase();
  //   if (platformName in this.personalDetails.personalSocial) {
  //     (this.personalDetails.personalSocial as any)[platformName] = '';
  //   }
  // }