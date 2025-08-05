import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';
import { WebsiteBuilderService } from 'src/app/services/website-builder.service';

@Component({
  selector: 'app-theme-color',
  templateUrl: './theme-color.component.html',
  styleUrl: './theme-color.component.scss'
})
export class ThemeColorComponent implements OnInit {
  isLoading: boolean = false;
  businessCardId: any;

  currentThemeColors = {
    backgroundColor: '#ffffff',
    SecondaryColor: '#f8f9fa',
    textColor: '#212529',
    buttonColor: '#0d6efd',
    buttonTextColor: '#ffffff'
  };

  editingThemeColors = {
    backgroundColor: '#ffffff',
    SecondaryColor: '#f8f9fa',
    textColor: '#212529',
    buttonColor: '#0d6efd',
    buttonTextColor: '#ffffff'
  };

  constructor(
    private storage: AppStorage, 
    public authService: AuthService, 
    public modal: ModalService, 
    private websiteService: WebsiteBuilderService
  ) { }

  async ngOnInit() {
    this.businessCardId = this.storage.get(common.BUSINESS_CARD);
    await this.fetchWebsiteDetails();
  }

  async fetchWebsiteDetails() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let results = await this.authService.getWebsiteDetails(businessCardId);

      if (results) {
        if (results.themeColors) {
          this.currentThemeColors = {
            backgroundColor: results.themeColors.backgroundColor || '#ffffff',
            SecondaryColor: results.themeColors.SecondaryColor || '#f8f9fa',
            textColor: results.themeColors.textColor || '#212529',
            buttonColor: results.themeColors.buttonColor || '#0d6efd',
            buttonTextColor: results.themeColors.buttonTextColor || '#ffffff'
          };
        }
      } else {
        swalHelper.showToast('Failed to fetch theme colors!', 'warning');
      }
    } catch (error) {
      console.error('Error fetching website details: ', error);
      swalHelper.showToast('Error fetching theme colors!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  editThemeColors() {
    this.editingThemeColors = { ...this.currentThemeColors };
    this.modal.open('EditThemeColorsModal');
  }

  async updateThemeColors() {
    if (!this.validateThemeColors()) {
      return;
    }

    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);

      const data = {
        businessCardId: businessCardId,
        backgroundColor: this.editingThemeColors.backgroundColor,
        SecondaryColor: this.editingThemeColors.SecondaryColor,
        textColor: this.editingThemeColors.textColor,
        buttonColor: this.editingThemeColors.buttonColor,
        buttonTextColor: this.editingThemeColors.buttonTextColor
      };

      const result = await this.websiteService.updateThemeColor(data);

      if (result) {
        this.currentThemeColors = { ...this.editingThemeColors };
        await this.fetchWebsiteDetails();
        this.modal.close('EditThemeColorsModal');
        swalHelper.showToast('Theme colors updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating theme colors: ', error);
      swalHelper.showToast('Error updating theme colors!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  validateThemeColors(): boolean {
    if (!this.editingThemeColors.backgroundColor) {
      swalHelper.showToast('Background color is required!', 'warning');
      return false;
    }

    if (!this.editingThemeColors.textColor) {
      swalHelper.showToast('Text color is required!', 'warning');
      return false;
    }

    if (!this.editingThemeColors.buttonColor) {
      swalHelper.showToast('Button color is required!', 'warning');
      return false;
    }

    if (!this.editingThemeColors.buttonTextColor) {
      swalHelper.showToast('Button text color is required!', 'warning');
      return false;
    }

    return true;
  }

  resetToDefaults() {
    this.editingThemeColors = {
      backgroundColor: '#ffffff',
      SecondaryColor: '#f8f9fa',
      textColor: '#212529',
      buttonColor: '#0d6efd',
      buttonTextColor: '#ffffff'
    };
  }

  onCloseModal(modal: string) {
    this.modal.close(modal);
  }
}