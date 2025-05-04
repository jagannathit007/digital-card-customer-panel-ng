import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { TooltipComponent } from 'src/app/views/partials/tooltip/tooltip.component';
import { TooltipDirective } from 'src/app/views/partials/tooltip/tooltip.directive';
import { ModalService } from 'src/app/core/utilities/modal';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { BusinessCardService } from 'src/app/services/business-card.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { common } from 'src/app/core/constants/common';
import { WebsiteBuilderService } from 'src/app/services/website-builder.service';
declare var $:any;
@Component({
  selector: 'app-our-products',
  templateUrl: './our-products.component.html',
  styleUrl: './our-products.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OurProductsComponent implements OnInit {
@ViewChild('fileInput') fileInputRef!: ElementRef;
  private objectURLCache = new Map<File, string>();
  constructor(
    private modal: ModalService,
    private zone: NgZone,
    private storage:AppStorage,
    private authService:AuthService,
    private cdr: ChangeDetectorRef,
    private websiteService:WebsiteBuilderService

  ) { }

  businessCardId:any
  productVisible:boolean=false
  ngOnInit() {
    this.businessCardId=this.storage.get(common.BUSINESS_CARD)
    this._getProducts()
  }

  // Pagination variables
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  
  products:any[] = [];
  filteredProducts:any[] = [];
  isLoading: boolean = false;

  payload: any = {
    search: '',
    page: 1,
    limit: 10
  }

  productcategoryVisible: boolean = false;
  selectedCategory: any = {
    _id: null,
    categoryName: '',
    categoryVisible: true,
    products: []
};

selectedProductForCategory: any = null;
showCategoryDropdown: boolean = false;

onOpenCategoryDropdown() {
  this.showCategoryDropdown = true;
  this.cdr.markForCheck();
}

onSelectProductForCategory(product: any) {
  this.selectedProductForCategory = product;
  this.selectedCategory = {
      _id: null,
      categoryName: '',
      categoryVisible: true,
      products: []
  };
  this.showCategoryDropdown = false;
  this.modal.open('create-category');
}

onOpenEditCategory(category: any, product: any) {
  this.selectedCategory = { ...category };
  this.selectedProductForCategory = product;
  this.modal.open('create-category');
}

onCloseCategoryModal() {
  this.selectedCategory = {
      _id: null,
      categoryName: '',
      categoryVisible: true,
      products: []
  };
  this.selectedProductForCategory = null;
  this.modal.close('create-category');
  this.cdr.markForCheck();
}

// UPDATE AND CREATE CATOGREY OF PRODUCTS
async onSaveCategory() {
  try {
    const categoryData: any = {
      productArrayId: this.selectedProductForCategory._id,
      businessCardId: this.businessCardId,
      categoryName: this.selectedCategory.categoryName,
      categoryVisible: this.selectedCategory.categoryVisible,
    };
    if (this.selectedCategory._id) {
      categoryData.categoryId = this.selectedCategory._id; // Add categoryId for update
    }
    console.log('categoryData', categoryData);
    await this.websiteService.addOrUpdateProductCategory(categoryData);
    this.modal.close('create-category');
    this._reset();
    this._getProducts();
  } catch (error) {
    console.error('Error saving category:', error);
    swalHelper.showToast('Error saving category!', 'error');
  }
}

//  DELETE CATOGREY WITH WHOLE CATOGREY PRODUCT
async onDeleteCategory(data: { category: any; product: any }) {
  try {
    const confirm = await swalHelper.delete();
    if (confirm.isConfirmed) {
      await this.websiteService.deleteCategory({
        productArrayId: data.product._id,
        categoryId: data.category._id,
        businessCardId: this.businessCardId,
      });
      this._reset();
      this._getProducts();
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    swalHelper.showToast('Error deleting category!', 'error');
  }
}



onOpenAddProductToCategory(category: any, product: any) {
  this.selectedCategory = { ...category };
  this.selectedProductForCategory = product;
  this.selectedProducts = {
      _id: null,
      name: '',
      images: [] as File[],
      description: '',
      price: '',
      visible: true
  };
  this.modal.open('create-products');
}

onOpenCategoryProductList(category: any, product: any) {
  this.selectedCategory = { ...category };
  this.selectedProductForCategory = product;
  this.modal.open('category-products');
}

onSelectCategoryProduct(product: any) {
  this.selectedProducts = { ...product };
  this.modal.close('category-products');
  this.modal.open('create-products');
}

onCloseCategoryProductModal() {
  this.selectedCategory = {
      _id: null,
      categoryName: '',
      categoryVisible: true,
      products: []
  };
  this.selectedProductForCategory = null;
  this.modal.close('category-products');
  this.cdr.markForCheck();
}

oonCreateProducts() {
  this.selectedProducts.images = this.selectedProducts.images?.filter((item: any) => {
      if (typeof item === 'string') {
          this.selectedProducts.existingImages = this.selectedProducts.existingImages || [];
          this.selectedProducts.existingImages?.push(item);
          return false;
      }
      return true;
  });

  const formdata = new FormData();
  formdata.append('name', this.selectedProducts.name);
  formdata.append('price', this.selectedProducts.price);
  formdata.append('description', this.selectedProducts.description);
  formdata.append('businessCardId', this.businessCardId);
  this.selectedProducts.images?.forEach((file: File, index: number) => {
      formdata.append('images', file);
  });
  if (this.selectedProducts._id) {
      formdata.append('id', this.selectedProducts._id);
  }
  formdata.append('visible', this.selectedProducts.visible.toString());
  if (this.selectedProducts.existingImages) {
      formdata.append('existingImages', JSON.stringify(this.selectedProducts.existingImages));
  }
  if (this.selectedCategory._id) {
      formdata.append('categoryId', this.selectedCategory._id);
      formdata.append('productId', this.selectedProductForCategory._id);
  }
  this._createProducts(formdata);
}

async _ddeleteProducts(id: string) {
  try {
      const confirm = await swalHelper.delete();
      if (confirm.isConfirmed) {
          const payload: any = { productId: id, businessCardId: this.businessCardId };
          if (this.selectedCategory._id) {
              payload.categoryId = this.selectedCategory._id;
              payload.parentProductId = this.selectedProductForCategory._id;
          }
          await this.websiteService.deleteProducts(payload);
          this._reset();
      }
  } catch (error) {
      console.error('Something went Wrong', error);
      swalHelper.showToast('Error deleting product!', 'error');
  }
}


// Category-visibility update
  async _updateCategoryVisibility() {
    try {
        await this.websiteService.updateVisibility({
            productcategoryVisible: this.productcategoryVisible,
            businessCardId: this.businessCardId
        });
        this.cdr.markForCheck();
    } catch (error) {
        console.error('Error updating category visibility:', error);
        swalHelper.showToast('Error updating category visibility!', 'error');
    }
}





  onPageChange(page: number) {
    this.p = page;
    this.cdr.markForCheck();
  }

  onItemsPerPageChange() {
    this.p = 1;
    this.cdr.markForCheck();
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
    this.totalItems = this.filteredProducts.length;
    this.p = 1; // Reset to first page when searching
    this.cdr.markForCheck();
  }

  onChange() {
    this.p = 1
    this.onSearch();
  }

  _reset() {
    this.searchTerm = '';
    this.p = 1;
    this.itemsPerPage = 10;
    
    this.selectedProducts= {
      _id: null,
      name: '',
      image: [] as File[],
      description: '',
      price:'',
      visible: true
    };
    this.fileInputRef.nativeElement.value = '';
    this._getProducts();
  }

  // get all products data
  async _getProducts() {
    this.isLoading = true;
    try {
      let results = await this.authService.getWebsiteDetails(this.businessCardId);
      console.log('results', results)
      
      if (results) {
        this.products = results.products ? [...results.products] : [];
        this.filteredProducts = [...this.products];
        this.totalItems = this.products.length;
        this.productVisible = results.productVisible;
        this.productcategoryVisible = results.productcategoryVisible;
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

  selectedProducts: any = {
    _id: null,
    name: '',
    images: [] as File[],
    description: '',
    price:'',
    visible:true
  }
  imageBaseURL = environment.baseURL + '/';

  onOpenUpdateModal(item: any) {
    this.selectedProducts = item;
    this.modal.open('create-products');
  }

  onOpenCraeteModal() {
    this.selectedProducts = {
      _id: null,
      name: '',
      images: [] as File[],
      description: '',
      price:'',
      visible:true
    };
    this.modal.open('create-products');
  }

  onCloseModal(modal: string) {
    this._reset();
    this.fileInputRef.nativeElement.value = '';
    this.modal.close(modal)
  }

  onUploadImage(event: any) {
    const files: FileList = event.target.files;
    const newFiles: File[] = Array.from(files);
  
    if (!this.selectedProducts.images) {
      this.selectedProducts.images = [];
    }
  
    const totalImages = this.selectedProducts.images?.length + newFiles.length;
  
    if (totalImages > 15) {
      swalHelper.warning('You can upload a maximum of 15 images.');
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
            this.selectedProducts.images?.push(...validImages);
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  

  showImage(image: any) {
    let windowData: any = window.open(
      `${this.imageBaseURL}${image}`,
      'mywindow',
      'location=1,status=1,scrollbars=1,  width=700,height=700'
    );
    windowData.moveTo(0, 0);
  }

  getImagePreview(img: any): string {
    if (img instanceof File) {
      if (!this.objectURLCache.has(img)) {
        const url = URL.createObjectURL(img);
        this.objectURLCache.set(img, url);
      }
      return this.objectURLCache.get(img)!;
    }
    return this.imageBaseURL + (typeof img === 'string' ? img : img.images);
  }

  removeImage(index: number) {
    this.selectedProducts.images.splice(index, 1);
    if (this.selectedProducts.images?.length == 0) {
      this.selectedProducts.images = [] as File[]
      this.fileInputRef.nativeElement.value = '';
    }
  }

// created and update product method
  onCreateProducts() {
    this.selectedProducts.images = this.selectedProducts.images?.filter((item: any) => {
      if (typeof item === 'string') {
        this.selectedProducts.existingImages = this.selectedProducts.existingImages || [];
        this.selectedProducts.existingImages?.push(item);
        return false;
      }
      return true;
    });
    
    const formdata = new FormData()
    formdata.append('name', this.selectedProducts.name)
    formdata.append('price', this.selectedProducts.price)
    formdata.append('description', this.selectedProducts.description)
    formdata.append('businessCardId', this.businessCardId)
    this.selectedProducts.images?.forEach((file: File, index: number) => {
      formdata.append('images', file);
    });
    if(this.selectedProducts._id){
      formdata.append('id', this.selectedProducts._id);
    }
    formdata.append('visible',this.selectedProducts.visible.toString())
    if(this.selectedProducts.existingImages){
      formdata.append('existingImages', JSON.stringify(this.selectedProducts.existingImages));
    }
    this._createProducts(formdata)
  }

  // Product create and update
  _createProducts = async (data: any) => {
    try {
      await this.websiteService.createProducts(data)
      this.modal.close('create-products');
      this._reset()
    } catch (error) {
      console.log('Something went Wrong', error)
    }
  }

// Product delete 
  _deleteProducts = async (id: string) => {
    try {
      const confirm=await swalHelper.delete();
      if(confirm.isConfirmed){
        await this.websiteService.deleteProducts({ productId: id ,businessCardId:this.storage.get(common.BUSINESS_CARD)})
      }
      this._reset()
    } catch (error) {
      console.log('Something went Wrong', error)
    }
  }

  imageForCarousel:any
  onOpenImageModal(image:any){
    this.imageForCarousel=image
    this.modal.open('image-carousel');
  }

  // Product visibility update
  _updateVisibility=async()=>{
    await this.websiteService.updateVisibility({productVisible:this.productVisible,businessCardId:this.businessCardId})
  }
}

