// import { Component, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { common } from 'src/app/core/constants/common';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { AuthService } from 'src/app/services/auth.service';
// import { swalHelper } from 'src/app/core/constants/swal-helper';
// import { WebsiteBuilderService } from 'src/app/services/website-builder.service';
// import { ModalService } from 'src/app/core/utilities/modal';

// @Component({
//   selector: 'app-about-section',
//   templateUrl: './about-section.component.html',
//   styleUrl: './about-section.component.scss',
// })
// export class AboutSectionComponent implements OnInit {

//   isLoading: boolean = false;
//   aboutCompanyList: any

//   constructor(
//     private storage: AppStorage,
//     public authService: AuthService,
//     private websiteService: WebsiteBuilderService,
//     public modal: ModalService
//   ) { }

//   businessCardId: any
//   ngOnInit() {
//     this.businessCardId = this.storage.get(common.BUSINESS_CARD)
//     this.fetchWebsiteDetails();
//   }

//   async fetchWebsiteDetails() {
//     this.isLoading = true;
//     try {
//       let businessCardId = this.storage.get(common.BUSINESS_CARD);
//       let results = await this.authService.getWebsiteDetails(businessCardId);

//       if (results && results.aboutCompany) {
//         this.aboutCompanyList = results.aboutCompany
//         this.aboutCompanyVisible = results.aboutCompanyVisible
//       }
//     } catch (error) {
//       console.error('Error fetching company information: ', error);
//       swalHelper.showToast('Error fetching company information!', 'error');
//     } finally {
//       this.isLoading = false;
//     }
//   }

//   aboutCompanyVisible: boolean = false
//   _updateVisibility = async () => {
//     await this.websiteService.updateVisibility({ aboutCompanyVisible: this.aboutCompanyVisible, businessCardId: this.businessCardId })
//   }

//   payload: any = {
//     businessCardId: '',
//     addAboutData: [],
//     _id: null
//   }
//   onOpenaddAboutDetails() {
//     this.payload.addAboutData.push({ title: '', description: '', visible: true })
//     this.payload.businessCardId = this.businessCardId
//     this.modal.open('add-about')
//   }

//   onAddAboutData() {
//     this.payload.addAboutData.push({ title: '', description: '', visible: true })
//   }

//   onDelete(index: number) {
//     this.payload.addAboutData.splice(index, 1);
//   }

//   reset() {
//     this.payload = {
//       businessCardId: this.businessCardId,
//       addAboutData: [],
//       _id: null
//     }
//     this.fetchWebsiteDetails();
//   }

//   _saveAboutData = async () => {
//     await this.websiteService.updateAboutSectionData(this.payload)
//     this.reset()
//     this.modal.close('add-about')
//   }

//   onOpenUpdateModal(data: any) {
//     this.payload.addAboutData.push({ title: data.title, description: data.description, visible: data.visible })
//     this.payload._id = data._id
//     this.payload.businessCardId = this.businessCardId
//     this.modal.open('add-about')
//   }

//   _deleteAboutData = async (id: string) => {
//     const confirm = await swalHelper.delete();
//     if (confirm.isConfirmed) {
//       let response = await this.websiteService.deleteAboutData({ _id: id ,businessCardId:this.businessCardId})
//       if (response) {
//         swalHelper.success('Data Deleted Successfully')
//       }
//       this.reset()
//     }
//   }
// }

import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Editor, Toolbar } from 'ngx-editor';
import { NgxEditorModule } from 'ngx-editor';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { WebsiteBuilderService } from 'src/app/services/website-builder.service';
import { ModalService } from 'src/app/core/utilities/modal';

