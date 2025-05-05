import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { common } from 'src/app/core/constants/common';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent {
  constructor(private storage: AppStorage, private authService: AuthService) {
    let profileData = this.storage.get(common.USER_DATA);
    if (profileData != null) {
      this.profile.name = profileData.name;
      this.profile.email = profileData.emailId;
      this.profile.mobile = profileData.mobile;
    }
  }

  profile = { name: '', email: '', mobile: '' };

  onProfileUpdate = async () => {
    let result = await this.authService.updateProfile({
      name: this.profile.name,
      emailId: this.profile.email,
    });
    if (result) {
      swalHelper.showToast('Profile updated successfully!', 'success');
      // setTimeout(() => window.location.reload(), 1000)
    }
  };
}
