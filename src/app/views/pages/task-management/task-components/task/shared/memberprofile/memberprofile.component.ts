// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { swalHelper } from 'src/app/core/constants/swal-helper';
// import { environment } from 'src/env/env.local';
// import { ModalService } from 'src/app/core/utilities/modal';
// import { TaskMemberAuthService } from 'src/app/services/task-member-auth.service';

// @Component({
//   selector: 'app-memberprofile',
//   templateUrl: './memberprofile.component.html',
//   styleUrl: './memberprofile.component.scss'
// })
// export class MemberprofileComponent implements OnInit {
//   activeTab: string = 'profile';
//   memberData: any = null;
//   profileForm: FormGroup;
//   passwordForm: FormGroup;
//   isLoading: boolean = false;
//   isEditing: boolean = false;
//   isSaving: boolean = false;
//   isEditingPassword: boolean = false;
//   isChangingPassword: boolean = false;
//   selectedFile: File | null = null;
//   imagePreview: string | null = null;
//   showOldPassword: boolean = false;
//   showNewPassword: boolean = false;
//   showConfirmPassword: boolean = false;
  
//   // Skills management
//   skillsList: string[] = [];
//   currentSkill: string = '';

//   constructor(
//     private fb: FormBuilder,
//     private storage: AppStorage,
//     private modal: ModalService,
//     private taskMemberAuthService: TaskMemberAuthService
//   ) {
//     this.profileForm = this.fb.group({
//       name: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
//       mobile: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
//       emailId: [{ value: '', disabled: true }], // Always disabled
//       role: [{ value: '', disabled: true }], // Always disabled
//       experience: [{ value: '', disabled: true }]
//     });

//     this.passwordForm = this.fb.group({
//       oldPassword: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(6)]],
//       newPassword: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(6)]],
//       confirmPassword: [{ value: '', disabled: true }, [Validators.required]]
//     }, { validators: this.passwordMatchValidator });
//   }

//   ngOnInit() {
//     this.getTeamMemberProfile();
//   }

//   // Mobile number input restriction
//   onMobileInput(event: any): void {
//     const input = event.target;
//     let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
//     if (value.length > 10) {
//       value = value.substring(0, 10); // Limit to 10 digits
//     }
    
//     input.value = value;
//     this.profileForm.get('mobile')?.setValue(value);
//   }

//   // Skills management methods
//   addSkill(): void {
//     const skill = this.currentSkill.trim();
//     if (skill && !this.skillsList.includes(skill)) {
//       this.skillsList.push(skill);
//       this.currentSkill = '';
//     }
//   }

//   removeSkill(index: number): void {
//     this.skillsList.splice(index, 1);
//   }

//   onSkillKeyPress(event: KeyboardEvent): void {
//     if (event.key === 'Enter') {
//       event.preventDefault();
//       this.addSkill();
//     }
//   }

//   togglePasswordVisibility(field: string): void {
//     if (field === 'oldPassword') {
//       this.showOldPassword = !this.showOldPassword;
//     } else if (field === 'newPassword') {
//       this.showNewPassword = !this.showNewPassword;
//     } else if (field === 'confirmPassword') {
//       this.showConfirmPassword = !this.showConfirmPassword;
//     }
//   }

//   // Custom validator to check if passwords match
//   passwordMatchValidator(form: FormGroup) {
//     const newPassword = form.get('newPassword');
//     const confirmPassword = form.get('confirmPassword');
    
//     if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
//       confirmPassword.setErrors({ passwordMismatch: true });
//       return { passwordMismatch: true };
//     }
    
//     if (confirmPassword?.hasError('passwordMismatch')) {
//       if (confirmPassword.errors) {
//         delete confirmPassword.errors['passwordMismatch'];
//         if (Object.keys(confirmPassword.errors).length === 0) {
//           confirmPassword.setErrors(null);
//         }
//       }
//     }
    
//     return null;
//   }

//   switchTab(tab: string): void {
//     this.activeTab = tab;
//     if (this.isEditing) {
//       this.cancelEdit();
//     }
//     if (this.isEditingPassword) {
//       this.cancelPasswordEdit();
//     }
//   }

//   async getTeamMemberProfile() {
//     try {
//       this.isLoading = true;
//       const token = this.storage.get(teamMemberCommon.TEAM_MEMBER_TOKEN);
//       if (!token) {
//         swalHelper.showToast('Authentication token not found', 'error');
//         return;
//       }

