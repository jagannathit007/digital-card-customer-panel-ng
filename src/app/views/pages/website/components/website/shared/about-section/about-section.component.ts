import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';

@Component({
  selector: 'app-about-section',
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss',
})
export class AboutSectionComponent implements OnInit {
 
  isLoading: boolean = false;
  aboutCompanyList: any = {
    mission: '',
    vision: '',
    history: ''
  };

  constructor(private storage: AppStorage, public authService: AuthService) {}

  ngOnInit() {
    this.fetchWebsiteDetails();
  }

  async fetchWebsiteDetails() {
    this.isLoading = true; 
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let results = await this.authService.getWebsiteDetails(businessCardId);

      if (results && results.aboutCompany) {
        this.aboutCompanyList = {
          mission: results.aboutCompany.mission || '',
          vision: results.aboutCompany.vision || '',
          history: results.aboutCompany.history || ''
        };

      } else {
        swalHelper.showToast('Company information not found!', 'warning');
      }
    } catch (error) {
      console.error('Error fetching company information: ', error);
      swalHelper.showToast('Error fetching company information!', 'error');
    } finally {
      this.isLoading = false; 
    }
  }

  async saveAboutUs() {
    this.isLoading = true; 
    try {
      let response = await this.authService.updateAboutUs(this.aboutCompanyList);
      
      if (response) {
        swalHelper.showToast('Company information updated successfully!', 'success');
      } else {
        swalHelper.showToast('Failed to update company information!', 'warning');
      }
    } catch (error) {
      console.error('Error updating company information:', error);
      swalHelper.showToast('Something went wrong!', 'error');
    } finally {
      this.isLoading = false; 
    }
  }




}
