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
  ngOnInit() {
    this.businessCardId=this.storage.get(common.BUSINESS_CARD)
    this._getProducts()
  }

  payload: any = {
    search: '',
    page: 1,
    limit: 10
  }

  onPageChange(page: number) {
    this.payload.page = page;
    this._getProducts()
  }

  onChange() {
    this.payload.page = 1
    this._getProducts();
  }

  _reset() {
    this.payload = {
      search: '',
      page: 1,
      limit: 10
    },
    this.selectedProducts= {
      _id: null,
      name: '',
      image: [] as File[],
      description: '',
      price:''
    },
    this.fileInputRef.nativeElement.value = '';
    this._getProducts()
  }

  products:any
  isLoading: boolean = false
  async _getProducts() {
      this.isLoading = true;
      try {
        let results = await this.authService.getWebsiteDetails(this.businessCardId);
        
        if (results) {
          this.products = results.products ? [...results.products] : [];
          this.products = [...this.products];
          this.cdr.markForCheck();
        } else {
          swalHelper.showToast('Failed to fetch team members!', 'warning');
        }
      } catch (error) {
        console.error('Error fetching team members: ', error);
        swalHelper.showToast('Error fetching team members!', 'error');
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
    price:''
  }
  imageBaseURL = environment.baseURL + '/';

  onOpenUpdateModal(item: any) {
    this.selectedProducts = item;
    this.modal.open('create-products');
  }

  onOpenCraeteModal() {
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
    if(this.selectedProducts.existingImages){
      formdata.append('existingImages', JSON.stringify(this.selectedProducts.existingImages));
    }
    this._createProducts(formdata)
  }

  _createProducts = async (data: any) => {
    try {
      await this.websiteService.createProducts(data)
      this.modal.close('create-products');
      this._reset()
    } catch (error) {
      console.log('Something went Wrong', error)
    }
  }


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

}