//       const result = await this.taskMemberAuthService.getTeamMemberProfile(token);
//       if (result) {
//         this.memberData = result;
//         this.populateForm(result);
//       }
//     } catch (error) {
//       console.error('Error fetching profile:', error);
//       swalHelper.showToast('Failed to load profile data', 'error');
//     } finally {
//       this.isLoading = false;
//     }
//   }

//   populateForm(data: any) {
//     this.profileForm.patchValue({
//       name: data.name || '',
//       mobile: data.mobile || '',
//       emailId: data.emailId || '',
//       role: data.role || '',
//       experience: data.experience || ''
//     });

//     // Populate skills list
//     this.skillsList = Array.isArray(data.skills) ? [...data.skills] : 
//                      (data.skills ? data.skills.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill.length > 0) : []);
//   }

//   enableEdit() {
//     this.isEditing = true;
//     // Enable only editable fields (not email and role)
//     this.profileForm.get('name')?.enable();
//     this.profileForm.get('mobile')?.enable();
//     this.profileForm.get('experience')?.enable();
    
//     // Email and role always remain disabled
//     this.profileForm.get('emailId')?.disable();
//     this.profileForm.get('role')?.disable();
//   }

//   cancelEdit() {
//     this.isEditing = false;
//     // Disable all editable fields
//     this.profileForm.get('name')?.disable();
//     this.profileForm.get('mobile')?.disable();
//     this.profileForm.get('experience')?.disable();
    
//     // Reset form to original values
//     this.populateForm(this.memberData);
    
//     // Clear image selection
//     this.selectedFile = null;
//     this.imagePreview = null;
    
//     // Reset current skill input
//     this.currentSkill = '';
//   }

//   // Password form methods
//   enablePasswordEdit() {
//     this.isEditingPassword = true;
//     this.passwordForm.get('oldPassword')?.enable();
//     this.passwordForm.get('newPassword')?.enable();
//     this.passwordForm.get('confirmPassword')?.enable();
//     this.passwordForm.reset();
//   }

//   cancelPasswordEdit() {
//     this.isEditingPassword = false;
//     this.passwordForm.get('oldPassword')?.disable();
//     this.passwordForm.get('newPassword')?.disable();
//     this.passwordForm.get('confirmPassword')?.disable();
//     this.passwordForm.reset();
//   }

//   async changePassword() {
//     if (this.passwordForm.invalid) {
//       this.markPasswordFormGroupTouched();
//       return;
//     }

//     try {
//       this.isChangingPassword = true;
//       const formValue = this.passwordForm.getRawValue();
      
//       const passwordData = {
//         oldPassword: formValue.oldPassword,
//         newPassword: formValue.newPassword
//       };

//       const result = await this.taskMemberAuthService.ChangeMemberPassword(passwordData);
//       if (result) {
//         swalHelper.showToast('Password changed successfully!', 'success');
//         this.handlePasswordChangeSuccess();
//       }
//     } catch (error) {
//       console.error('Error changing password:', error);
//       swalHelper.showToast('Failed to change password', 'error');
//     } finally {
//       this.isChangingPassword = false;
//     }
//   }

//   private handlePasswordChangeSuccess() {
//     this.isEditingPassword = false;
//     this.passwordForm.reset();
    
//     // Disable all password fields
//     this.passwordForm.get('oldPassword')?.disable();
//     this.passwordForm.get('newPassword')?.disable();
//     this.passwordForm.get('confirmPassword')?.disable();
//   }

//   private markPasswordFormGroupTouched() {
//     Object.keys(this.passwordForm.controls).forEach(key => {
//       const control = this.passwordForm.get(key);
//       control?.markAsTouched();
//     });
//   }

//   getPasswordFieldError(fieldName: string): string {
//     const field = this.passwordForm.get(fieldName);
//     if (field?.hasError('required')) {
//       return `${this.getFieldDisplayName(fieldName)} is required`;
//     }
//     if (field?.hasError('minlength')) {
//       return `${this.getFieldDisplayName(fieldName)} must be at least 6 characters`;
//     }
//     if (field?.hasError('passwordMismatch')) {
//       return 'Passwords do not match';
//     }
//     return '';
//   }

//   private getFieldDisplayName(fieldName: string): string {
//     const displayNames: { [key: string]: string } = {
//       'oldPassword': 'Current Password',
//       'newPassword': 'New Password',
//       'confirmPassword': 'Confirm Password'
//     };
//     return displayNames[fieldName] || fieldName;
//   }

