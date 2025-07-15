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
import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-about-section',
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss',
})
export class AboutSectionComponent implements OnInit, OnDestroy {
  imageURL = environment.imageURL;
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;

  aboutCompanyList: any[] = [];
  filteredAboutCompanyList: any[] = [];
  aboutItemId: string = '';
  selectedImage: string = '';
  businessCardId: any;

  // ngx-editor instances
  addEditor!: Editor;
  editEditor!: Editor;
  addTitleEditor!: Editor;
  editTitleEditor!: Editor;
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

  newAboutItem: any = {
    title: '',
    description: '',
    image: null as File | null,
    visible: true
  };

  editingAboutItem = {
    _id: '',
    title: '',
    description: '',
    image: null as File | null,
    currentImage: '',
    visible: true
  };

  aboutCompanyVisible: boolean = true;

  sectionTitles: any = {
    aboutCompany: 'About Us'
  };

  constructor(
    private storage: AppStorage,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    public modal: ModalService,
    private websiteService: WebsiteBuilderService,
    private sanitizer: DomSanitizer,
  ) { }

  async ngOnInit() {
    this.addEditor = new Editor();
    this.editEditor = new Editor();
    this.addTitleEditor = new Editor();
    this.editTitleEditor = new Editor();

    this.businessCardId = this.storage.get(common.BUSINESS_CARD);
    await this.fetchAboutItems();
  }

  ngOnDestroy(): void {
    this.addEditor.destroy();
    this.editEditor.destroy();
    this.addTitleEditor.destroy();
    this.editTitleEditor.destroy();
  }

  async fetchAboutItems() {
    this.isLoading = true;
    try {
      let results = await this.authService.getWebsiteDetails(this.businessCardId);
      if (results) {
        this.aboutCompanyList = results.aboutCompany ? [...results.aboutCompany] : [];
        this.filteredAboutCompanyList = [...this.aboutCompanyList];
        this.totalItems = this.aboutCompanyList.length;
        this.aboutCompanyVisible = results.aboutCompanyVisible;
        if (results.sectionTitles) {
          this.sectionTitles = results.sectionTitles;
        }
        this.cdr.markForCheck();
      } else {
        swalHelper.showToast('Failed to fetch about items!', 'warning');
      }
    } catch (error) {
      swalHelper.showToast('Error fetching about items!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  async addAboutItem() {
    if (!this.validateAboutItem(this.newAboutItem)) return;

    this.isLoading = true;
    try {
      const formData = new FormData();
      formData.append('businessCardId', this.businessCardId);
      formData.append('title', this.newAboutItem.title);
      formData.append('description', this.newAboutItem.description || '');
      if (this.newAboutItem.image) {
        formData.append('file', this.newAboutItem.image);
      }
      formData.append('visible', this.newAboutItem.visible.toString());

      const result = await this.websiteService.addAboutSection(formData);
      if (result) {
        await this.fetchAboutItems();
        this.resetForm();
        this.modal.close('AddAboutModal');
        swalHelper.showToast('About item added successfully!', 'success');
      }
    } catch (error) {
      swalHelper.showToast('Error adding about item!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.newAboutItem.image = event.target.files[0];
    }
  }

  onEditFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.editingAboutItem.image = event.target.files[0];
    }
  }

  editAboutItem(item: any) {
    this.editingAboutItem = {
      _id: item._id,
      title: item.title,
      description: item.description || '',
      image: null,
      currentImage: item.image || '',
      visible: item.visible
    };
    this.modal.open('EditAboutModal');
    this.cdr.markForCheck();
  }

  async updateAboutItem() {
    if (!this.validateAboutItem(this.editingAboutItem)) return;

    this.isLoading = true;
    try {
      const formData = new FormData();
      formData.append('businessCardId', this.businessCardId);
      formData.append('aboutId', this.editingAboutItem._id);
      formData.append('title', this.editingAboutItem.title);
      formData.append('description', this.editingAboutItem.description || '');
      if (this.editingAboutItem.image) {
        formData.append('file', this.editingAboutItem.image);
      }
      formData.append('visible', this.editingAboutItem.visible.toString());

      const result = await this.websiteService.updateAboutSectionData(formData);
      if (result) {
        await this.fetchAboutItems();
        this.modal.close('EditAboutModal');
        swalHelper.showToast('About item updated successfully!', 'success');
      }
    } catch (error) {
      swalHelper.showToast('Error updating about item!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  prepareDeleteAboutItem = async (aboutId: string) => {
    this.aboutItemId = aboutId;
    const confirm = await swalHelper.delete();
    if (confirm.isConfirmed) {
      this.confirmDeleteAboutItem();
    }
    this.cdr.markForCheck();
  }

  async confirmDeleteAboutItem() {
    this.isLoading = true;
    try {
      const data = {
        businessCardId: this.businessCardId,
        aboutId: this.aboutItemId
      };
      const result = await this.websiteService.deleteAboutData(data);
      if (result) {
        await this.fetchAboutItems();
        swalHelper.success('About item deleted successfully!');
      }
    } catch (error) {
      swalHelper.showToast('Error deleting about item!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  validateAboutItem(item: any): boolean {
    if (!item.title.trim()) {
      swalHelper.showToast('About title is required!', 'warning');
      return false;
    }
    return true;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredAboutCompanyList = [...this.aboutCompanyList];
    } else {
      this.filteredAboutCompanyList = this.aboutCompanyList.filter(item =>
        item.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
    this.totalItems = this.filteredAboutCompanyList.length;
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
    this.newAboutItem = { title: '', description: '', image: null, visible: true };
    this.cdr.markForCheck();
  }

  onCloseModal(modal: string) {
    this.modal.close(modal);
  }

  _updateVisibility = async () => {
    await this.websiteService.updateVisibility({
      aboutCompanyVisible: this.aboutCompanyVisible,
      businessCardId: this.businessCardId
    });
  }

  sanitizeHtml(content: any): any {
    if (!content) return '';
    return content.replace(/<[^>]*>/g, '');
  }

  // Add this method to handle title edit
  editSectionTitle() {
    this.modal.open('EditTitleModal');
  }

  // Add this method to update section title
  async updateSectionTitle() {
    if (!this.sectionTitles.aboutCompany.trim()) {
      swalHelper.showToast('Section title is required!', 'warning');
      return;
    }

    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      const data = {
        businessCardId: businessCardId,
        sectionTitles: {
          aboutCompany: this.sectionTitles.aboutCompany
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