@Component({
  selector: 'app-about-section',
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss',
})
export class AboutSectionComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  aboutCompanyList: any[] = [];
  filteredAboutCompanyList: any[] = [];
  searchTerm: string = '';
  businessCardId: any;

  // ngx-editor instances
  addEditor!: Editor; // For description in add/edit modal
  addTitleEditor!: Editor; // For title in add/edit modal

  // Editor toolbar configuration
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  constructor(
    private storage: AppStorage,
    public authService: AuthService,
    private websiteService: WebsiteBuilderService,
    public modal: ModalService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.businessCardId = this.storage.get(common.BUSINESS_CARD);
    // Initialize editors
    this.addEditor = new Editor();
    this.addTitleEditor = new Editor();
    this.fetchWebsiteDetails();
  }

  ngOnDestroy(): void {
    // Destroy editors to prevent memory leaks
    this.addEditor.destroy();
    this.addTitleEditor.destroy();
  }

  async fetchWebsiteDetails() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let results = await this.authService.getWebsiteDetails(businessCardId);

      if (results && results.aboutCompany) {
        this.aboutCompanyList = results.aboutCompany;
        this.filteredAboutCompanyList = [...this.aboutCompanyList];
        this.aboutCompanyVisible = results.aboutCompanyVisible;
      } else {
        this.aboutCompanyList = [];
        this.filteredAboutCompanyList = [];
      }
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error fetching company information: ', error);
      swalHelper.showToast('Error fetching company information!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  aboutCompanyVisible: boolean = false;

  _updateVisibility = async () => {
    await this.websiteService.updateVisibility({
      aboutCompanyVisible: this.aboutCompanyVisible,
      businessCardId: this.businessCardId,
    });
  };

  payload: any = {
    businessCardId: '',
    addAboutData: [],
    _id: null,
  };

  onOpenaddAboutDetails() {
    this.payload.addAboutData.push({ title: '', description: '', visible: true });
    this.payload.businessCardId = this.businessCardId;
    this.modal.open('add-about');
  }

  onAddAboutData() {
    this.payload.addAboutData.push({ title: '', description: '', visible: true });
  }

  onDelete(index: number) {
    this.payload.addAboutData.splice(index, 1);
    this.cdr.markForCheck();
  }

  reset() {
    this.payload = {
      businessCardId: this.businessCardId,
      addAboutData: [],
      _id: null,
    };
    this.fetchWebsiteDetails();
  }

  validateAboutData(data: any[]): boolean {
    for (let item of data) {
      const strippedTitle = this.stripHtml(item.title).trim();
      const strippedDescription = this.stripHtml(item.description).trim();
      if (!strippedTitle) {
        swalHelper.showToast('About title is required!', 'warning');
        return false;
      }
      if (!strippedDescription) {
        swalHelper.showToast('About description is required!', 'warning');
        return false;
      }
    }
    return true;
  }

  _saveAboutData = async () => {
    if (!this.validateAboutData(this.payload.addAboutData)) {
      return;
    }
    try {
      this.isLoading = true;
      await this.websiteService.updateAboutSectionData(this.payload);
      this.reset();
      this.modal.close('add-about');
      swalHelper.showToast('Data saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving about data: ', error);
      swalHelper.showToast('Error saving about data!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  };

  onOpenUpdateModal(data: any) {
    this.payload.addAboutData.push({
      title: data.title,
      description: data.description,
      visible: data.visible,
    });
    this.payload._id = data._id;
    this.payload.businessCardId = this.businessCardId;
    this.modal.open('add-about');
  }

  _deleteAboutData = async (id: string) => {
    const confirm = await swalHelper.delete();
    if (confirm.isConfirmed) {
      try {
        this.isLoading = true;
        let response = await this.websiteService.deleteAboutData({
          _id: id,
          businessCardId: this.businessCardId,
        });
        if (response) {
          swalHelper.success('Data Deleted Successfully');
          this.reset();
        }
      } catch (error) {
        console.error('Error deleting about data: ', error);
        swalHelper.showToast('Error deleting about data!', 'error');
      } finally {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    }
  };

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredAboutCompanyList = [...this.aboutCompanyList];
    } else {
      this.filteredAboutCompanyList = this.aboutCompanyList.filter(
        (item) =>
          this.stripHtml(item.title)
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          (item.description &&
            this.stripHtml(item.description)
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase()))
      );
    }
    this.cdr.markForCheck();
  }

 sanitizeHtml(content: any): any {
    if (!content) return '';
    return content.replace(/<[^>]*>/g, '');
  }

  // Helper method to strip HTML tags for validation and search
  stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}
