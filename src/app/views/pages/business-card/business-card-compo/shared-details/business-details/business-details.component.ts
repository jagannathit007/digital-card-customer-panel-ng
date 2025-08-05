import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';
import { BusinessCardService } from 'src/app/services/business-card.service';
import { SharedService } from 'src/app/services/shared.service';
import { SOCIAL_MEDIA_LINKS } from 'src/app/core/utilities/socialMedia';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-business-details',
  templateUrl: './business-details.component.html',
  styleUrls: ['./business-details.component.scss'],
})
export class BusinessDetailsComponent implements OnInit {
  baseURL = environment.imageURL;
  homeURL = this.config.backendURL;
  newSocialMedia = { name: '', link: '', image: '' };
  socialMediaImage: File | undefined;
  socialMediaOptions = SOCIAL_MEDIA_LINKS;
  selectedSocialMedia: string | undefined;
  businessCardID: any;
  profileImage: File | undefined;
  coverImage: File | undefined;
  logoImage: File | undefined;
  profileImagePreview: string | undefined;
  coverImagePreview: string | undefined;
  logoImagePreview: string | undefined;
  businessProfile: any;
  isEditMode: boolean = false;
  response: any;
  hasCheckedUserName = false;

  constructor(
    private storage: AppStorage,
    public authService: AuthService,
    private modal: ModalService,
    private businessService: BusinessCardService,
    private sharedService: SharedService,
    private config:ConfigService
  ) {
    this.getCards();
  }

  ngOnInit(): void {
    this.businessCardID = this.storage.get(common.BUSINESS_CARD);
  }

  enableEdit() {
    this.isEditMode = true;
  }

  cancelEdit() {
    this.isEditMode = false;
    this.profileImage = undefined;
    this.coverImage = undefined;
    // Do not clear previews, let them persist
    this.getCards();
  }

  getCards = async () => {
    try {
      let results = await this.authService.getBusinessCards();
      if (results) {
        let businessCardId = this.storage.get(common.BUSINESS_CARD);
        let card = results.find((v: any) => v._id === businessCardId);
        if (card) {
          this.businessProfile = {
            company: card.company,
            aboutCompany: card.aboutCompany,
            companyAddress: card.companyAddress,
            message: card.message,
            companySocialMedia: card.companySocialMedia || [],
            businessKeyword: card.businessKeyword,
            userName: card.userName ? card.userName : '',
            image: card.image || { profileImage: '', coverImage: '' }, // Ensure image object exists
          };
          // If no new image is selected, keep the server images as previews
          if (!this.profileImagePreview && this.businessProfile.image.profileImage) {
            this.profileImagePreview = this.baseURL +  this.businessProfile.image.profileImage;
          }
          if (!this.coverImagePreview && this.businessProfile.image.coverImage) {
            this.coverImagePreview = this.baseURL + this.businessProfile.image.coverImage;
          }
          if (!this.logoImagePreview && this.businessProfile.image.logoImage) {
            this.logoImagePreview = this.baseURL + this.businessProfile.image.logoImage;
          }
        } else {
          console.error('No card found with the given businessCardId:', businessCardId);
          swalHelper.showToast('No business card found', 'error');
        }
      } else {
        console.error('No results returned from getBusinessCards');
        swalHelper.showToast('Failed to load business cards', 'error');
      }
    } catch (error) {
      console.error('Error fetching business cards:', error);
      swalHelper.showToast('Failed to load business cards', 'error');
    }
  };