//   onFileSelected(event: any) {
//     const file = event.target.files[0];
//     if (file) {
//       // Validate file type
//       const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
//       if (!allowedTypes.includes(file.type)) {
//         swalHelper.showToast('Please select a valid image file (JPG, PNG, GIF)', 'error');
//         return;
//       }

//       // Validate file size (max 5MB)
//       if (file.size > 5 * 1024 * 1024) {
//         swalHelper.showToast('Image size should be less than 5MB', 'error');
//         return;
//       }

//       this.selectedFile = file;
      
//       // Create preview
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         this.imagePreview = e.target?.result as string;
//       };
//       reader.readAsDataURL(file);
//     }
//   }

//   async updateProfile() {
//     if (this.profileForm.invalid) {
//       this.markFormGroupTouched();
//       return;
//     }

//     try {
//       this.isSaving = true;
//       const formData = this.profileForm.getRawValue();
      
//       const updateData = {
//         name: formData.name,
//         mobile: formData.mobile,
//         skills: this.skillsList,
//         experience: formData.experience
//       };

//       // If image is selected, create FormData for file upload
//       if (this.selectedFile) {
//         const formDataWithImage = new FormData();
//         formDataWithImage.append('file', this.selectedFile);
//         formDataWithImage.append('name', updateData.name);
//         formDataWithImage.append('mobile', updateData.mobile);
//         this.skillsList.forEach((skill: string) => {
//           formDataWithImage.append('skills[]', skill);
//         });        
//         formDataWithImage.append('experience', updateData.experience);
        
//         const result = await this.taskMemberAuthService.UpdateTeamMember(formDataWithImage);
//         if (result) {
//           swalHelper.showToast('Profile updated successfully!', 'success');
//           this.handleUpdateSuccess();
//         }
//       } else {
//         const result = await this.taskMemberAuthService.UpdateTeamMember(updateData);
//         if (result) {
//           swalHelper.showToast('Profile updated successfully!', 'success');
//           this.handleUpdateSuccess();
//         }
//       }
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       swalHelper.showToast('Failed to update profile', 'error');
//     } finally {
//       this.isSaving = false;
//     }
//   }

//   private handleUpdateSuccess() {
//     this.isEditing = false;
//     this.selectedFile = null;
//     this.imagePreview = null;
//     this.currentSkill = '';
//     this.getTeamMemberProfile(); // Refresh data
    
//     // Disable all editable fields
//     this.profileForm.get('name')?.disable();
//     this.profileForm.get('mobile')?.disable();
//     this.profileForm.get('experience')?.disable();
//   }

//   private markFormGroupTouched() {
//     Object.keys(this.profileForm.controls).forEach(key => {
//       const control = this.profileForm.get(key);
//       control?.markAsTouched();
//     });
//   }

//   getFieldError(fieldName: string): string {
//     const field = this.profileForm.get(fieldName);
//     if (field?.hasError('required')) {
//       return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
//     }
//     if (field?.hasError('minlength')) {
//       return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least 2 characters`;
//     }
//     if (field?.hasError('pattern')) {
//       return 'Please enter a valid 10-digit mobile number';
//     }
//     return '';
//   }

//   getProfileImageUrl(): string {
//     if (this.imagePreview) {
//       return this.imagePreview; // Show preview during editing
//     }
//     if (this.memberData?.profileImage) {
//       return `${environment.imageURL}${this.memberData.profileImage}`;
//     }
//     return 'assets/images/avatar.png'; 
//   }

//   getInitials(): string {
//     if (this.memberData?.name) {
//       return this.memberData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
//     }
//     return 'M';
//   }

//   triggerFileInput() {
//     const fileInput = document.getElementById('profileImageInput') as HTMLInputElement;
//     fileInput?.click();
//   }
// }

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';
import { TaskMemberAuthService } from 'src/app/services/task-member-auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-memberprofile',
  templateUrl: './memberprofile.component.html',
  styleUrl: './memberprofile.component.scss'
})
export class MemberprofileComponent implements OnInit {
  activeTab: string = 'profile';
  memberData: any = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isLoading: boolean = false;
  isEditing: boolean = false;
  isSaving: boolean = false;
  isEditingPassword: boolean = false;
  isChangingPassword: boolean = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  showOldPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  // Skills management
  skillsList: string[] = [];
  currentSkill: string = '';

