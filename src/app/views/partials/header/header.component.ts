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
import { ConfigService } from 'src/app/services/config.service';

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


  constructor(
    public appWorker: AppWorker,
    private storage: AppStorage,
    public authService: AuthService,
    public modal: ModalService,
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService,
    private config:ConfigService
  ) {}

  onBusinessChange() {
    this.storage.set(
      common.BUSINESS_CARD,
      this.authService.selectedBusinessCard
    );
    window.location.reload();
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

  async ngOnInit() {
    this.onInitFunction();

    this.sharedService.refreshHeader$.subscribe(() => {
      this.onInitFunction();
    });
  }

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
    let data = await this.authService.getProfile({});
    if (data != null) {
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
    }
  };

  logout = async () => {
    let confirm = await swalHelper.confirmation(
      'Logout',
      'Do you really want to logout',
      'question'
    );
    // if (confirm.isConfirmed) {
    //   this.storage.clearAll();
    //   window.location.href = '/';
    // }
    if (confirm.isConfirmed) {
    // Preserve app_update_acknowledged before clearing
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
}