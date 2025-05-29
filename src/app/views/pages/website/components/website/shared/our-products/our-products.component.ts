// import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { NgxPaginationModule } from 'ngx-pagination';
// import { TooltipComponent } from 'src/app/views/partials/tooltip/tooltip.component';
// import { TooltipDirective } from 'src/app/views/partials/tooltip/tooltip.directive';
// import { ModalService } from 'src/app/core/utilities/modal';
// import { swalHelper } from 'src/app/core/constants/swal-helper';
// import { environment } from 'src/env/env.local';
// import { BusinessCardService } from 'src/app/services/business-card.service';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { AuthService } from 'src/app/services/auth.service';
// import { common } from 'src/app/core/constants/common';
// import { WebsiteBuilderService } from 'src/app/services/website-builder.service';
// declare var $: any;
// @Component({
//   selector: 'app-our-products',
//   templateUrl: './our-products.component.html',
//   styleUrl: './our-products.component.scss',
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class OurProductsComponent implements OnInit {
//   @ViewChild('fileInput') fileInputRef!: ElementRef;
//   private objectURLCache = new Map<File, string>();
//   constructor(
//     private modal: ModalService,
//     private zone: NgZone,
//     private storage: AppStorage,
//     private authService: AuthService,
//     private cdr: ChangeDetectorRef,
//     private websiteService: WebsiteBuilderService

//   ) { }

//   businessCardId: any
//   productVisible: boolean = false
//   ngOnInit() {
//     this.businessCardId = this.storage.get(common.BUSINESS_CARD)
//     this._getProducts()
//   }

//   // Pagination variables
//   searchTerm: string = '';
//   itemsPerPage: number = 10;
//   totalItems: number = 0;
//   p: number = 1;

//   products: any[] = [];
//   filteredProducts: any[] = [];
//   isLoading: boolean = false;

//   payload: any = {
//     search: '',
//     page: 1,
//     limit: 10
//   }

//   productcategoryVisible: boolean = false;
//   selectedCategory: any = {
//     _id: null,
//     categoryName: '',
//     categoryVisible: true,
//     products: []
//   };

//   selectedProductForCategory: any = null;
//   showCategoryDropdown: boolean = false;


//   selectedCategoryProduct: any = {
//     _id: null,
//     name: '',
//     images: [] as File[],
//     description: '',
//     price: '',
//     visible: true,
//   };



//   onOpenCategoryDropdown() {
//     this.showCategoryDropdown = true;
//     this.cdr.markForCheck();
//   }

//   onSelectProductForCategory(product: any) {
//     this.selectedProductForCategory = product;
//     this.selectedCategory = {
//       _id: null,
//       categoryName: '',
//       categoryVisible: true,
//       products: []
//     };
//     this.showCategoryDropdown = false;
//     this.modal.open('create-category');
//   }

//   onOpenEditCategory(category: any, product: any) {
//     this.selectedCategory = { ...category };
//     this.selectedProductForCategory = product;
//     this.modal.open('create-category');
//   }

//   onCloseCategoryModal() {
//     this.selectedCategory = {
//       _id: null,
//       categoryName: '',
//       categoryVisible: true,
//       products: []
//     };
//     this.selectedProductForCategory = null;
//     this.modal.close('create-category');
//     this.cdr.markForCheck();
//   }

//   // UPDATE AND CREATE CATOGREY OF PRODUCTS
//   async onSaveCategory() {
//     try {
//       const categoryData: any = {
//         productArrayId: this.selectedProductForCategory._id,
//         businessCardId: this.businessCardId,
//         categoryName: this.selectedCategory.categoryName,
//         categoryVisible: this.selectedCategory.categoryVisible,
//       };
//       if (this.selectedCategory._id) {
//         categoryData.categoryId = this.selectedCategory._id; // Add categoryId for update
//       }
//       // console.log('categoryData', categoryData);
//       await this.websiteService.addOrUpdateProductCategory(categoryData);
//       this.modal.close('create-category');
//       this._reset();
//       this._getProducts();
//     } catch (error) {
//       console.error('Error saving category:', error);
//       swalHelper.showToast('Error saving category!', 'error');
//     }
//   }

//   //  DELETE CATOGREY WITH WHOLE CATOGREY PRODUCT
//   async onDeleteCategory(data: { category: any; product: any }) {
//     try {
//       const confirm = await swalHelper.delete();
//       if (confirm.isConfirmed) {
//         await this.websiteService.deleteCategory({
//           productArrayId: data.product._id,
//           categoryId: data.category._id,
//           businessCardId: this.businessCardId,
//         });
//         this._reset();
//         this._getProducts();
//       }
//     } catch (error) {
//       console.error('Error deleting category:', error);
//       swalHelper.showToast('Error deleting category!', 'error');
//     }
//   }


//   // Methods for category products modal
//   onOpenCategoryProductList(category: any, product: any) {
//     this.selectedCategory = { ...category };
//     this.selectedProductForCategory = product;
//     this.modal.open('category-products');
//   }

//   onSelectCategoryProduct(product: any) {
//     this.selectedCategoryProduct = { ...product };
//     this.modal.close('category-products');
//     this.modal.open('create-category-product');
//   }

//   onCloseCategoryProductModal() {
//     this.selectedCategory = {
//       _id: null,
//       categoryName: '',
//       categoryVisible: true,
//       products: [],
//     };
//     this.selectedProductForCategory = null;
//     this.modal.close('category-products');
//     this.cdr.markForCheck();
//   }

//   // Keep existing methods for category product add/update/delete (unchanged from previous response)
//   onOpenAddCategoryProduct(category: any, product: any) {
//     this.selectedCategory = { ...category };
//     this.selectedProductForCategory = product;
//     this.selectedCategoryProduct = {
//       _id: null,
//       name: '',
//       images: [] as File[],
//       description: '',
//       price: '',
//       visible: true,
//     };
//     this.fileInputRef.nativeElement.value = '';
//     this.modal.open('create-category-product');
//   }

//   onCreateCategoryProduct() {
//     this.selectedCategoryProduct.images = this.selectedCategoryProduct.images?.filter((item: any) => {
//       if (typeof item === 'string') {
//         this.selectedCategoryProduct.existingImages = this.selectedCategoryProduct.existingImages || [];
//         this.selectedCategoryProduct.existingImages?.push(item);
//         return false;
//       }
//       return true;
//     });

//     const formdata = new FormData();
//     formdata.append('businessCardId', this.businessCardId);
//     formdata.append('productArrayId', this.selectedProductForCategory._id);
//     formdata.append('categoryId', this.selectedCategory._id);
//     formdata.append('name', this.selectedCategoryProduct.name);
//     formdata.append('price', this.selectedCategoryProduct.price);
//     formdata.append('description', this.selectedCategoryProduct.description);
//     formdata.append('visible', this.selectedCategoryProduct.visible.toString());
//     this.selectedCategoryProduct.images?.forEach((file: File, index: number) => {
//       formdata.append('images', file);
//     });
//     if (this.selectedCategoryProduct._id) {
//       formdata.append('productId', this.selectedCategoryProduct._id); // For update
//     }
//     if (this.selectedCategoryProduct.existingImages) {
//       formdata.append('existingImages', JSON.stringify(this.selectedCategoryProduct.existingImages));
//     }
//     this._createCategoryProduct(formdata);
//     this._getProducts();
//   }

//   async _createCategoryProduct(data: any) {
//     try {
//       await this.websiteService.addOrUpdateProductInCategory(data);
//       this.modal.close('create-category-product');
//       this._resetCategoryProduct();
//       this._getProducts();
//     } catch (error) {
//       console.error('Error creating/updating category product:', error);
//       swalHelper.showToast('Error creating/updating category product!', 'error');
//     }
//   }

//   async deleteCategoryProduct(id: string) {
//     try {
//       const confirm = await swalHelper.delete();
//       if (confirm.isConfirmed) {
//         const payload = {
//           businessCardId: this.businessCardId,
//           productArrayId: this.selectedProductForCategory._id,
//           categoryId: this.selectedCategory._id,
//           productId: id,
//         };
//         await this.websiteService.deleteProductInCategory(payload);
//         this.modal.close('create-category-product');
//         this._resetCategoryProduct();
//         this._getProducts();
//       }
//     } catch (error) {
//       console.error('Error deleting category product:', error);
//       swalHelper.showToast('Error deleting category product!', 'error');
//     }
//   }

//   onCloseCategoryProductModals(modal: string) {
//     this._resetCategoryProduct();
//     this.modal.close(modal);
//   }

//   _resetCategoryProduct() {
//     this.selectedCategoryProduct = {
//       _id: null,
//       name: '',
//       images: [] as File[],
//       description: '',
//       price: '',
//       visible: true,
//     };
//     this.selectedCategory = {
//       _id: null,
//       categoryName: '',
//       categoryVisible: true,
//       products: [],
//     };
//     this.selectedProductForCategory = null;
//     this.fileInputRef.nativeElement.value = '';
//     this.cdr.markForCheck();
//   }

//   onUploadCategoryProductImage(event: any) {
//     const files: FileList = event.target.files;
//     const newFiles: File[] = Array.from(files);

//     if (!this.selectedCategoryProduct.images) {
//       this.selectedCategoryProduct.images = [];
//     }

//     const totalImages = this.selectedCategoryProduct.images?.length + newFiles.length;

//     if (totalImages > 15) {
//       swalHelper.warning('You can upload a maximum of 15 images.');
//       this.selectedCategoryProduct.images = [];
//       this.fileInputRef.nativeElement.value = '';
//       return;
//     }

//     const allowedDimensions = [
//       { width: 1250, height: 720 },
//       { width: 1600, height: 900 },
//     ];

//     let validImages: File[] = [];
//     let processed = 0;

//     for (let file of newFiles) {
//       const reader = new FileReader();
//       reader.onload = (e: any) => {
//         const img = new Image();
//         img.onload = () => {
//           const isValid = allowedDimensions.some(
//             (dim) => img.width === dim.width && img.height === dim.height
//           );

//           if (isValid) {
//             validImages.push(file);
//           } else {
//             swalHelper.warning(`Image "${file.name}" must be 1250x720 or 1600x900.`);
//           }

//           processed++;
//           if (processed === newFiles.length) {
//             this.selectedCategoryProduct.images?.push(...validImages);
//             this.cdr.markForCheck();
//           }
//         };
//         img.src = e.target.result;
//       };
//       reader.readAsDataURL(file);
//     }
//   }

//   removeCategoryProductImage(index: number) {
//     this.selectedCategoryProduct.images.splice(index, 1);
//     if (this.selectedCategoryProduct.images?.length == 0) {
//       this.selectedCategoryProduct.images = [] as File[];
//       this.fileInputRef.nativeElement.value = '';
//     }
//     this.cdr.markForCheck();
//   }



//   // Category-visibility update
//   async _updateCategoryVisibility() {
//     try {
//       await this.websiteService.updateVisibility({
//         productcategoryVisible: this.productcategoryVisible,
//         businessCardId: this.businessCardId
//       });
//       this.cdr.markForCheck();
//     } catch (error) {
//       console.error('Error updating category visibility:', error);
//       swalHelper.showToast('Error updating category visibility!', 'error');
//     }
//   }



//   onPageChange(page: number) {
//     this.p = page;
//     this.cdr.markForCheck();
//   }

//   onItemsPerPageChange() {
//     this.p = 1;
//     this.cdr.markForCheck();
//   }

//   onSearch() {
//     if (!this.searchTerm.trim()) {
//       this.filteredProducts = [...this.products];
//     } else {
//       this.filteredProducts = this.products.filter(product =>
//         product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
//         (product.description && product.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
//       );
//     }
//     this.totalItems = this.filteredProducts.length;
//     this.p = 1; // Reset to first page when searching
//     this.cdr.markForCheck();
//   }

//   onChange() {
//     this.p = 1
//     this.onSearch();
//   }

//   _reset() {
//     this.searchTerm = '';
//     this.p = 1;
//     this.itemsPerPage = 10;

//     this.selectedProducts = {
//       _id: null,
//       name: '',
//       image: [] as File[],
//       description: '',
//       price: '',
//       visible: true
//     };
//     this.fileInputRef.nativeElement.value = '';
//     this._getProducts();
//   }

//   // get all products data
//   async _getProducts() {
//     this.isLoading = true;
//     try {
//       let results = await this.authService.getWebsiteDetails(this.businessCardId);

//       if (results) {
//         this.products = results.products ? [...results.products] : [];
//         this.filteredProducts = [...this.products];
//         this.totalItems = this.products.length;
//         this.productVisible = results.productVisible;
//         this.productcategoryVisible = results.productcategoryVisible;
//         this.cdr.markForCheck();
//       } else {
//         swalHelper.showToast('Failed to fetch products!', 'warning');
//       }
//     } catch (error) {
//       console.error('Error fetching products: ', error);
//       swalHelper.showToast('Error fetching products!', 'error');
//     } finally {
//       this.isLoading = false;
//       this.cdr.markForCheck();
//     }
//   }

//   selectedProducts: any = {
//     _id: null,
//     name: '',
//     images: [] as File[],
//     description: '',
//     price: '',
//     visible: true
//   }
//   imageBaseURL = environment.baseURL + '/';

//   onOpenUpdateModal(item: any) {
//     this.selectedProducts = item;
//     this.modal.open('create-products');
//   }

//   onOpenCraeteModal() {
//     this.selectedProducts = {
//       _id: null,
//       name: '',
//       images: [] as File[],
//       description: '',
//       price: '',
//       visible: true
//     };
//     this.modal.open('create-products');
//   }

//   onCloseModal(modal: string) {
//     this._reset();
//     this.fileInputRef.nativeElement.value = '';
//     this.modal.close(modal)
//   }

//   onUploadImage(event: any) {
//     const files: FileList = event.target.files;
//     const newFiles: File[] = Array.from(files);

//     if (!this.selectedProducts.images) {
//       this.selectedProducts.images = [];
//     }

//     const totalImages = this.selectedProducts.images?.length + newFiles.length;

//     if (totalImages > 15) {
//       swalHelper.warning('You can upload a maximum of 15 images.');
//       this.selectedProducts.images = [];
//       this.fileInputRef.nativeElement.value = '';
//       return;
//     }

//     const allowedDimensions = [
//       { width: 1250, height: 720 },
//       { width: 1600, height: 900 }
//     ];

//     let validImages: File[] = [];
//     let processed = 0;

//     for (let file of newFiles) {
//       const reader = new FileReader();
//       reader.onload = (e: any) => {
//         const img = new Image();
//         img.onload = () => {
//           const isValid = allowedDimensions.some(dim =>
//             img.width === dim.width && img.height === dim.height
//           );

//           if (isValid) {
//             validImages.push(file);
//           } else {
//             swalHelper.warning(`Image "${file.name}" must be 1250x720 or 1600x900.`);
//           }

//           processed++;
//           if (processed === newFiles.length) {
//             this.selectedProducts.images?.push(...validImages);
//           }
//         };
//         img.src = e.target.result;
//       };
//       reader.readAsDataURL(file);
//     }
//   }


//   showImage(image: any) {
//     let windowData: any = window.open(
//       `${this.imageBaseURL}${image}`,
//       'mywindow',
//       'location=1,status=1,scrollbars=1,  width=700,height=700'
//     );
//     windowData.moveTo(0, 0);
//   }

//   getImagePreview(img: any): string {
//     if (img instanceof File) {
//       if (!this.objectURLCache.has(img)) {
//         const url = URL.createObjectURL(img);
//         this.objectURLCache.set(img, url);
//       }
//       return this.objectURLCache.get(img)!;
//     }
//     return this.imageBaseURL + (typeof img === 'string' ? img : img.images);
//   }

//   removeImage(index: number) {
//     this.selectedProducts.images.splice(index, 1);
//     if (this.selectedProducts.images?.length == 0) {
//       this.selectedProducts.images = [] as File[]
//       this.fileInputRef.nativeElement.value = '';
//     }
//   }

//   // created and update product method
//   onCreateProducts() {
//     this.selectedProducts.images = this.selectedProducts.images?.filter((item: any) => {
//       if (typeof item === 'string') {
//         this.selectedProducts.existingImages = this.selectedProducts.existingImages || [];
//         this.selectedProducts.existingImages?.push(item);
//         return false;
//       }
//       return true;
//     });

//     const formdata = new FormData()
//     formdata.append('name', this.selectedProducts.name)
//     formdata.append('price', this.selectedProducts.price)
//     formdata.append('description', this.selectedProducts.description)
//     formdata.append('businessCardId', this.businessCardId)
//     this.selectedProducts.images?.forEach((file: File, index: number) => {
//       formdata.append('images', file);
//     });
//     if (this.selectedProducts._id) {
//       formdata.append('id', this.selectedProducts._id);
//     }
//     formdata.append('visible', this.selectedProducts.visible.toString())
//     if (this.selectedProducts.existingImages) {
//       formdata.append('existingImages', JSON.stringify(this.selectedProducts.existingImages));
//     }
//     this._createProducts(formdata)
//   }

//   // Product create and update
//   _createProducts = async (data: any) => {
//     try {
//       await this.websiteService.createProducts(data)
//       this.modal.close('create-products');
//       this._reset()
//     } catch (error) {
//       console.log('Something went Wrong', error)
//     }
//   }

//   // Product delete 
//   _deleteProducts = async (id: string) => {
//     try {
//       const confirm = await swalHelper.delete();
//       if (confirm.isConfirmed) {
//         await this.websiteService.deleteProducts({ productId: id, businessCardId: this.storage.get(common.BUSINESS_CARD) })
//       }
//       this._reset()
//     } catch (error) {
//       console.log('Something went Wrong', error)
//     }
//   }

//   imageForCarousel: any
//   onOpenImageModal(image: any) {
//     this.imageForCarousel = image
//     this.modal.open('image-carousel');
//   }

//   // Product visibility update
//   _updateVisibility = async () => {
//     await this.websiteService.updateVisibility({ productVisible: this.productVisible, businessCardId: this.businessCardId })
//   }
// }


import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild, OnDestroy } from '@angular/core';
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
export class OurProductsComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInputRef!: ElementRef;
  private objectURLCache = new Map<File, string>();

  constructor(
    private modal: ModalService,
    private zone: NgZone,
    private storage: AppStorage,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private websiteService: WebsiteBuilderService,
    private sanitizer: DomSanitizer
  ) {}

  businessCardId: any;
  productVisible: boolean = false;
  products: any[] = [];
  filteredProducts: any[] = [];
  totalItems: number = 0;
  searchTerm: string = '';
  itemsPerPage: number = 10;
  p: number = 1;
  isLoading: boolean = false;
  imageBaseURL = environment.baseURL + '/';

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

  ngOnInit() {
    this.businessCardId = this.storage.get(common.BUSINESS_CARD);
    this.editor = new Editor();
    this.nameEditor = new Editor();
    this._getProducts();
  }

  ngOnDestroy() {
    this.editor.destroy();
    this.nameEditor.destroy();
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

    const allowedDimensions = [
      { width: 1250, height: 720 },
      { width: 1600, height: 900 }
    ];

    let validImages: File[] = [];
    let processed = 0;

    for (let file of newFiles) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const isValid = allowedDimensions.some(dim =>
            img.width === dim.width && img.height === dim.height
          );

          if (isValid) {
            validImages.push(file);
          } else {
            swalHelper.warning(`Image "${file.name}" must be 1250x720 or 1600x900.`);
          }

          processed++;
          if (processed === newFiles.length) {
            this.selectedProducts.images.push(...validImages);
            this.cdr.markForCheck();
          }
        };
        img.src = e.target.result;
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
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // Helper method to strip HTML tags for search and validation
  stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}