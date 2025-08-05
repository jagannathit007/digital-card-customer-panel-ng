import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AppWorker } from '../../../core/workers/app.worker';
import { CommonModule } from '@angular/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AuthService } from 'src/app/services/auth.service';
import { common } from 'src/app/core/constants/common';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';
import { SharedService } from 'src/app/services/shared.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
import { TaskMemberAuthService } from 'src/app/services/task-member-auth.service';
import { ConfigService } from 'src/app/services/config.service';
import { HttpClient } from '@angular/common/http';
import { BusinessCardService } from 'src/app/services/business-card.service';

declare var bootstrap: any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe, AvatarComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  private deferredPrompt: any;
  private installModal: any;
  showInstallButton: boolean = false;
  userName: string = '';
  showDefaultIcon: boolean = false;
  private playStoreModal: any;
  playStoreAppUrl: string = 'https://play.google.com/store/apps/details?id=com.itfuturz.digitalcard&pcampaignid=web_share';
  private cameraModal: any;
  private stream: MediaStream | null = null;
  capturedImage: string | null = null;
  currentStep: number = 1;
  frontImage: string | null = null;
  backImage: string | null = null;
  businessCardDetails: any = {
    name: '',
    mobile: '',
    companyEmailId: '',
    companyName: '',
    businessMobile: '',
    address: '',
    keywords: '',
    notes: '',
    businessCardId: ''
  };
  isExtractingData: boolean = false;
  isSavingCard: boolean = false;
  formErrors: any = {};
  isFormValid: boolean = true;

  constructor(
    public appWorker: AppWorker,
    private storage: AppStorage,
    public authService: AuthService,
    private taskMemberAuthService: TaskMemberAuthService,
    public modal: ModalService,
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService,
    private config: ConfigService,
    private businessCardService: BusinessCardService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.onInitFunction();
    this.sharedService.refreshHeader$.subscribe(() => {
      this.onInitFunction();
    });
  }

  async onInitFunction() {
    await this.getProfile();
    this.authService.selectedBusinessCard =
      this.storage.get(common.BUSINESS_CARD) ?? '';

    let userData = this.storage.get(common.USER_DATA);

    const matchedCard = userData.businessCards.find(
      (e: any) => e._id === this.authService.selectedBusinessCard
    );
    this.userName = matchedCard?.userName;

    this.selectedTab = {
      title: 'Personal Details',
      href: 'personal-details',
    };
    this.getCards();
    this.checkPwaInstallation();
  }

  openPlayStoreModal() {
    setTimeout(() => {
      this.playStoreModal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById('playStoreModal')
      );
      this.playStoreModal.show();
    }, 100);
  }

  downloadFromPlayStore() {
    window.open(this.playStoreAppUrl, '_blank');
    this.playStoreModal?.hide();
  }

  copyPlayStoreLink() {
    navigator.clipboard.writeText(this.playStoreAppUrl)
      .then(() => {
        swalHelper.showToast('Play Store Link Copied!', 'success');
      })
      .catch((err) => {
        console.error('Failed to copy Play Store link: ', err);
        swalHelper.error('Failed to copy link!');
      });
  }

  copyToClipboard() {
    const fullUrl = `${this.config.backendURL}/${this.userName}`;
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        swalHelper.showToast('Profile Link Copied!', 'success');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        swalHelper.error('Error!');
      });
  }

  businessDetails: any = null;
  imageUrl = environment.imageURL;
  getCards = async () => {
    let results = await this.authService.getBusinessCards();
    const selectedBusinessId = this.authService.selectedBusinessCard;
    const selectedBusinessDetails = results.filter(
      (business: any) => business._id === selectedBusinessId
    );
    this.message = selectedBusinessDetails[0]?.message?.whatsApp
      ? selectedBusinessDetails[0].message.whatsApp
      : 'hi';
    this.businessDetails = selectedBusinessDetails[0];
    this.cdr.detectChanges();
  };

  selectedCountryCode: string = '91';
  mobileNumber: string = '';
  message: string = ``;

  shareOnWhatsApp() {
    if (!this.mobileNumber) {
      alert('Please enter a WhatsApp number!');
      return;
    }

    const formattedNumber =
      this.selectedCountryCode + this.mobileNumber.replace(/^0+/, '');

    let whatsappURL = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(
      this.message
    )}`;
    window.open(whatsappURL, '_blank');
  }

  selectedTab = {
    title: 'Personal Details',
    href: 'personal-details',
  };

  checkPwaInstallation() {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone;
    const alreadyDenied = localStorage.getItem('pwaDenied') === 'true';

    if (this.isAndroid()) {
      window.addEventListener('beforeinstallprompt', (event: any) => {
        event.preventDefault();
        this.showInstallButton = true;
        this.deferredPrompt = event;

        if (!alreadyDenied) {
          setTimeout(() => {
            this.installModal = bootstrap.Modal.getOrCreateInstance(
              document.getElementById('installPwaModal')
            );
            this.installModal.show();
          }, 1000);
        }
      });
    }

    if (this.isIos() && !isStandalone) {
      this.showInstallButton = true;
      if (!alreadyDenied) {
        setTimeout(() => {
          this.installModal = bootstrap.Modal.getOrCreateInstance(
            document.getElementById('installGuideModal')
          );
          this.installModal.show();
        }, 1000);
      }
    }
  }

  isIos(): boolean {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone/.test(userAgent);
  }

  isAndroid(): boolean {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /android/.test(userAgent);
  }

  openInstallModal() {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone;

    if (this.isIos() && !isStandalone) {
      setTimeout(() => {
        this.installModal = bootstrap.Modal.getOrCreateInstance(
          document.getElementById('installGuideModal')
        );
        this.installModal.show();
      }, 1000);
    } else {
      setTimeout(() => {
        this.installModal = bootstrap.Modal.getOrCreateInstance(
          document.getElementById('installPwaModal')
        );
        this.installModal.show();
      }, 1000);
    }
  }

  installPwa() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          this.showInstallButton = false;
          this.installModal.hide();
        }
        this.deferredPrompt = null;
      });
    }
  }

  denyInstall() {
    localStorage.setItem('pwaDenied', 'true');
  }

  getProfile = async () => {
    let result = await this.authService.getProfile({});

    const data = result?.profile;
    const memberData = result?.memberProfile;
    if (result != null) {
      data.businessCards = data.businessCards.map((v: any, i: any) => {
        v.company = v.company || `Card ${i + 1}`;
        return v;
      });
      let card = this.storage.get(common.BUSINESS_CARD);
      if (card == null) {
        this.authService.selectedBusinessCard = data.businessCards[0]._id;
        this.storage.set(common.BUSINESS_CARD, data.businessCards[0]._id);
        window.location.reload();
      }
      this.authService.profileData = data;
      let businessCardsSubject = new BehaviorSubject<any[]>(data.businessCards);
      this.authService.businessCards$ = businessCardsSubject.asObservable();
      this.storage.set(common.USER_DATA, data);

      if (data.taskAccountAdminId && memberData) {
        this.storage.set(teamMemberCommon.TEAM_MEMBER_DATA, memberData);
        this.taskMemberAuthService.memberDetails = memberData;
      }
    }
  };

  logout = async () => {
    let confirm = await swalHelper.confirmation(
      'Logout',
      'Do you really want to logout',
      'question'
    );
    if (confirm.isConfirmed) {
      const acknowledged = this.storage.get('app_update_acknowledged');
      const apps = this.storage.get("apps");
      this.storage.clearAll();
      this.storage.set('apps', apps);
      if (acknowledged) {
        this.storage.set('app_update_acknowledged', acknowledged);
      }
      window.location.href = '/';
    }
  };

  handleImageError(event: Event) {
    this.showDefaultIcon = true;
    this.cdr.detectChanges();
  }

  onBusinessChange() {
    this.storage.set(
      common.BUSINESS_CARD,
      this.authService.selectedBusinessCard
    );
    window.location.reload();
  }

  async openCameraModal() {
    this.currentStep = 1;
    this.frontImage = null;
    this.backImage = null;
    this.isExtractingData = false;
    this.isSavingCard = false;
    this.formErrors = {};
    this.isFormValid = true;
    this.businessCardDetails = {
      name: '',
      mobile: '',
      companyEmailId: '',
      companyName: '',
      businessMobile: '',
      address: '',
      keywords: '',
      notes: '',
      businessCardId: this.authService.selectedBusinessCard
    };

    setTimeout(() => {
      this.cameraModal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById('cameraModal')
      );
      this.cameraModal.show();
      this.startCamera();
    }, 100);
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      const video = document.getElementById('cameraStream') as HTMLVideoElement;
      video.srcObject = this.stream;
      video.play();
      this.capturedImage = null;
      const capturedImage = document.getElementById('capturedImage') as HTMLImageElement;
      capturedImage.style.display = 'none';
      video.style.display = 'block';
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error accessing camera:', err);
      swalHelper.error('Unable to access camera. Please check permissions.');
      this.cameraModal?.hide();
    }
  }

  capturePhoto() {
    const video = document.getElementById('cameraStream') as HTMLVideoElement;
    const canvas = document.getElementById('cameraCanvas') as HTMLCanvasElement;
    const capturedImage = document.getElementById('capturedImage') as HTMLImageElement;

    // Resize image to reduce size
    const maxWidth = 800; // Adjust as needed
    const maxHeight = 600; // Adjust as needed
    let width = video.videoWidth;
    let height = video.videoHeight;

    // Maintain aspect ratio
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = width * ratio;
      height = height * ratio;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      // Compress image (quality: 0.7)
      this.capturedImage = canvas.toDataURL('image/jpeg', 0.7);
      capturedImage.src = this.capturedImage;
      capturedImage.style.display = 'block';
      video.style.display = 'none';
      this.cdr.detectChanges();
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    const video = document.getElementById('cameraStream') as HTMLVideoElement;
    video.srcObject = null;
    this.capturedImage = null;
    const capturedImage = document.getElementById('capturedImage') as HTMLImageElement;
    capturedImage.style.display = 'none';
    video.style.display = 'block';
    this.currentStep = 1;
    this.isExtractingData = false;
    this.isSavingCard = false;
    this.formErrors = {};
    this.isFormValid = true;
    this.cdr.detectChanges();
  }

  async extractTextFromImage(imageData: string, side: string): Promise<any> {
    try {
      this.isExtractingData = true;
      this.cdr.detectChanges();
      
      const response = await this.businessCardService.extractTextFromImage({
        imageData,
        side
      });

      if (response) {
        return response;
      }
      return null;
    } catch (err) {
      console.error('Error extracting text from image:', err);
      // swalHelper.error('Failed to extract text from image.');
      return null;
    } finally {
      this.isExtractingData = false;
      this.cdr.detectChanges();
    }
  }

  async nextStep() {
    if (this.currentStep === 1 && this.capturedImage) {
      this.frontImage = this.capturedImage;
      const frontData = await this.extractTextFromImage(this.frontImage, 'front');
      if (frontData) {
        this.businessCardDetails = {
          ...this.businessCardDetails,
          name: frontData.name || this.businessCardDetails.name,
          mobile: frontData.mobile || this.businessCardDetails.mobile,
          companyEmailId: frontData.companyEmailId || this.businessCardDetails.companyEmailId,
          companyName: frontData.companyName || this.businessCardDetails.companyName,
          businessMobile: frontData.businessMobile || this.businessCardDetails.businessMobile,
          address: frontData.address || this.businessCardDetails.address,
          keywords: frontData.keywords || this.businessCardDetails.keywords,
          notes: frontData.notes || this.businessCardDetails.notes
        };
      }
      
      this.stopCamera();
      this.currentStep = 2;
      this.startCamera();
    } else if (this.currentStep === 2 && this.capturedImage) {
      this.backImage = this.capturedImage;
      const backData = await this.extractTextFromImage(this.backImage, 'back');
      if (backData) {
        this.businessCardDetails = {
          ...this.businessCardDetails,
          name: this.businessCardDetails.name || backData.name,
          mobile: this.businessCardDetails.mobile || backData.mobile,
          companyEmailId: this.businessCardDetails.companyEmailId || backData.companyEmailId,
          companyName: this.businessCardDetails.companyName || backData.companyName,
          businessMobile: this.businessCardDetails.businessMobile || backData.businessMobile,
          address: this.businessCardDetails.address || backData.address,
          keywords: this.businessCardDetails.keywords || backData.keywords,
          notes: this.businessCardDetails.notes || backData.notes
        };
      }
      
      this.stopCamera();
      this.currentStep = 3;
    }
    this.cdr.detectChanges();
  }

  validateForm(): boolean {
    this.formErrors = {};
    this.isFormValid = true;

    if (!this.businessCardDetails.name || !this.businessCardDetails.name.trim()) {
      this.formErrors.name = 'Name is required';
      this.isFormValid = false;
    }

    if (!this.businessCardDetails.mobile || !this.businessCardDetails.mobile.trim()) {
      this.formErrors.mobile = 'Mobile number is required';
      this.isFormValid = false;
    }

    if (this.businessCardDetails.companyEmailId && this.businessCardDetails.companyEmailId.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.businessCardDetails.companyEmailId.trim())) {
        this.formErrors.companyEmailId = 'Please enter a valid email address';
        this.isFormValid = false;
      }
    }

    if (!this.businessCardDetails.businessCardId || !this.businessCardDetails.businessCardId.trim()) {
      this.formErrors.businessCardId = 'Business Card ID is required';
      this.isFormValid = false;
    } else {
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(this.businessCardDetails.businessCardId)) {
        this.formErrors.businessCardId = 'Invalid Business Card ID format';
        this.isFormValid = false;
      }
    }

    return this.isFormValid;
  }

  clearFieldError(fieldName: string): void {
    if (this.formErrors[fieldName]) {
      delete this.formErrors[fieldName];
    }
  }

  async submitBusinessCard() {
    if (!this.frontImage || !this.backImage) {
      // swalHelper.error('Please capture both front and back images.');
      return;
    }

    if (!this.validateForm()) {
      // swalHelper.error('Please fix the form errors before submitting.');
      return;
    }

    try {
      this.isSavingCard = true;
      this.cdr.detectChanges();
      
      const formData = new FormData();
      const frontBlob = await fetch(this.frontImage).then(res => res.blob());
      formData.append('frontImage', frontBlob, 'front.jpg'); // Changed to .jpg
      const backBlob = await fetch(this.backImage).then(res => res.blob());
      formData.append('backImage', backBlob, 'back.jpg'); // Changed to .jpg

      Object.keys(this.businessCardDetails).forEach(key => {
        formData.append(key, this.businessCardDetails[key]);
      });

      const response = await this.businessCardService.saveScannedCard(formData);
      if (response) {
        this.cameraModal?.hide();
        this.stopCamera();
        swalHelper.showToast('Business card saved successfully!', 'success');
      }
    } catch (err) {
      console.error('Error saving business card:', err);
      // swalHelper.error('Failed to save business card.');
    } finally {
      this.isSavingCard = false;
      this.cdr.detectChanges();
    }
  }
}
