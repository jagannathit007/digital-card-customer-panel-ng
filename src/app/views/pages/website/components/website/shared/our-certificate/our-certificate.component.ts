import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Editor, Toolbar } from 'ngx-editor';
import { DomSanitizer } from '@angular/platform-browser';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';
import { WebsiteBuilderService } from 'src/app/services/website-builder.service';
import { common } from 'src/app/core/constants/common';

@Component({
  selector: 'app-our-certificate',
  templateUrl: './our-certificate.component.html',
  styleUrl: './our-certificate.component.scss'
})

export class OurCertificatesComponent implements OnInit, OnDestroy {
  imageURL = environment.imageURL;
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;

  certificates: any[] = [];
  filteredCertificates: any[] = [];
  certificateID: string = '';
  selectedImage: string = '';

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

  newCertificate: any = {
    title: '',
    description: '',
    image: null as File | null,
    visible: true
  };

  editingCertificate = {
    _id: '',
    title: '',
    description: '',
    image: null as File | null,
    currentImage: '',
    visible: true
  };

  certificationVisible: boolean = true;
  businessCardId: any;

  sectionTitles: any = {
    certification: 'certification'
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
    await this.fetchCertificates();
  }

  ngOnDestroy(): void {
    this.addEditor.destroy();
    this.editEditor.destroy();
    this.addTitleEditor.destroy();
    this.editTitleEditor.destroy();
  }

  async fetchCertificates() {
    this.isLoading = true;
    try {
      let results = await this.authService.getWebsiteDetails(this.businessCardId);
      if (results) {
        this.certificates = results.certification ? [...results.certification] : [];
        this.filteredCertificates = [...this.certificates];
        this.totalItems = this.certificates.length;
        this.certificationVisible = results.certificationVisible;
        if (results.sectionTitles) {
          this.sectionTitles = results.sectionTitles;
        }
        this.cdr.markForCheck();
      } else {
        swalHelper.showToast('Failed to fetch certificates!', 'warning');
      }
    } catch (error) {
      swalHelper.showToast('Error fetching certificates!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  async addCertificate() {
    if (!this.validateCertificate(this.newCertificate)) return;

    this.isLoading = true;
    try {
      const formData = new FormData();
      formData.append('businessCardId', this.businessCardId);
      formData.append('title', this.newCertificate.title);
      formData.append('description', this.newCertificate.description || '');
      if (this.newCertificate.image) {
        formData.append('file', this.newCertificate.image);
      }
      formData.append('visible', this.newCertificate.visible.toString());

      const result = await this.authService.addcertification(formData);
      if (result) {
        await this.fetchCertificates();
        this.resetForm();
        this.modal.close('AddCertificateModal');
        swalHelper.showToast('Certificate added successfully!', 'success');
      }
    } catch (error) {
      swalHelper.showToast('Error adding certificate!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.newCertificate.image = event.target.files[0];
    }
  }

  onEditFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.editingCertificate.image = event.target.files[0];
    }
  }

  editCertificate(cert: any) {
    this.editingCertificate = {
      _id: cert._id,
      title: cert.title,
      description: cert.description || '',
      image: null,
      currentImage: cert.image || '',
      visible: cert.visible
    };
    this.modal.open('EditCertificateModal');
    this.cdr.markForCheck();
  }

  async updateCertificate() {
    if (!this.validateCertificate(this.editingCertificate)) return;

    this.isLoading = true;
    try {
      const formData = new FormData();
      formData.append('businessCardId', this.businessCardId);
      formData.append('certificateId', this.editingCertificate._id);
      formData.append('title', this.editingCertificate.title);
      formData.append('description', this.editingCertificate.description || '');
      if (this.editingCertificate.image) {
        formData.append('file', this.editingCertificate.image);
      }
      formData.append('visible', this.editingCertificate.visible.toString());

      const result = await this.authService.updatecertification(formData);
      if (result) {
        await this.fetchCertificates();
        this.modal.close('EditCertificateModal');
        swalHelper.showToast('Certificate updated successfully!', 'success');
      }
    } catch (error) {
      swalHelper.showToast('Error updating certificate!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  prepareDeleteCertificate = async (certificateID: string) => {
    this.certificateID = certificateID;
    const confirm = await swalHelper.delete();
    if (confirm.isConfirmed) {
      this.confirmDeleteCertificate();
    }
    this.cdr.markForCheck();
  }

  async confirmDeleteCertificate() {
    this.isLoading = true;
    try {
      const data = {
        businessCardId: this.businessCardId,
        certificateId: this.certificateID
      };
      const result = await this.authService.deletecertification(data);
      if (result) {
        await this.fetchCertificates();
        swalHelper.success('Certificate deleted successfully!');
      }
    } catch (error) {
      swalHelper.showToast('Error deleting certificate!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  validateCertificate(cert: any): boolean {
    if (!cert.title.trim()) {
      swalHelper.showToast('Certificate title is required!', 'warning');
      return false;
    }
    return true;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredCertificates = [...this.certificates];
    } else {
      this.filteredCertificates = this.certificates.filter(cert =>
        cert.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (cert.description && cert.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
    this.totalItems = this.filteredCertificates.length;
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
    this.newCertificate = { title: '', description: '', image: null, visible: true };
    this.cdr.markForCheck();
  }

  onCloseModal(modal: string) {
    this.modal.close(modal);
  }

  _updateVisibility = async () => {
    await this.websiteService.updateVisibility({
      certificationVisible: this.certificationVisible,
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
    if (!this.sectionTitles.certification.trim()) {
      swalHelper.showToast('Section title is required!', 'warning');
      return;
    }

    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      const data = {
        businessCardId: businessCardId,
        sectionTitles: {
          certification: this.sectionTitles.certification
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