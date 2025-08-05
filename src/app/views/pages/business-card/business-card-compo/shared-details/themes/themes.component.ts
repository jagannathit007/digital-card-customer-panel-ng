import { Component, Input } from '@angular/core';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AuthService } from 'src/app/services/auth.service';
import { ConfigService } from 'src/app/services/config.service';
import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-themes',
  templateUrl: './themes.component.html',
  styleUrl: './themes.component.scss',
})
export class ThemeComponent {
  themes: any[] = [];
  currentAppliedTheme: any[]= [];
  currentBcardId = this.getLocalStorageData("business_card");
  constructor(private authService: AuthService,private config:ConfigService) { }
  
  async ngOnInit() {

    const themesData = await this.authService.getThemes();
    if (themesData) {
      this.themes = themesData.map((theme: any) => ({
        title: theme.name,
        code: theme.code,
        id: theme._id,
      }));
    }
    let results = await this.authService.getBusinessCards();
    if (results) {
      this.currentAppliedTheme = results.map((Bcard: any) => ({
        currentThemeCode: Bcard.theme,
        id: Bcard._id,
      }));
    }

  }

  isCurrentTheme(itemCode: string): boolean {
    return this.currentAppliedTheme.some(theme =>
      theme.id === this.currentBcardId && theme.currentThemeCode === itemCode
    );
  }

  getLocalStorageData(key: string): any {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  previewTheme(themeCode: string): void {
    const business_card = this.getLocalStorageData('business_card');
    const url = `${this.config.backendURL}/${business_card}?theme=${themeCode}`;
    window.open(url, '_blank');
  }

  async themeApply(themeId: string) {
    let result = await this.authService.applyTheme(themeId);
    if (result) {
      swalHelper.showToast('Theme Updated Successfully!', 'success');
    }
    await this.ngOnInit();
  }
}