  constructor(
    private fb: FormBuilder,
    private storage: AppStorage,
    private modal: ModalService,
    private taskMemberAuthService: TaskMemberAuthService,
    private route: ActivatedRoute
  ) {
    this.profileForm = this.fb.group({
      name: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      mobile: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      emailId: [{ value: '', disabled: true }], // Always disabled
      role: [{ value: '', disabled: true }], // Always disabled
      experience: [{ value: '', disabled: true }]
    });

    this.passwordForm = this.fb.group({
      oldPassword: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(6)]],
      newPassword: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(6)]],
      confirmPassword: [{ value: '', disabled: true }, [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.getTeamMemberProfile();
  }

  // Check if profile is incomplete and auto-enable edit mode
  checkProfileCompleteness() {
    if (this.memberData) {
      const { skills, mobile, experience } = this.memberData;
      
      // Check if skills, mobile, or experience is missing or empty
      const isProfileIncomplete = !skills?.length || !mobile || !experience;
      
      if (isProfileIncomplete) {
        // Auto enable edit mode if profile is incomplete
        this.enableEdit();
        swalHelper.showToast('Please complete your profile information', 'info');
      }
    }
  }

  // Mobile number input restriction
  onMobileInput(event: any): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length > 10) {
      value = value.substring(0, 10); // Limit to 10 digits
    }
    
    input.value = value;
    this.profileForm.get('mobile')?.setValue(value);
  }

  // Skills management methods
  addSkill(): void {
    const skill = this.currentSkill.trim();
    if (skill && !this.skillsList.includes(skill)) {
      this.skillsList.push(skill);
      this.currentSkill = '';
    }
  }

  removeSkill(index: number): void {
    this.skillsList.splice(index, 1);
  }

  onSkillKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addSkill();
    }
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'oldPassword') {
      this.showOldPassword = !this.showOldPassword;
    } else if (field === 'newPassword') {
      this.showNewPassword = !this.showNewPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.hasError('passwordMismatch')) {
      if (confirmPassword.errors) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    
    return null;
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    if (this.isEditing) {
      this.cancelEdit();
    }
    if (this.isEditingPassword) {
      this.cancelPasswordEdit();
    }
  }

  async getTeamMemberProfile() {
    try {
      this.isLoading = true;
      const token = this.storage.get(teamMemberCommon.TEAM_MEMBER_TOKEN);
      if (!token) {
        swalHelper.showToast('Authentication token not found', 'error');
        return;
      }

      const result = await this.taskMemberAuthService.getTeamMemberProfile(token);
      if (result) {
        this.memberData = result;
        this.populateForm(result);
        
        // Check profile completeness after loading data
        setTimeout(() => {
          this.checkProfileCompleteness();
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      swalHelper.showToast('Failed to load profile data', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  populateForm(data: any) {
    this.profileForm.patchValue({
      name: data.name || '',
      mobile: data.mobile || '',
      emailId: data.emailId || '',
      role: data.role || '',
      experience: data.experience || ''
    });

    // Populate skills list
    this.skillsList = Array.isArray(data.skills) ? [...data.skills] : 
                     (data.skills ? data.skills.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill.length > 0) : []);
  }

  enableEdit() {
    this.isEditing = true;
    // Enable only editable fields (not email and role)
    this.profileForm.get('name')?.enable();
    this.profileForm.get('mobile')?.enable();
    this.profileForm.get('experience')?.enable();
    
    // Email and role always remain disabled
    this.profileForm.get('emailId')?.disable();
    this.profileForm.get('role')?.disable();
  }

  cancelEdit() {
    this.isEditing = false;
    // Disable all editable fields
    this.profileForm.get('name')?.disable();
    this.profileForm.get('mobile')?.disable();
    this.profileForm.get('experience')?.disable();
    
    // Reset form to original values
    this.populateForm(this.memberData);
    
    // Clear image selection
    this.selectedFile = null;
    this.imagePreview = null;
    
    // Reset current skill input
    this.currentSkill = '';
  }

  // Password form methods
  enablePasswordEdit() {
    this.isEditingPassword = true;
    this.passwordForm.get('oldPassword')?.enable();
    this.passwordForm.get('newPassword')?.enable();
    this.passwordForm.get('confirmPassword')?.enable();
    this.passwordForm.reset();
  }

  cancelPasswordEdit() {
    this.isEditingPassword = false;
    this.passwordForm.get('oldPassword')?.disable();
    this.passwordForm.get('newPassword')?.disable();
    this.passwordForm.get('confirmPassword')?.disable();
    this.passwordForm.reset();
  }

  async changePassword() {
    if (this.passwordForm.invalid) {
      this.markPasswordFormGroupTouched();
      return;
    }

    try {
      this.isChangingPassword = true;
      const formValue = this.passwordForm.getRawValue();
      
      const passwordData = {
        oldPassword: formValue.oldPassword,
        newPassword: formValue.newPassword
      };

      const result = await this.taskMemberAuthService.ChangeMemberPassword(passwordData);
      if (result) {
        swalHelper.showToast('Password changed successfully!', 'success');
        this.handlePasswordChangeSuccess();
      }
    } catch (error) {
      console.error('Error changing password:', error);
      swalHelper.showToast('Failed to change password', 'error');
    } finally {
      this.isChangingPassword = false;
    }
  }

  private handlePasswordChangeSuccess() {
    this.isEditingPassword = false;
    this.passwordForm.reset();
    
    // Disable all password fields
    this.passwordForm.get('oldPassword')?.disable();
    this.passwordForm.get('newPassword')?.disable();
    this.passwordForm.get('confirmPassword')?.disable();
  }

  private markPasswordFormGroupTouched() {
    Object.keys(this.passwordForm.controls).forEach(key => {
      const control = this.passwordForm.get(key);
      control?.markAsTouched();
    });
  }

  getPasswordFieldError(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    if (field?.hasError('minlength')) {
      return `${this.getFieldDisplayName(fieldName)} must be at least 6 characters`;
    }
    if (field?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'oldPassword': 'Current Password',
      'newPassword': 'New Password',
      'confirmPassword': 'Confirm Password'
    };
    return displayNames[fieldName] || fieldName;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        swalHelper.showToast('Please select a valid image file (JPG, PNG, GIF)', 'error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        swalHelper.showToast('Image size should be less than 5MB', 'error');
        return;
      }

      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async updateProfile() {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    try {
      this.isSaving = true;
      const formData = this.profileForm.getRawValue();
      
      const updateData = {
        name: formData.name,
        mobile: formData.mobile,
        skills: this.skillsList,
        experience: formData.experience
      };

      // If image is selected, create FormData for file upload
      if (this.selectedFile) {
        const formDataWithImage = new FormData();
        formDataWithImage.append('file', this.selectedFile);
        formDataWithImage.append('name', updateData.name);
        formDataWithImage.append('mobile', updateData.mobile);
        this.skillsList.forEach((skill: string) => {
          formDataWithImage.append('skills[]', skill);
        });        
        formDataWithImage.append('experience', updateData.experience);
        
        const result = await this.taskMemberAuthService.UpdateTeamMember(formDataWithImage);
        if (result) {
          swalHelper.showToast('Profile updated successfully!', 'success');
          this.handleUpdateSuccess();
        }
      } else {
        const result = await this.taskMemberAuthService.UpdateTeamMember(updateData);
        if (result) {
          swalHelper.showToast('Profile updated successfully!', 'success');
          this.handleUpdateSuccess();
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      swalHelper.showToast('Failed to update profile', 'error');
    } finally {
      this.isSaving = false;
    }
  }

  private handleUpdateSuccess() {
    this.isEditing = false;
    this.selectedFile = null;
    this.imagePreview = null;
    this.currentSkill = '';
    this.getTeamMemberProfile(); // Refresh data
    
    // Disable all editable fields
    this.profileForm.get('name')?.disable();
    this.profileForm.get('mobile')?.disable();
    this.profileForm.get('experience')?.disable();
  }

  private markFormGroupTouched() {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('minlength')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least 2 characters`;
    }
    if (field?.hasError('pattern')) {
      return 'Please enter a valid 10-digit mobile number';
    }
    return '';
  }

  getProfileImageUrl(): string {
    if (this.imagePreview) {
      return this.imagePreview; // Show preview during editing
    }
    if (this.memberData?.profileImage) {
      return `${environment.imageURL}${this.memberData.profileImage}`;
    }
    return 'assets/images/avatar.png'; 
  }

  getInitials(): string {
    if (this.memberData?.name) {
      return this.memberData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'M';
  }

  triggerFileInput() {
    const fileInput = document.getElementById('profileImageInput') as HTMLInputElement;
    fileInput?.click();
  }
}