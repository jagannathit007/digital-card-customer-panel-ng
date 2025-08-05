import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  faqList: any[] = [];
  filteredFaqList: any[] = [];
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

  sectionTitles: any = {
    faq: 'Our Faq'
  };


  constructor(
    private storage: AppStorage,
    public authService: AuthService,
    private websiteService: WebsiteBuilderService,
    public modal: ModalService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) { }

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

      if (results && results.faqs) {
        this.faqList = results.faqs;
        this.filteredFaqList = [...this.faqList];
        this.faqVisible = results.faqVisible;

        if (results.sectionTitles) {
          this.sectionTitles = results.sectionTitles;
        }

      } else {
        this.faqList = [];
        this.filteredFaqList = [];
      }
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error fetching FAQ information: ', error);
      swalHelper.showToast('Error fetching FAQ information!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  faqVisible: boolean = true;

  _updateVisibility = async () => {
    await this.websiteService.updateVisibility({
      faqVisible: this.faqVisible,
      businessCardId: this.businessCardId,
    });
  };

  payload: any = {
    businessCardId: '',
    addFaqData: [],
    _id: null,
  };

  onOpenAddFaqDetails() {
    this.payload.addFaqData.push({ faqTitle: '', faqDescription: '', visible: true });
    this.payload.businessCardId = this.businessCardId;
    this.modal.open('add-faq');
  }

  onAddFaqData() {
    this.payload.addFaqData.push({ faqTitle: '', faqDescription: '', visible: true });
  }

  onDelete(index: number) {
    this.payload.addFaqData.splice(index, 1);
    this.cdr.markForCheck();
  }

  reset() {
    this.payload = {
      businessCardId: this.businessCardId,
      addFaqData: [],
      _id: null,
    };
    this.fetchWebsiteDetails();
  }

  validateFaqData(data: any[]): boolean {
    for (let item of data) {
      const strippedTitle = this.stripHtml(item.faqTitle).trim();
      const strippedDescription = this.stripHtml(item.faqDescription).trim();
      if (!strippedTitle) {
        swalHelper.showToast('FAQ title is required!', 'warning');
        return false;
      }
      if (!strippedDescription) {
        swalHelper.showToast('FAQ description is required!', 'warning');
        return false;
      }
    }
    return true;
  }

  _saveFaqData = async () => {
    if (!this.validateFaqData(this.payload.addFaqData)) {
      return;
    }
    try {
      this.isLoading = true;
      await this.websiteService.updateFaq(this.payload);
      this.reset();
      this.modal.close('add-faq');
      swalHelper.showToast('FAQ saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving FAQ data: ', error);
      swalHelper.showToast('Error saving FAQ data!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  };

  onOpenUpdateModal(data: any) {
    this.payload.addFaqData.push({
      faqTitle: data.faqTitle,
      faqDescription: data.faqDescription,
      visible: data.visible,
    });
    this.payload._id = data._id;
    this.payload.businessCardId = this.businessCardId;
    this.modal.open('add-faq');
  }

  _deleteFaqData = async (id: string) => {
    const confirm = await swalHelper.delete();
    if (confirm.isConfirmed) {
      try {
        this.isLoading = true;
        let response = await this.websiteService.deleteFaq({
          _id: id,
          businessCardId: this.businessCardId,
        });
        if (response) {
          swalHelper.success('FAQ Deleted Successfully');
          this.reset();
        }
      } catch (error) {
        console.error('Error deleting FAQ data: ', error);
        swalHelper.showToast('Error deleting FAQ data!', 'error');
      } finally {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    }
  };

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredFaqList = [...this.faqList];
    } else {
      this.filteredFaqList = this.faqList.filter(
        (item) =>
          this.stripHtml(item.faqTitle)
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          (item.faqDescription &&
            this.stripHtml(item.faqDescription)
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

  stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  // Add this method to handle title edit
  editSectionTitle() {
    this.modal.open('EditTitleModal');
  }

  // Add this method to update section title
  async updateSectionTitle() {
    if (!this.sectionTitles.faq.trim()) {
      swalHelper.showToast('Section title is required!', 'warning');
      return;
    }

    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      const data = {
        businessCardId: businessCardId,
        sectionTitles: {
          faq: this.sectionTitles.faq
        }
      };

      const result = await this.websiteService.updateSectionsTitles(data);
      if (result) {
        this.modal.close('EditTitleModal');
        swalHelper.showToast('Section title updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating section title: ', error);
      swalHelper.showToast('Error updating section title!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

}