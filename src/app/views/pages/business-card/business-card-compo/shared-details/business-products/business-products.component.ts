import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ModalService } from 'src/app/core/utilities/modal';
import { BusinessCardService } from 'src/app/services/business-card.service';
import { Doc, Payload, Products } from './business-products.interface';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';

@Component({
  selector: 'app-business-products',
  templateUrl: './business-products.component.html',
  styleUrl: './business-products.component.scss'
})
export class BusinessProductsComponent implements OnInit {

  @ViewChild('fileInput') fileInputRef!: ElementRef;
  private objectURLCache = new Map<File, string>();
  constructor(
    private businessCardService: BusinessCardService,
    private modal: ModalService,
    private zone: NgZone,
    private storage:AppStorage,
  ) { }

  businessCardId:any
  ngOnInit() {
    this.businessCardId=this.storage.get(common.BUSINESS_CARD)
    this.payload.businesscardId=this.businessCardId
    this.selectedProducts.businesscardId=this.businessCardId
    this._getServices()
  }

  payload: any = {
    search: '',
    page: 1,
    limit: 10,
    businesscardId:''
  }

  onPageChange(page: number) {
    this.payload.page = page;
    this._getServices()
  }

  _reset() {
    this.payload = {
      search: '',
      page: 1,
      limit: 10,
      businesscardId:this.businessCardId
    },
    this.selectedProducts= {
      _id: null,
      name: '',
      image: [] as File[],
      description: '',
      businesscardId:this.businessCardId
    },
    this.fileInputRef.nativeElement.value = '';
    this._getServices()
  }

  products:any
  isLoading: boolean = false
  _getServices = async () => {
    try {
      this.isLoading = false
      let response = await this.businessCardService.getProducts(this.payload)
      if (response) {
        this.products = response
      }
      this.isLoading = false
    } catch (error) {
      this.isLoading = false
      console.log('Something went Wrong', error)
    }
  }

  selectedProducts: any = {
    _id: null,
    name: '',
    images: [] as File[],
    description: '',
    businesscardId:''
  }
  imageBaseURL = environment.baseURL + '/';

  onOpenUpdateModal(item: any) {
    this.selectedProducts = item;
    this.selectedProducts.businesscardId=this.businessCardId
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
    this.selectedProducts.images?.splice(index, 1);
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
    formdata.append('description', this.selectedProducts.description)
    if(this.selectedProducts.businesscardId){
      formdata.append('businesscardId', this.selectedProducts.businesscardId)
    }
    
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
      await this.businessCardService.createProducts(data)
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
        await this.businessCardService.deleteProducts({businesscardId:this.businessCardId, id: id })
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