  onSocialMediaSelect(event: any) {
    // console.log('Selected value from dropdown:', event);
    // console.log('Type of event:', typeof event);
    // console.log('socialMediaOptions:', this.socialMediaOptions);

    const eventValue = event && typeof event === 'object' && event.name ? event.name : event;

    if (typeof eventValue !== 'string' || !eventValue) {
      console.warn('Event is not a valid string:', eventValue);
      this.newSocialMedia = { name: '', link: '', image: '' };
      this.socialMediaImage = undefined;
      swalHelper.showToast('Please select a valid social media platform', 'error');
      return;
    }

    const trimmedEventValue = eventValue.trim();
    const selected = this.socialMediaOptions.find(
      (option: any) =>
        option.name &&
        option.name.trim().toLowerCase() === trimmedEventValue.toLowerCase()
    );
    // console.log('Found selected option:', selected);

    if (selected) {
      this.newSocialMedia.name = selected.name;
      this.newSocialMedia.image = selected.image;
      // console.log('Updated newSocialMedia:', this.newSocialMedia);

      fetch(selected.image)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch image');
          }
          return res.blob();
        })
        .then((blob) => {
          this.socialMediaImage = new File([blob], `${selected.name}.png`, {
            type: 'image/png',
          });
          // console.log('socialMediaImage set:', this.socialMediaImage);

          const fileInput = document.getElementById('platformImage') as HTMLInputElement;
          if (fileInput && this.socialMediaImage) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(this.socialMediaImage);
            fileInput.files = dataTransfer.files;
          }
        })
        .catch((err) => {
          console.error('Error fetching image:', err);
          swalHelper.showToast('Failed to load social media icon', 'error');
        });
    } else {
      console.warn('No matching social media option found for:', trimmedEventValue);
      this.newSocialMedia = { name: '', link: '', image: '' };
      this.socialMediaImage = undefined;
      swalHelper.showToast('Please select a valid social media platform', 'error');
    }
  }

  addSocialMedia = async () => {
    if (!this.newSocialMedia.name || !this.newSocialMedia.link || !this.socialMediaImage) {
      swalHelper.showToast('Please fill all fields: Name, Image, and Link', 'error');
      return;
    }

    try {
      let formData = new FormData();
      formData.append('name', this.newSocialMedia.name);
      formData.append('link', this.newSocialMedia.link);
      formData.append('type', 'business');
      formData.append('businessCardId', this.storage.get(common.BUSINESS_CARD));
      formData.append('file', this.socialMediaImage, this.socialMediaImage.name);

      let result = await this.authService.updateBusinessSocialDetails(formData);
      if (result) {
        this.businessProfile.companySocialMedia = result;
        this.resetForm();
        this.modal.close('addSocialMediaModal');
        swalHelper.showToast('Business Details Social Updated Successfully!', 'success');
      } else {
        swalHelper.showToast('Failed to add social media link', 'error');
      }
    } catch (error) {
      console.error('Error adding social media:', error);
      swalHelper.showToast('Failed to add social media link', 'error');
    }
  };

  onSocialMediaIcon(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.socialMediaImage = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.newSocialMedia.image = reader.result as string;
        }
      };
      if (this.socialMediaImage) {
        reader.readAsDataURL(this.socialMediaImage);
      }
    }
  }

  onSelectProfileImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.profileImage = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.profileImage);
    }
  }

  onSelectCoverImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.coverImage = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.coverImagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.coverImage);
    }
  }

  onSelectlogoImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.logoImage = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.logoImagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.logoImage);
    }
  }

  deleteSocial(index: number) {
    this.businessProfile.companySocialMedia.splice(index, 1);
  }

  onSubmit = async () => {
    try {
      let formData = new FormData();
      formData.append('company', this.businessProfile.company);
      formData.append('aboutCompany', this.businessProfile.aboutCompany);
      formData.append('companyAddress', this.businessProfile.companyAddress);
      formData.append('businessCardId', this.storage.get(common.BUSINESS_CARD));
      formData.append('businessKeyword', this.businessProfile.businessKeyword);
      formData.append(
        'companySocialMedia',
        JSON.stringify(this.businessProfile.companySocialMedia)
      );
      formData.append('message', JSON.stringify(this.businessProfile.message));
      formData.append('userName', this.businessProfile.userName);
      if (this.profileImage) {
        formData.append('profileImage', this.profileImage, this.profileImage.name);
      }

      if (this.coverImage) {
        formData.append('coverImage', this.coverImage, this.coverImage.name);
      }

      if (this.logoImage) {
        formData.append('logoImage', this.logoImage, this.logoImage.name);
      }

      let result = await this.authService.updateBusinessDetails(formData);
      if (result) {
        swalHelper.showToast('Business Details Updated Successfully!', 'success');
        this.sharedService.triggerHeaderRefresh();
        this.isEditMode = false;
        this.profileImage = undefined;
        this.coverImage = undefined;
        this.logoImage = undefined;
        this.profileImagePreview = undefined; // Clear preview after successful submit
        this.coverImagePreview = undefined;   // Clear preview after successful submit
        this.logoImagePreview = undefined;   // Clear preview after successful submit
        this.getCards(); // Refresh data to get updated images
      } else {
        swalHelper.showToast('Failed to update business details', 'error');
      }
    } catch (error) {
      console.error('Error updating business details:', error);
      swalHelper.showToast('Failed to update business details', 'error');
    }
  };

  _uniqueUserName = async () => {
    this.hasCheckedUserName = true;
    let response = await this.businessService.getUserName({
      businessCardId: this.businessCardID,
      userName: this.businessProfile.userName,
    });
    if (response) {
      this.response = response;
      this.hasCheckedUserName = false;
    }
  };

  onOpenSocialMediaModal() {
    this.resetForm();
    this.modal.open('addSocialMediaModal');
  }

  onCloseSocialMediaModal() {
    this.modal.close('addSocialMediaModal');
    this.resetForm();
  }

  private resetForm() {
    this.newSocialMedia = { name: '', link: '', image: '' };
    this.socialMediaImage = undefined;
    this.selectedSocialMedia = undefined;
    const fileInput = document.getElementById('platformImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}