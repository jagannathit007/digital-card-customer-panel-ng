// import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
// import { Editor, Toolbar } from 'ngx-editor';
// import { DomSanitizer } from '@angular/platform-browser';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { AuthService } from 'src/app/services/auth.service';
// import { swalHelper } from 'src/app/core/constants/swal-helper';
// import { environment } from 'src/env/env.local';
// import { ModalService } from 'src/app/core/utilities/modal';
// import { WebsiteBuilderService } from 'src/app/services/website-builder.service';
// import { common } from 'src/app/core/constants/common';

// @Component({
//   selector: 'app-our-trust',
//   templateUrl: './our-trust.component.html',
//   styleUrl: './our-trust.component.scss'
// })
// export class OurTrustComponent implements OnInit {
//     constructor(
//     private storage: AppStorage,
//     public authService: AuthService,
//     private cdr: ChangeDetectorRef,
//     public modal: ModalService,
//     private websiteService: WebsiteBuilderService,
//     private sanitizer: DomSanitizer,
//   ) {}
//   async ngOnInit() {
//   }
// }


import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';
import { WebsiteBuilderService } from 'src/app/services/website-builder.service';
import { common } from 'src/app/core/constants/common';

@Component({
  selector: 'app-our-trust',
  templateUrl: './our-trust.component.html',
  styleUrl: './our-trust.component.scss'
})
export class OurTrustComponent implements OnInit {
  imageURL = environment.imageURL;
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;

  trustLinks: any[] = [];
  filteredTrustLinks: any[] = [];
  linkId: string = '';
  selectedImage: string = '';

  newTrustLink: any = {
    link: '',
    image: null as File | null,
    visible: true
  };

  editingTrustLink = {
    _id: '',
    link: '',
    image: null as File | null,
    currentImage: '',
    visible: true
  };

  ourlinksVisible: boolean = true;
  businessCardId: any;

  constructor(
    private storage: AppStorage,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    public modal: ModalService,
    private websiteService: WebsiteBuilderService,
    private sanitizer: DomSanitizer,
  ) {}

  async ngOnInit() {
    this.businessCardId = this.storage.get(common.BUSINESS_CARD);
    await this.fetchTrustLinks();
  }

  async fetchTrustLinks() {
    this.isLoading = true;
    try {
      let results = await this.authService.getWebsiteDetails(this.businessCardId);
      if (results) {
        this.trustLinks = results.links ? [...results.links] : [];
        this.filteredTrustLinks = [...this.trustLinks];
        this.totalItems = this.trustLinks.length;
        this.ourlinksVisible = results.ourlinksVisible;
        this.cdr.markForCheck();
      } else {
        swalHelper.showToast('Failed to fetch trust links!', 'warning');
      }
    } catch (error) {
      swalHelper.showToast('Error fetching trust links!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  async addTrustLink() {
    if (!this.validateTrustLink(this.newTrustLink)) return;

    this.isLoading = true;
    try {
      const formData = new FormData();
      formData.append('businessCardId', this.businessCardId);
      formData.append('link', this.newTrustLink.link);
      if (this.newTrustLink.image) {
        formData.append('file', this.newTrustLink.image);
      }
      formData.append('visible', this.newTrustLink.visible.toString());

      const result = await this.authService.addTrust(formData);
      if (result) {
        await this.fetchTrustLinks();
        this.resetForm();
        this.modal.close('AddTrustModal');
        swalHelper.showToast('Trust link added successfully!', 'success');
      }
    } catch (error) {
      swalHelper.showToast('Error adding trust link!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.newTrustLink.image = event.target.files[0];
    }
  }

  onEditFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.editingTrustLink.image = event.target.files[0];
    }
  }

  editTrustLink(trust: any) {
    this.editingTrustLink = {
      _id: trust._id,
      link: trust.link,
      image: null,
      currentImage: trust.image || '',
      visible: trust.visible
    };
    this.modal.open('EditTrustModal');
    this.cdr.markForCheck();
  }

  async updateTrustLink() {
    if (!this.validateTrustLink(this.editingTrustLink)) return;

    this.isLoading = true;
    try {
      const formData = new FormData();
      formData.append('businessCardId', this.businessCardId);
      formData.append('linkId', this.editingTrustLink._id);
      formData.append('link', this.editingTrustLink.link);
      if (this.editingTrustLink.image) {
        formData.append('file', this.editingTrustLink.image);
      }
      formData.append('visible', this.editingTrustLink.visible.toString());

      const result = await this.authService.updateTrust(formData);
      if (result) {
        await this.fetchTrustLinks();
        this.modal.close('EditTrustModal');
        swalHelper.showToast('Trust link updated successfully!', 'success');
      }
    } catch (error) {
      swalHelper.showToast('Error updating trust link!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  prepareDeleteTrustLink = async (trustLinkID: string) => {
    this.linkId = trustLinkID;
    const confirm = await swalHelper.delete();
    if (confirm.isConfirmed) {
      this.confirmDeleteTrustLink();
    }
    this.cdr.markForCheck();
  }

  async confirmDeleteTrustLink() {
    this.isLoading = true;
    try {
      const data = {
        businessCardId: this.businessCardId,
        linkId: this.linkId
      };
      const result = await this.authService.deleteTrust(data);
      if (result) {
        await this.fetchTrustLinks();
        swalHelper.success('Trust link deleted successfully!');
      }
    } catch (error) {
      swalHelper.showToast('Error deleting trust link!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  validateTrustLink(trust: any): boolean {
    if (!trust.link.trim()) {
      swalHelper.showToast('Trust link is required!', 'warning');
      return false;
    }
    return true;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredTrustLinks = [...this.trustLinks];
    } else {
      this.filteredTrustLinks = this.trustLinks.filter(trust =>
        trust.link.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.totalItems = this.filteredTrustLinks.length;
    this.cdr.markForCheck();
  }

  onItemsPerPageChange() {
    this.p = 1;
    this.cdr.markForCheck();
  }

  pageChangeEvent(event: number) {
    this.p = event;
    this.cdr.markForCheck();
  }

  resetForm() {
    this.newTrustLink = { link: '', image: null, visible: true };
    this.cdr.markForCheck();
  }

  onCloseModal(modal: string) {
    this.modal.close(modal);
  }

  _updateVisibility = async () => {
    await this.websiteService.updateVisibility({
      ourlinksVisible: this.ourlinksVisible,
      businessCardId: this.businessCardId
    });
  }
}