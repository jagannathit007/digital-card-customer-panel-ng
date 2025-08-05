import { ChangeDetectionStrategy, ChangeDetectorRef, Component, AfterViewInit, ElementRef, NgZone, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ModalService } from 'src/app/core/utilities/modal';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { common } from 'src/app/core/constants/common';
import { WebsiteBuilderService } from 'src/app/services/website-builder.service';
import { Editor, Toolbar } from 'ngx-editor';
import { NgxEditorModule } from 'ngx-editor';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-our-services',
  templateUrl: './our-services.component.html',
  styleUrls: ['./our-services.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OurServicesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef;
  @ViewChild('categoryFileInput') categoryFileInput!: ElementRef;
  @ViewChild('categoryServiceFileInput') categoryServiceFileInput!: ElementRef;
  private objectURLCache = new Map<File, string>();

  constructor(
    public modal: ModalService,
    private zone: NgZone,
    private storage: AppStorage,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private websiteService: WebsiteBuilderService,
    private sanitizer: DomSanitizer
  ) { }

  businessCardId: any;
  serviceVisible: boolean = false;
  services: any[] = [];
  filteredServices: any[] = [];
  totalItems: number = 0;
  searchTerm: string = '';
  itemsPerPage: number = 10;
  p: number = 1;
  isLoading: boolean = false;
  imageBaseURL = environment.imageURL;
  activeTab: string = 'services';

  // Category manage Properties
  servicecategoryVisible: boolean = true;
  categories: any[] = [];
  filteredCategories: any[] = [];
  categoryTotalItems: number = 0;
  categorySearchTerm: string = '';
  categoryItemsPerPage: number = 10;
  categoryPage: number = 1;
  isCategoryLoading: boolean = false;

  categoryNameEditor: Editor = new Editor();
  categoryDescriptionEditor: Editor = new Editor();
  // Editor instances for title and description
  editor: Editor = new Editor();
  titleEditor: Editor = new Editor();
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify']
  ];

  selectedServices: any = {
    _id: null,
    title: '',
    images: [] as File[],
    description: '',
    price: '',
    visible: true,
    existingImages: []
  };

  imageForCarousel: any[] = [];

  // Category management properties
  selectedCategory: any = {
    _id: null,
    categoryName: '',
    description: '',
    categoryImage: null,
    categoryVisible: true,
    services: []
  };

  selectedCategoryService: any = {
    _id: null,
    title: '',
    images: [] as File[],
    description: '',
    price: '',
    visible: true,
    existingImages: []
  };

  selectedCategoryServiceId: string | null = null;

  sectionTitles: any = {
    services: 'Our Services',
    servicescategories: 'ServicesCategories'
  };

  ngOnInit() {
    this.businessCardId = this.storage.get(common.BUSINESS_CARD);
    this.editor = new Editor();
    this.titleEditor = new Editor();
    this._getServices();
    this.categoryNameEditor = new Editor();
    this.categoryDescriptionEditor = new Editor();
    this._getCategories();
  }

  ngOnDestroy() {
    this.editor.destroy();
    this.titleEditor.destroy();
    this.categoryNameEditor.destroy();
    this.categoryDescriptionEditor.destroy();
  }

  ngAfterViewInit() {
    this.cdr.markForCheck(); // Ensure UI updates after view init
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.cdr.markForCheck(); // Trigger change detection
  }

  async _getServices() {
    this.isLoading = true;
    try {
      let results = await this.authService.getWebsiteDetails(this.businessCardId);
      if (results) {
        this.services = results.services ? [...results.services] : [];
        this.filteredServices = [...this.services];
        this.totalItems = this.services.length;
        this.serviceVisible = results.serviceVisible;
        if (results.sectionTitles) {
          this.sectionTitles = results.sectionTitles;
        }
        this.cdr.markForCheck();
      } else {
        swalHelper.showToast('Failed to fetch services!', 'warning');
      }
    } catch (error) {
      console.error('Error fetching services: ', error);
      swalHelper.showToast('Error fetching services!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredServices = [...this.services];
    } else {
      this.filteredServices = this.services.filter(service =>
        this.stripHtml(service.title).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.stripHtml(service.description).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (service.price && service.price.toString().includes(this.searchTerm))
      );
    }
    this.totalItems = this.filteredServices.length;
    this.p = 1;
    this.cdr.markForCheck();
  }

  onItemsPerPageChange() {
    this.p = 1;
    this.cdr.markForCheck();
  }

  onPageChange(page: number) {
    this.p = page;
    this.cdr.markForCheck();
  }

  onOpenCreateModal() {
    this.selectedServices = {
      _id: null,
      title: '',
      images: [] as File[],
      description: '',
      price: '',
      visible: true,
      existingImages: []
    };
    this.modal.open('create-services');
    this.cdr.markForCheck();
  }

  onOpenUpdateModal(item: any) {
    this.selectedServices = {
      ...item,
      images: item.images ? [...item.images] : [],
      existingImages: item.images ? [...item.images] : [],
      title: item.title || '',
      price: item.price || '',
      description: item.description || '',
      visible: item.visible !== undefined ? item.visible : true
    };
    this.modal.open('create-services');
    this.cdr.markForCheck();
  }

  onCloseModal(modal: string) {
    this._reset();
    this.modal.close(modal);
  }

  onCancel() {
    this._reset();
    this.modal.close('create-services');
  }

  validatePrice(event: any) {
    const value = event.target.value;
    if (value < 0) {
      event.target.value = '';
      this.selectedServices.price = '';
      swalHelper.showToast('Price cannot be negative!', 'warning');
    }
  }

  onUploadImage(event: any) {
    const files: FileList = event.target.files;
    const newFiles: File[] = Array.from(files);

    if (!this.selectedServices.images) {
      this.selectedServices.images = [];
    }

    const totalImages = this.selectedServices.images.length + newFiles.length;
    if (totalImages > 5) {
      swalHelper.warning('You can upload a maximum of 5 images.');
      this.selectedServices.images = [];
      this.fileInputRef.nativeElement.value = '';
      return;
    }

    let validImages: File[] = [];
    let processed = 0;

    for (let file of newFiles) {
      const reader = new FileReader();
      reader.onload = () => {
        validImages.push(file);
        processed++;
        if (processed === newFiles.length) {
          this.selectedServices.images.push(...validImages);
          this.cdr.markForCheck();
        }
      };
      reader.readAsDataURL(file);
    }
  }

  getImagePreview(img: any): string {
    if (img instanceof File) {
      if (!this.objectURLCache.has(img)) {
        const url = URL.createObjectURL(img);
        this.objectURLCache.set(img, url);
      }
      return this.objectURLCache.get(img)!;
    }
    return this.imageBaseURL + img;
  }

  removeImage(index: number) {
    const removedImage = this.selectedServices.images[index];
    this.selectedServices.images.splice(index, 1);

    // Remove the image from existingImages if it exists
    if (removedImage && this.selectedServices.existingImages) {
      const existingIndex = this.selectedServices.existingImages.indexOf(removedImage);
      if (existingIndex !== -1) {
        this.selectedServices.existingImages.splice(existingIndex, 1);
      }
    }

    if (this.selectedServices.images.length === 0) {
      this.selectedServices.images = [];
      this.fileInputRef.nativeElement.value = '';
    }
    this.cdr.markForCheck();
  }

  async onCreateServices() {
    if (this.selectedServices.price && isNaN(Number(this.selectedServices.price))) {
      swalHelper.showToast('Please enter a valid price!', 'warning');
      return;
    }

    // Validate title field (strip HTML to ensure it's not empty)
    const strippedTitle = this.stripHtml(this.selectedServices.title).trim();
    if (!strippedTitle) {
      swalHelper.showToast('Service title is required!', 'warning');
      return;
    }

    const formdata = new FormData();
    formdata.append('title', this.selectedServices.title);
    formdata.append('description', this.selectedServices.description);
    formdata.append('businessCardId', this.businessCardId);
    formdata.append('visible', String(this.selectedServices.visible));
    if (this.selectedServices.price) {
      formdata.append('price', this.selectedServices.price);
    }
    if (this.selectedServices._id) {
      formdata.append('id', this.selectedServices._id);
    }

    // Append only new images (File instances)
    this.selectedServices.images.forEach((file: any, index: number) => {
      if (file instanceof File) {
        formdata.append('images', file);
      }
    });

    // Append existingImages only if there are any left
    if (this.selectedServices.existingImages && this.selectedServices.existingImages.length > 0) {
      formdata.append('existingImages', JSON.stringify(this.selectedServices.existingImages));
    }

    this.isLoading = true;
    try {
      await this.websiteService.createService(formdata);
      await this._getServices();
      this.modal.close('create-services');
      this._reset();
      swalHelper.showToast('Service saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving service: ', error);
      swalHelper.showToast('Error saving service!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  async _deleteServices(id: string) {
    try {
      const confirm = await swalHelper.delete();
      if (confirm.isConfirmed) {
        await this.websiteService.deleteService({
          serviceId: id,
          businessCardId: this.storage.get(common.BUSINESS_CARD)
        });
        await this._getServices();
        swalHelper.showToast('Service deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting service: ', error);
      swalHelper.showToast('Error deleting service!', 'error');
    }
  }

  onOpenImageModal(images: any[]) {
    this.imageForCarousel = images;
    this.modal.open('image-carousel');
  }

  async _updateVisibility() {
    try {
      await this.websiteService.updateVisibility({
        serviceVisible: this.serviceVisible,
        businessCardId: this.businessCardId
      });
    } catch (error) {
      console.error('Error updating visibility: ', error);
      swalHelper.showToast('Error updating visibility!', 'error');
    }
  }

  _reset() {
    this.selectedServices = {
      _id: null,
      title: '',
      images: [] as File[],
      description: '',
      price: '',
      visible: true,
      existingImages: []
    };
    this.searchTerm = '';
    this.itemsPerPage = 10;
    this.p = 1;
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
    this.cdr.markForCheck();
  }

  // Sanitize HTML content to prevent XSS
  sanitizeHtml(content: any): any {
    if (!content) return '';
    return content.replace(/<[^>]*>/g, '');
  }

  // Helper method to strip HTML tags for search and validation
  stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  // Category management methods

  async _getCategories() {
    this.isCategoryLoading = true;
    try {
      let results = await this.authService.getWebsiteDetails(this.businessCardId);
      if (results) {
        this.categories = results.servicescategories ? [...results.servicescategories] : [];
        this.filteredCategories = [...this.categories];
        this.categoryTotalItems = this.categories.length;
        this.servicecategoryVisible = results.servicecategoryVisible;
        if (results.sectionTitles) {
          this.sectionTitles = results.sectionTitles;
        }
        this.cdr.markForCheck();
      } else {
        swalHelper.showToast('Failed to fetch categories!', 'warning');
      }
    } catch (error) {
      console.error('Error fetching categories: ', error);
      swalHelper.showToast('Error fetching categories!', 'error');
    } finally {
      this.isCategoryLoading = false;
      this.cdr.markForCheck();
    }
  }

  onCategorySearch() {
    if (!this.categorySearchTerm.trim()) {
      this.filteredCategories = [...this.categories];
    } else {
      this.filteredCategories = this.categories.filter(category =>
        this.stripHtml(category.categoryName).toLowerCase().includes(this.categorySearchTerm.toLowerCase()) ||
        this.stripHtml(category.description).toLowerCase().includes(this.categorySearchTerm.toLowerCase())
      );
    }
    this.categoryTotalItems = this.filteredCategories.length;
    this.categoryPage = 1;
    this.cdr.markForCheck();
  }

  onCategoryItemsPerPageChange() {
    this.categoryPage = 1;
    this.cdr.markForCheck();
  }

  onCategoryPageChange(page: number) {
    this.categoryPage = page;
    this.cdr.markForCheck();
  }

  onOpenCreateCategoryModal() {
    this.selectedCategory = {
      _id: null,
      categoryName: '',
      description: '',
      categoryImage: null,
      categoryVisible: true,
      services: []
    };
    this.modal.open('create-category');
    this.cdr.markForCheck();
  }

  onOpenUpdateCategoryModal(item: any) {
    this.selectedCategory = {
      ...item,
      categoryName: item.categoryName || '',
      description: item.description || '',
      categoryImage: item.image || null,
      categoryVisible: item.categoryVisible !== undefined ? item.categoryVisible : true,
      services: item.services ? [...item.services] : []
    };
    this.modal.open('create-category');
    this.cdr.markForCheck();
  }

  onCloseCategoryModal(modal: string) {
    this._resetCategory();
    this.modal.close(modal);
  }

  onCancelCategory() {
    this._resetCategory();
    this.modal.close('create-category');
  }

  onUploadCategoryImage(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.selectedCategory.categoryImage = file;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  getCategoryImagePreview(img: any): string {
    if (img instanceof File) {
      if (!this.objectURLCache.has(img)) {
        const url = URL.createObjectURL(img);
        this.objectURLCache.set(img, url);
      }
      return this.objectURLCache.get(img)!;
    }
    return this.imageBaseURL + img;
  }

  removeCategoryImage() {
    this.selectedCategory.categoryImage = null;
    this.categoryFileInput.nativeElement.value = '';
    this.cdr.markForCheck();
  }

  async onCreateCategory() {
    const strippedName = this.stripHtml(this.selectedCategory.categoryName).trim();
    if (!strippedName) {
      swalHelper.showToast('Category name is required!', 'warning');
      return;
    }

    const formdata = new FormData();
    formdata.append('categoryName', this.selectedCategory.categoryName);
    formdata.append('description', this.selectedCategory.description);
    formdata.append('businessCardId', this.businessCardId);
    formdata.append('categoryVisible', String(this.selectedCategory.categoryVisible));
    if (this.selectedCategory._id) {
      formdata.append('categoryId', this.selectedCategory._id);
    }
    if (this.selectedCategory.categoryImage instanceof File) {
      formdata.append('categoryImage', this.selectedCategory.categoryImage);
    }

    this.isCategoryLoading = true;
    try {
      await this.websiteService.addOrUpdateServiceCategory(formdata);
      await this._getCategories();
      this.modal.close('create-category');
      this._resetCategory();
      swalHelper.showToast('Category saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving category: ', error);
      swalHelper.showToast('Error saving category!', 'error');
    } finally {
      this.isCategoryLoading = false;
      this.cdr.markForCheck();
    }
  }

  async deleteCategory(id: string) {
    try {
      const confirm = await swalHelper.delete();
      if (confirm.isConfirmed) {
        await this.websiteService.deleteServiceCategory({
          categoryId: id,
          businessCardId: this.businessCardId
        });
        await this._getCategories();
        swalHelper.showToast('Category deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting category: ', error);
      swalHelper.showToast('Error deleting category!', 'error');
    }
  }

  async _updateCategoryVisibility() {
    try {
      await this.websiteService.updateVisibility({
        servicecategoryVisible: this.servicecategoryVisible,
        businessCardId: this.businessCardId
      });
    } catch (error) {
      console.error('Error updating category visibility: ', error);
      swalHelper.showToast('Error updating category visibility!', 'error');
    }
  }

  _resetCategory() {
    this.selectedCategory = {
      _id: null,
      categoryName: '',
      description: '',
      categoryImage: null,
      categoryVisible: true,
      services: []
    };
    this.categorySearchTerm = '';
    this.categoryItemsPerPage = 10;
    this.categoryPage = 1;
    if (this.categoryFileInput) {
      this.categoryFileInput.nativeElement.value = '';
    }
    this.cdr.markForCheck();
  }

  onOpenCategoryServicesModal(category: any) {
    this.selectedCategory = { ...category, services: category.services ? [...category.services] : [] };
    this.selectedCategoryServiceId = null;
    this._resetCategoryService();
    this.modal.open('category-services');
    this.cdr.markForCheck();
  }

  onCloseCategoryServicesModal() {
    this._resetCategory();
    this._resetCategoryService();
    this.modal.close('category-services');
  }

  onOpenAddCategoryServiceModal() {
    this._resetCategoryService();
    this.modal.open('create-category-service');
    this.cdr.markForCheck();
  }

  onOpenUpdateCategoryServiceModal(item: any) {
    this.selectedCategoryService = {
      ...item,
      images: item.images ? [...item.images] : [],
      existingImages: item.images ? [...item.images] : [],
      title: item.title || '',
      price: item.price || '',
      description: item.description || '',
      visible: item.visible !== undefined ? item.visible : true
    };
    this.modal.open('create-category-service');
    this.cdr.markForCheck();
  }

  onSelectCategoryService(event: any) {
    const service = this.selectedCategory.services.find((s: any) => s._id === event._id);
    if (service) {
      this.onOpenUpdateCategoryServiceModal(service);
    }
  }

  onCloseCategoryServiceModal() {
    this._resetCategoryService();
    this.modal.close('create-category-service');
  }

  onCancelCategoryService() {
    this._resetCategoryService();
    this.modal.close('create-category-service');
  }

  onUploadCategoryServiceImage(event: any) {
    const files: FileList = event.target.files;
    const newFiles: File[] = Array.from(files);

    if (!this.selectedCategoryService.images) {
      this.selectedCategoryService.images = [];
    }

    const totalImages = this.selectedCategoryService.images.length + newFiles.length;
    if (totalImages > 5) {
      swalHelper.warning('You can upload a maximum of 5 images.');
      this.selectedCategoryService.images = [];
      this.categoryServiceFileInput.nativeElement.value = '';
      return;
    }

    let validImages: File[] = [];
    let processed = 0;

    for (let file of newFiles) {
      const reader = new FileReader();
      reader.onload = () => {
        validImages.push(file);
        processed++;
        if (processed === newFiles.length) {
          this.selectedCategoryService.images.push(...validImages);
          this.cdr.markForCheck();
        }
      };
      reader.readAsDataURL(file);
    }
  }

  getCategoryServiceImagePreview(img: any): string {
    if (img instanceof File) {
      if (!this.objectURLCache.has(img)) {
        const url = URL.createObjectURL(img);
        this.objectURLCache.set(img, url);
      }
      return this.objectURLCache.get(img)!;
    }
    return this.imageBaseURL + img;
  }

  removeCategoryServiceImage(index: number) {
    const removedImage = this.selectedCategoryService.images[index];
    this.selectedCategoryService.images.splice(index, 1);

    if (removedImage && this.selectedCategoryService.existingImages) {
      const existingIndex = this.selectedCategoryService.existingImages.indexOf(removedImage);
      if (existingIndex !== -1) {
        this.selectedCategoryService.existingImages.splice(existingIndex, 1);
      }
    }

    if (this.selectedCategoryService.images.length === 0) {
      this.selectedCategoryService.images = [];
      this.categoryServiceFileInput.nativeElement.value = '';
    }
    this.cdr.markForCheck();
  }

  async onCreateCategoryService() {
    if (this.selectedCategoryService.price && isNaN(Number(this.selectedCategoryService.price))) {
      swalHelper.showToast('Please enter a valid price!', 'warning');
      return;
    }

    const strippedTitle = this.stripHtml(this.selectedCategoryService.title).trim();
    if (!strippedTitle) {
      swalHelper.showToast('Service title is required!', 'warning');
      return;
    }

    const formdata = new FormData();
    formdata.append('title', this.selectedCategoryService.title);
    formdata.append('description', this.selectedCategoryService.description);
    formdata.append('businessCardId', this.businessCardId);
    formdata.append('categoryId', this.selectedCategory._id);
    formdata.append('visible', String(this.selectedCategoryService.visible));
    if (this.selectedCategoryService.price) {
      formdata.append('price', this.selectedCategoryService.price);
    }
    if (this.selectedCategoryService._id) {
      formdata.append('serviceId', this.selectedCategoryService._id);
    }

    this.selectedCategoryService.images.forEach((file: any, index: number) => {
      if (file instanceof File) {
        formdata.append('images', file);
      }
    });

    if (this.selectedCategoryService.existingImages && this.selectedCategoryService.existingImages.length > 0) {
      formdata.append('existingImages', JSON.stringify(this.selectedCategoryService.existingImages));
    }

    this.isCategoryLoading = true;
    try {
      await this.websiteService.addOrUpdateServiceInCategory(formdata);
      // Refresh categories and update selectedCategory
      await this._getCategories();
      // Find the updated category and sync selectedCategory
      const updatedCategory = this.categories.find(cat => cat._id === this.selectedCategory._id);
      if (updatedCategory) {
        this.selectedCategory = { ...updatedCategory, services: updatedCategory.services ? [...updatedCategory.services] : [] };
      }
      this.modal.close('create-category-service');
      this._resetCategoryService();
      swalHelper.showToast('Service saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving service: ', error);
      swalHelper.showToast('Error saving service!', 'error');
    } finally {
      this.isCategoryLoading = false;
      this.cdr.markForCheck();
    }
  }

  async deleteCategoryService(serviceId: string) {
    try {
      const confirm = await swalHelper.delete();
      if (confirm.isConfirmed) {
        await this.websiteService.deleteServiceInCategory({
          serviceId,
          categoryId: this.selectedCategory._id,
          businessCardId: this.businessCardId
        });
        // Refresh categories and update selectedCategory
        await this._getCategories();
        // Find the updated category and sync selectedCategory
        const updatedCategory = this.categories.find(cat => cat._id === this.selectedCategory._id);
        if (updatedCategory) {
          this.selectedCategory = { ...updatedCategory, services: updatedCategory.services ? [...updatedCategory.services] : [] };
        }
        this._resetCategoryService();
        swalHelper.showToast('Service deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting service: ', error);
      swalHelper.showToast('Error deleting service!', 'error');
    }
  }

  onOpenCategoryImageModal(image: string) {
    this.imageForCarousel = [image];
    this.modal.open('image-carousel');
  }

  _resetCategoryService() {
    this.selectedCategoryService = {
      _id: null,
      title: '',
      images: [] as File[],
      description: '',
      price: '',
      visible: true,
      existingImages: []
    };
    this.selectedCategoryServiceId = null;
    if (this.categoryServiceFileInput) {
      this.categoryServiceFileInput.nativeElement.value = '';
    }
    this.cdr.markForCheck();
  }

  // Add this method to handle title edit
  editSectionTitle() {
    this.modal.open('EditTitleModal');
  }

  // Add this method to update section title
  async updateSectionTitle() {
    if (!this.sectionTitles.services.trim()) {
      swalHelper.showToast('Section title is required!', 'warning');
      return;
    }

    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      const data = {
        businessCardId: businessCardId,
        sectionTitles: {
          services: this.sectionTitles.services
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

  editSectionTitleOfCategory() {
    this.modal.open('EditTitleModalForCategory');
  }

  // Add this method to update section title
  async updateSectionTitleOfCategory() {
    if (!this.sectionTitles.servicescategories.trim()) {
      swalHelper.showToast('Section title is required!', 'warning');
      return;
    }

    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      const data = {
        businessCardId: businessCardId,
        sectionTitles: {
          servicescategories: this.sectionTitles.servicescategories
        }
      };

      const result = await this.websiteService.updateSectionsTitles(data);
      if (result) {
        this.modal.close('EditTitleModalForCategory');
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