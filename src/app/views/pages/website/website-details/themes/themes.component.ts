import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { swalHelper } from 'src/app/core/constants/swal-helper';
@Component({
  selector: 'app-themes',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule
  ],
  templateUrl: './themes.component.html',
  styleUrl: './themes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemesComponent { 
  themes: any[] = [
    { title: 'Dark Mode', code: 'dark-mode', id: '1' },
    { title: 'Light Mode', code: 'light-mode', id: '2' },
    { title: 'Blue Theme', code: 'blue-theme', id: '3' },
    { title: 'Green Theme', code: 'green-theme', id: '4' },
  ];
  currentAppliedTheme: any[] = [
    { currentThemeCode: 'dark-mode', id: '1' }
  ];
  currentBcardId = '1'; // Static Business Card ID

  isCurrentTheme(itemCode: string): boolean {
    return this.currentAppliedTheme.some(theme =>
      theme.id === this.currentBcardId && theme.currentThemeCode === itemCode
    );
  }

  previewTheme(themeCode: string): void {
    const url = `https://example.com/preview?theme=${themeCode}`;
    window.open(url, '_blank');
  }

  themeApply(themeId: string) {
    this.currentAppliedTheme = [{ currentThemeCode: themeId, id: this.currentBcardId }];
    swalHelper.showToast('Theme Updated Successfully!', 'success');
  }
}
