import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { common } from 'src/app/core/constants/common';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss',
})
export class AccountSettingsComponent {

  constructor(private storage: AppStorage, private authService: AuthService) {
    let profileData = this.storage.get(common.USER_DATA);
    if (profileData != null) {
      this.profile.name = profileData.name;
      this.profile.email = profileData.emailId;
      this.profile.mobile = profileData.mobile;
    }
  }

  profile = { name: '', email: '', mobile: '' };
  passwordForm = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }

  onProfileUpdate = async () => {
    let result = await this.authService.updateProfile({
      name: this.profile.name,
      emailId: this.profile.email
    });
    if (result) {
      swalHelper.showToast("Profile updated successfully!", 'success');
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  onPasswordUpdate = async () => {
    if (this.passwordForm.newPassword.length >= 6 && this.passwordForm.confirmPassword.length >= 6) {
      if (this.passwordForm.newPassword != this.passwordForm.confirmPassword) {
        swalHelper.showToast("New & Confirm Password Not Matched", 'warning');
      } else {
        let result = await this.authService.changePassword({
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword,
        });

        if (result) {
          swalHelper.showToast("Password updated!", 'success');
          this.passwordForm = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        }
      }
    } else {
      swalHelper.showToast("New & Confirm Password Must have Minimum 4 Characters", 'warning');
    }
  }
}
