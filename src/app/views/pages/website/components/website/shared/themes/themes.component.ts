import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { WebsiteBuilderService } from 'src/app/services/website-builder.service';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/env/env.local';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';

@Component({
  selector: 'app-themes',
  templateUrl: './themes.component.html',
  styleUrl: './themes.component.scss',
})
export class ThemesComponent implements OnInit {
  themes: any[] = [];
  currentAppliedTheme: any[] = [];
  currentBcardId: string = '';
  isLoading: boolean = false;

  constructor(
    private websiteBuilderService: WebsiteBuilderService,
    private authService: AuthService,
    private storage: AppStorage,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.currentBcardId = this.storage.get(common.BUSINESS_CARD);
    await this.fetchThemes();
    await this.fetchCurrentTheme();
  }

  async fetchThemes() {
    this.isLoading = true;
    try {
      const themesData = await this.websiteBuilderService.GetAllWebsiteThemes();
      if (themesData) {
        this.themes = themesData.map((theme: any) => ({
          title: theme.name,
          code: theme.code,
          id: theme._id,
        }));
      }
    } catch (error) {
      console.error('Error fetching themes: ', error);
      swalHelper.showToast('Error fetching themes!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  async fetchCurrentTheme() {
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let results = await this.authService.getWebsiteDetails(businessCardId);
      
      if (results && results.theme) {
        this.currentAppliedTheme = [{
          currentThemeCode: results.theme,
          id: businessCardId
        }];
      }
    } catch (error) {
      console.error('Error fetching current theme: ', error);
      swalHelper.showToast('Error fetching current theme!', 'error');
    } finally {
      this.cdr.markForCheck();
    }
  }

  isCurrentTheme(itemCode: string): boolean {
    return this.currentAppliedTheme.some(theme =>
      theme.id === this.currentBcardId && theme.currentThemeCode === itemCode
    );
  }

  previewTheme(themeCode: string): void {
    const business_card = this.storage.get(common.BUSINESS_CARD);
    const url = `${environment.baseURL}/website/${business_card}?theme=${themeCode}`;
    window.open(url, '_blank');
  }

  async themeApply(themeId: string) {
    this.isLoading = true;
    try {
      const businessCardId = this.storage.get(common.BUSINESS_CARD);
      
      const payload = {
        businessCardId: businessCardId,
        themeId: themeId
      };
      
      let result = await this.websiteBuilderService.UpdateWebsiteThemes(payload);
      
      if (result) {
        swalHelper.showToast('Theme Updated Successfully!', 'success');
        await this.fetchCurrentTheme();
      }
    } catch (error) {
      console.error('Error applying theme: ', error);
      swalHelper.showToast('Error applying theme!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }
}