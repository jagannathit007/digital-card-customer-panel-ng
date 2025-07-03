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
  selector: 'app-our-products',
  templateUrl: './our-products.component.html',
  styleUrls: ['./our-products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OurProductsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef;
  @ViewChild('categoryFileInput') categoryFileInput!: ElementRef;
  @ViewChild('categoryProductFileInput') categoryProductFileInput!: ElementRef;
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
  productVisible: boolean = false;
  products: any[] = [];
  filteredProducts: any[] = [];
  totalItems: number = 0;
  searchTerm: string = '';
  itemsPerPage: number = 10;
  p: number = 1;
  isLoading: boolean = false;
  imageBaseURL = environment.imageURL;
  activeTab: string = 'products';

  // Catogrey manage Properties

  productcategoryVisible: boolean = true;
  categories: any[] = [];
  filteredCategories: any[] = [];
  categoryTotalItems: number = 0;
  categorySearchTerm: string = '';
  categoryItemsPerPage: number = 10;
  categoryPage: number = 1;
  isCategoryLoading: boolean = false;

  categoryNameEditor: Editor = new Editor();
  categoryDescriptionEditor: Editor = new Editor();
  // Editor instances for name and description
  editor: Editor = new Editor();
  nameEditor: Editor = new Editor();
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

  selectedProducts: any = {
    _id: null,
    name: '',
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
    products: []
  };

  selectedCategoryProduct: any = {
    _id: null,
    name: '',
    images: [] as File[],
    description: '',
    price: '',
    visible: true,
    existingImages: []
  };

  selectedCategoryProductId: string | null = null;

  sectionTitles: any = {
    products: 'Our Products'
  };


  ngOnInit() {
    this.businessCardId = this.storage.get(common.BUSINESS_CARD);
    this.editor = new Editor();
    this.nameEditor = new Editor();
    this._getProducts();
    this.categoryNameEditor = new Editor();
    this.categoryDescriptionEditor = new Editor();
    this._getCategories();
  }

  ngOnDestroy() {
    this.editor.destroy();
    this.nameEditor.destroy();
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

  async _getProducts() {
    this.isLoading = true;
    try {
      let results = await this.authService.getWebsiteDetails(this.businessCardId);
      if (results) {
        this.products = results.products ? [...results.products] : [];
        this.filteredProducts = [...this.products];
        this.totalItems = this.products.length;
        this.productVisible = results.productVisible;
        if (results.sectionTitles) {
          this.sectionTitles = results.sectionTitles;
        }
        this.cdr.markForCheck();
      } else {
        swalHelper.showToast('Failed to fetch products!', 'warning');
      }
    } catch (error) {
      console.error('Error fetching products: ', error);
      swalHelper.showToast('Error fetching products!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product =>
        this.stripHtml(product.name).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.stripHtml(product.description).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (product.price && product.price.toString().includes(this.searchTerm))
      );
    }
    this.totalItems = this.filteredProducts.length;
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

  onOpenCraeteModal() {
    this.selectedProducts = {
      _id: null,
      name: '',
      images: [] as File[],
      description: '',
      price: '',
      visible: true,
      existingImages: []
    };
    this.modal.open('create-products');
    this.cdr.markForCheck();
  }

  onOpenUpdateModal(item: any) {
    this.selectedProducts = {
      ...item,
      images: item.images ? [...item.images] : [],
      existingImages: item.images ? [...item.images] : [],
      name: item.name || '',
      price: item.price || '',
      description: item.description || '',
      visible: item.visible !== undefined ? item.visible : true
    };
    this.modal.open('create-products');
    this.cdr.markForCheck();
  }

  onCloseModal(modal: string) {
    this._reset();
    this.modal.close(modal);
  }

  onCancel() {
    this._reset();
    this.modal.close('create-products');
  }

  validatePrice(event: any) {
    const value = event.target.value;
    if (value < 0) {
      event.target.value = '';
      this.selectedProducts.price = '';
      swalHelper.showToast('Price cannot be negative!', 'warning');
    }
  }

  // ! Skip the product image size  validation 
  // onUploadImage(event: any) {
  //   const files: FileList = event.target.files;
  //   const newFiles: File[] = Array.from(files);

  //   if (!this.selectedProducts.images) {
  //     this.selectedProducts.images = [];
  //   }

  //   const totalImages = this.selectedProducts.images.length + newFiles.length;
  //   if (totalImages > 5) {
  //     swalHelper.warning('You can upload a maximum of 5 images.');
  //     this.selectedProducts.images = [];
  //     this.fileInputRef.nativeElement.value = '';
  //     return;
  //   }

  //   const allowedDimensions = [
  //     { width: 1250, height: 720 },
  //     { width: 1600, height: 900 }
  //   ];

  //   let validImages: File[] = [];
  //   let processed = 0;

  //   for (let file of newFiles) {
  //     const reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       const img = new Image();
  //       img.onload = () => {
  //         const isValid = allowedDimensions.some(dim =>
  //           img.width === dim.width && img.height === dim.height
  //         );

  //         if (isValid) {
  //           validImages.push(file);
  //         } else {
  //           swalHelper.warning(`Image "${file.name}" must be 1250x720 or 1600x900.`);
  //         }

  //         processed++;
  //         if (processed === newFiles.length) {
  //           this.selectedProducts.images.push(...validImages);
  //           this.cdr.markForCheck();
  //         }
  //       };
  //       img.src = e.target.result;
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  onUploadImage(event: any) {
    const files: FileList = event.target.files;
    const newFiles: File[] = Array.from(files);

    if (!this.selectedProducts.images) {
      this.selectedProducts.images = [];
    }

    const totalImages = this.selectedProducts.images.length + newFiles.length;
    if (totalImages > 5) {
      swalHelper.warning('You can upload a maximum of 5 images.');
      this.selectedProducts.images = [];
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
          this.selectedProducts.images.push(...validImages);
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
    const removedImage = this.selectedProducts.images[index];
    this.selectedProducts.images.splice(index, 1);

    // Remove the image from existingImages if it exists
    if (removedImage && this.selectedProducts.existingImages) {
      const existingIndex = this.selectedProducts.existingImages.indexOf(removedImage);
      if (existingIndex !== -1) {
        this.selectedProducts.existingImages.splice(existingIndex, 1);
      }
    }

    if (this.selectedProducts.images.length === 0) {
      this.selectedProducts.images = [];
      this.fileInputRef.nativeElement.value = '';
    }
    this.cdr.markForCheck();
  }

  async onCreateProducts() {
    if (this.selectedProducts.price && isNaN(Number(this.selectedProducts.price))) {
      swalHelper.showToast('Please enter a valid price!', 'warning');
      return;
    }

    // Validate name field (strip HTML to ensure it's not empty)
    const strippedName = this.stripHtml(this.selectedProducts.name).trim();
    if (!strippedName) {
      swalHelper.showToast('Product name is required!', 'warning');
      return;
    }

    const formdata = new FormData();
    formdata.append('name', this.selectedProducts.name);
    formdata.append('description', this.selectedProducts.description);
    formdata.append('businessCardId', this.businessCardId);
    formdata.append('visible', String(this.selectedProducts.visible));
    if (this.selectedProducts.price) {
      formdata.append('price', this.selectedProducts.price);
    }
    if (this.selectedProducts._id) {
      formdata.append('id', this.selectedProducts._id);
    }

    // Append only new images (File instances)
    this.selectedProducts.images.forEach((file: any, index: number) => {
      if (file instanceof File) {
        formdata.append('images', file);
      }
    });

    // Append existingImages only if there are any left
    if (this.selectedProducts.existingImages && this.selectedProducts.existingImages.length > 0) {
      formdata.append('existingImages', JSON.stringify(this.selectedProducts.existingImages));
      console.log('Existing images:', this.selectedProducts.existingImages);
    }

    this.isLoading = true;
    try {
      await this.websiteService.createProducts(formdata);
      await this._getProducts();
      this.modal.close('create-products');
      this._reset();
      swalHelper.showToast('Product saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving product: ', error);
      swalHelper.showToast('Error saving product!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  async _deleteProducts(id: string) {
    try {
      const confirm = await swalHelper.delete();
      if (confirm.isConfirmed) {
        await this.websiteService.deleteProducts({
          productId: id,
          businessCardId: this.storage.get(common.BUSINESS_CARD)
        });
        await this._getProducts();
        swalHelper.showToast('Product deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting product: ', error);
      swalHelper.showToast('Error deleting product!', 'error');
    }
  }

  onOpenImageModal(images: any[]) {
    this.imageForCarousel = images;
    this.modal.open('image-carousel');
  }

  async _updateVisibility() {
    try {
      await this.websiteService.updateVisibility({
        productVisible: this.productVisible,
        businessCardId: this.businessCardId
      });
    } catch (error) {
      console.error('Error updating visibility: ', error);
      swalHelper.showToast('Error updating visibility!', 'error');
    }
  }

  _reset() {
    this.selectedProducts = {
      _id: null,
      name: '',
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
        this.categories = results.categories ? [...results.categories] : [];
        this.filteredCategories = [...this.categories];
        this.categoryTotalItems = this.categories.length;
        this.productcategoryVisible = results.productcategoryVisible;
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
      products: []
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
      products: item.products ? [...item.products] : []
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

  // ! catogrey image size skip validation of image size dimension
  // onUploadCategoryImage(event: any) {
  //   const file: File = event.target.files[0];
  //   if (!file) return;

  //   const allowedDimensions = [
  //     { width: 1250, height: 720 },
  //     { width: 1600, height: 900 }
  //   ];

  //   const reader = new FileReader();
  //   reader.onload = (e: any) => {
  //     const img = new Image();
  //     img.onload = () => {
  //       const isValid = allowedDimensions.some(dim =>
  //         img.width === dim.width && img.height === dim.height
  //       );

  //       if (isValid) {
  //         this.selectedCategory.categoryImage = file;
  //       } else {
  //         swalHelper.warning(`Image "${file.name}" must be 1250x720 or 1600x900.`);
  //         this.categoryFileInput.nativeElement.value = '';
  //       }
  //       this.cdr.markForCheck();
  //     };
  //     img.src = e.target.result;
  //   };
  //   reader.readAsDataURL(file);
  // }

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
      await this.websiteService.addOrUpdateCategory(formdata);
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
        await this.websiteService.deleteCategory({
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
        productcategoryVisible: this.productcategoryVisible,
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
      products: []
    };
    this.categorySearchTerm = '';
    this.categoryItemsPerPage = 10;
    this.categoryPage = 1;
    if (this.categoryFileInput) {
      this.categoryFileInput.nativeElement.value = '';
    }
    this.cdr.markForCheck();
  }

  onOpenCategoryProductsModal(category: any) {
    this.selectedCategory = { ...category, products: category.products ? [...category.products] : [] };
    this.selectedCategoryProductId = null;
    this._resetCategoryProduct();
    this.modal.open('category-products');
    this.cdr.markForCheck();
  }

  onCloseCategoryProductsModal() {
    this._resetCategory();
    this._resetCategoryProduct();
    this.modal.close('category-products');
  }

  onOpenAddCategoryProductModal() {
    this._resetCategoryProduct();
    this.modal.open('create-category-product');
    this.cdr.markForCheck();
  }

  onOpenUpdateCategoryProductModal(item: any) {
    this.selectedCategoryProduct = {
      ...item,
      images: item.images ? [...item.images] : [],
      existingImages: item.images ? [...item.images] : [],
      name: item.name || '',
      price: item.price || '',
      description: item.description || '',
      visible: item.visible !== undefined ? item.visible : true
    };
    this.modal.open('create-category-product');
    this.cdr.markForCheck();
  }

  onSelectCategoryProduct(event: any) {
    const product = this.selectedCategory.products.find((p: any) => p._id === event._id);
    if (product) {
      this.onOpenUpdateCategoryProductModal(product);
    }
  }

  onCloseCategoryProductModal() {
    this._resetCategoryProduct();
    this.modal.close('create-category-product');
  }

  onCancelCategoryProduct() {
    this._resetCategoryProduct();
    this.modal.close('create-category-product');
  }

  // ! skip the category product image size validation
  // onUploadCategoryProductImage(event: any) {
  //   const files: FileList = event.target.files;
  //   const newFiles: File[] = Array.from(files);

  //   if (!this.selectedCategoryProduct.images) {
  //     this.selectedCategoryProduct.images = [];
  //   }

  //   const totalImages = this.selectedCategoryProduct.images.length + newFiles.length;
  //   if (totalImages > 5) {
  //     swalHelper.warning('You can upload a maximum of 5 images.');
  //     this.selectedCategoryProduct.images = [];
  //     this.categoryProductFileInput.nativeElement.value = '';
  //     return;
  //   }

  // const allowedDimensions = [
  //   { width: 1250, height: 720 },
  //   { width: 1600, height: 900 }
  // ];

  //   let validImages: File[] = [];
  //   let processed = 0;

  //   for (let file of newFiles) {
  //     const reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       const img = new Image();
  //       img.onload = () => {
  //         const isValid = allowedDimensions.some(dim =>
  //           img.width === dim.width && img.height === dim.height
  //         );

  //         if (isValid) {
  //           validImages.push(file);
  //         } else {
  //           swalHelper.warning(`Image "${file.name}" must be 1250x720 or 1600x900.`);
  //         }

  //         processed++;
  //         if (processed === newFiles.length) {
  //           this.selectedCategoryProduct.images.push(...validImages);
  //           this.cdr.markForCheck();
  //         }
  //       };
  //       img.src = e.target.result;
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  onUploadCategoryProductImage(event: any) {
    const files: FileList = event.target.files;
    const newFiles: File[] = Array.from(files);

    if (!this.selectedCategoryProduct.images) {
      this.selectedCategoryProduct.images = [];
    }

    const totalImages = this.selectedCategoryProduct.images.length + newFiles.length;
    if (totalImages > 5) {
      swalHelper.warning('You can upload a maximum of 5 images.');
      this.selectedCategoryProduct.images = [];
      this.categoryProductFileInput.nativeElement.value = '';
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
          this.selectedCategoryProduct.images.push(...validImages);
          this.cdr.markForCheck();
        }
      };
      reader.readAsDataURL(file);
    }
  }

  getCategoryProductImagePreview(img: any): string {
    if (img instanceof File) {
      if (!this.objectURLCache.has(img)) {
        const url = URL.createObjectURL(img);
        this.objectURLCache.set(img, url);
      }
      return this.objectURLCache.get(img)!;
    }
    return this.imageBaseURL + img;
  }

  removeCategoryProductImage(index: number) {
    const removedImage = this.selectedCategoryProduct.images[index];
    this.selectedCategoryProduct.images.splice(index, 1);

    if (removedImage && this.selectedCategoryProduct.existingImages) {
      const existingIndex = this.selectedCategoryProduct.existingImages.indexOf(removedImage);
      if (existingIndex !== -1) {
        this.selectedCategoryProduct.existingImages.splice(existingIndex, 1);
      }
    }

    if (this.selectedCategoryProduct.images.length === 0) {
      this.selectedCategoryProduct.images = [];
      this.categoryProductFileInput.nativeElement.value = '';
    }
    this.cdr.markForCheck();
  }

  // async onCreateCategoryProduct() {
  //   if (this.selectedCategoryProduct.price && isNaN(Number(this.selectedCategoryProduct.price))) {
  //     swalHelper.showToast('Please enter a valid price!', 'warning');
  //     return;
  //   }

  //   const strippedName = this.stripHtml(this.selectedCategoryProduct.name).trim();
  //   if (!strippedName) {
  //     swalHelper.showToast('Product name is required!', 'warning');
  //     return;
  //   }

  //   const formdata = new FormData();
  //   formdata.append('name', this.selectedCategoryProduct.name);
  //   formdata.append('description', this.selectedCategoryProduct.description);
  //   formdata.append('businessCardId', this.businessCardId);
  //   formdata.append('categoryId', this.selectedCategory._id);
  //   formdata.append('visible', String(this.selectedCategoryProduct.visible));
  //   if (this.selectedCategoryProduct.price) {
  //     formdata.append('price', this.selectedCategoryProduct.price);
  //   }
  //   if (this.selectedCategoryProduct._id) {
  //     formdata.append('productId', this.selectedCategoryProduct._id);
  //   }

  //   this.selectedCategoryProduct.images.forEach((file: any, index: number) => {
  //     if (file instanceof File) {
  //       formdata.append('images', file);
  //     }
  //   });

  //   if (this.selectedCategoryProduct.existingImages && this.selectedCategoryProduct.existingImages.length > 0) {
  //     formdata.append('existingImages', JSON.stringify(this.selectedCategoryProduct.existingImages));
  //   }

  //   this.isCategoryLoading = true;
  //   try {
  //     await this.websiteService.addOrUpdateProductInCategory(formdata);
  //     await this._getCategories();
  //     this.modal.close('create-category-product');
  //     this._resetCategoryProduct();
  //     swalHelper.showToast('Product saved successfully!', 'success');
  //   } catch (error) {
  //     console.error('Error saving product: ', error);
  //     swalHelper.showToast('Error saving product!', 'error');
  //   } finally {
  //     this.isCategoryLoading = false;
  //     this.cdr.markForCheck();
  //   }
  // }

  async onCreateCategoryProduct() {
    if (this.selectedCategoryProduct.price && isNaN(Number(this.selectedCategoryProduct.price))) {
      swalHelper.showToast('Please enter a valid price!', 'warning');
      return;
    }

    const strippedName = this.stripHtml(this.selectedCategoryProduct.name).trim();
    if (!strippedName) {
      swalHelper.showToast('Product name is required!', 'warning');
      return;
    }

    const formdata = new FormData();
    formdata.append('name', this.selectedCategoryProduct.name);
    formdata.append('description', this.selectedCategoryProduct.description);
    formdata.append('businessCardId', this.businessCardId);
    formdata.append('categoryId', this.selectedCategory._id);
    formdata.append('visible', String(this.selectedCategoryProduct.visible));
    if (this.selectedCategoryProduct.price) {
      formdata.append('price', this.selectedCategoryProduct.price);
    }
    if (this.selectedCategoryProduct._id) {
      formdata.append('productId', this.selectedCategoryProduct._id);
    }

    this.selectedCategoryProduct.images.forEach((file: any, index: number) => {
      if (file instanceof File) {
        formdata.append('images', file);
      }
    });

    if (this.selectedCategoryProduct.existingImages && this.selectedCategoryProduct.existingImages.length > 0) {
      formdata.append('existingImages', JSON.stringify(this.selectedCategoryProduct.existingImages));
    }

    this.isCategoryLoading = true;
    try {
      await this.websiteService.addOrUpdateProductInCategory(formdata);
      // Refresh categories and update selectedCategory
      await this._getCategories();
      // Find the updated category and sync selectedCategory
      const updatedCategory = this.categories.find(cat => cat._id === this.selectedCategory._id);
      if (updatedCategory) {
        this.selectedCategory = { ...updatedCategory, products: updatedCategory.products ? [...updatedCategory.products] : [] };
      }
      this.modal.close('create-category-product');
      this._resetCategoryProduct();
      swalHelper.showToast('Product saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving product: ', error);
      swalHelper.showToast('Error saving product!', 'error');
    } finally {
      this.isCategoryLoading = false;
      this.cdr.markForCheck();
    }
  }

  // async deleteCategoryProduct(productId: string) {
  //   try {
  //     const confirm = await swalHelper.delete();
  //     if (confirm.isConfirmed) {
  //       await this.websiteService.deleteProductInCategory({
  //         productId,
  //         categoryId: this.selectedCategory._id,
  //         businessCardId: this.businessCardId
  //       });
  //       await this._getCategories();
  //       this._resetCategoryProduct();
  //       swalHelper.showToast('Product deleted successfully!', 'success');
  //     }
  //   } catch (error) {
  //     console.error('Error deleting product: ', error);
  //     swalHelper.showToast('Error deleting product!', 'error');
  //   }
  // }

  async deleteCategoryProduct(productId: string) {
    try {
      const confirm = await swalHelper.delete();
      if (confirm.isConfirmed) {
        await this.websiteService.deleteProductInCategory({
          productId,
          categoryId: this.selectedCategory._id,
          businessCardId: this.businessCardId
        });
        // Refresh categories and update selectedCategory
        await this._getCategories();
        // Find the updated category and sync selectedCategory
        const updatedCategory = this.categories.find(cat => cat._id === this.selectedCategory._id);
        if (updatedCategory) {
          this.selectedCategory = { ...updatedCategory, products: updatedCategory.products ? [...updatedCategory.products] : [] };
        }
        this._resetCategoryProduct();
        swalHelper.showToast('Product deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting product: ', error);
      swalHelper.showToast('Error deleting product!', 'error');
    }
  }

  onOpenCategoryImageModal(image: string) {
    this.imageForCarousel = [image];
    this.modal.open('image-carousel');
  }

  _resetCategoryProduct() {
    this.selectedCategoryProduct = {
      _id: null,
      name: '',
      images: [] as File[],
      description: '',
      price: '',
      visible: true,
      existingImages: []
    };
    this.selectedCategoryProductId = null;
    if (this.categoryProductFileInput) {
      this.categoryProductFileInput.nativeElement.value = '';
    }
    this.cdr.markForCheck();
  }

  // Add this method to handle title edit
  editSectionTitle() {
    this.modal.open('EditTitleModal');
  }

  // Add this method to update section title
  async updateSectionTitle() {
    if (!this.sectionTitles.products.trim()) {
      swalHelper.showToast('Section title is required!', 'warning');
      return;
    }

    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      const data = {
        businessCardId: businessCardId,
        sectionTitles: {
          products: this.sectionTitles.products
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