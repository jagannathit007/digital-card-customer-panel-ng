import { Component, OnInit } from '@angular/core';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AuthService } from 'src/app/services/auth.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';
import { SOCIAL_MEDIA_LINKS } from 'src/app/core/utilities/socialMedia';
declare var $: any;

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
  styleUrl: './personal-details.component.scss',
})
export class PersonalDetailsComponent implements OnInit {
  baseURL = environment.baseURL;
  newSocialMedia = { name: '', link: '', image: '' }; 
  socialMediaImage: File | undefined;
  socialMediaOptions = SOCIAL_MEDIA_LINKS; 
  selectedSocialMedia: string | undefined;
  personalDetails: any;
  isEditMode: boolean = false;

  constructor(
    private authService: AuthService,
    private storage: AppStorage,
    private modal: ModalService
  ) {}

  ngOnInit() {
    this.getCards();
  }

  enableEdit() {
    this.isEditMode = true;
  }

  cancelEdit() {
    this.isEditMode = false;
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

  
  onSocialMediaSelect(event: any) {
    const eventValue = event && typeof event === 'object' && event.name ? event.name : event;

    if (typeof eventValue !== 'string' || !eventValue) {
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

    if (selected) {
      this.newSocialMedia.name = selected.name;
      this.newSocialMedia.image = selected.image;

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
      this.newSocialMedia = { name: '', link: '', image: '' };
      this.socialMediaImage = undefined;
      swalHelper.showToast('Please select a valid social media platform', 'error');
    }
  }

  addSocialMedia = async () => {
    if (this.socialMediaImage) {
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
        this.selectedSocialMedia = undefined; 
        this.modal.close('addSocialMediaModal');
        $('#platformImage').val(null);
        this.newSocialMedia = { name: '', link: '', image: '' };
        swalHelper.showToast(
          'Business Details Social Updated Successfully!',
          'success'
        );
      }
    } else {
      swalHelper.showToast(
        'Please select a platform image',
        'error'
      );
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
      this.isEditMode = false;
    }
  };

  onOpneSocialMediaModel() {
    this.modal.close('addSocialMediaModal');
    setTimeout(() => {
      this.modal.open('addSocialMediaModal');
    }, 100);
  }

  onCloseSocialMediaModal() {
    this.modal.close('addSocialMediaModal');
    this.newSocialMedia = { name: '', link: '', image: '' };
    this.socialMediaImage = undefined;
    this.selectedSocialMedia = undefined;
  }
}