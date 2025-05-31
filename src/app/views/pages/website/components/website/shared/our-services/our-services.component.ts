// import {  Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { NgxPaginationModule } from 'ngx-pagination';
// import { common } from 'src/app/core/constants/common';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { AuthService } from 'src/app/services/auth.service';
// import { swalHelper } from 'src/app/core/constants/swal-helper';
// import { environment } from 'src/env/env.local';
// import { ModalService } from 'src/app/core/utilities/modal';
// import { WebsiteBuilderService } from 'src/app/services/website-builder.service';

// @Component({
//   selector: 'app-our-services',
//   templateUrl: './our-services.component.html',
//   styleUrl: './our-services.component.scss',
// })
// export class OurServicesComponent implements OnInit {
//   baseURL = environment.baseURL;
//   searchTerm: string = '';
//   itemsPerPage: number = 10;
//   totalItems: number = 0;
//   p: number = 1;
//   isLoading: boolean = false;

//   services: any[] = [];
//   filteredServices: any[] = [];
//   serviceID: string = '';
//   selectedImage: string = '';

//   newService:any = {
//     title: '',
//     description: '',
//     image: null as File | null,
//     visible:true
//   };

//   editingService = {
//     _id: '',
//     title: '',
//     description: '',
//     image: null as File | null,
//     currentImage: '',
//     visible:true
//   };

//   constructor(
//     private storage: AppStorage, 
//     public authService: AuthService,
//     private cdr: ChangeDetectorRef,
//     public modal:ModalService,
//     private websiteService:WebsiteBuilderService
//   ) {}

//   businessCardId:any
//   async ngOnInit() {
//     this.businessCardId=this.storage.get(common.BUSINESS_CARD)
//     await this.fetchWebsiteDetails();
//   }

//   async fetchWebsiteDetails() {
//     this.isLoading = true;
//     try {
//       let businessCardId = this.storage.get(common.BUSINESS_CARD);
//       let results = await this.authService.getWebsiteDetails(businessCardId);
      
//       if (results) {
//         this.services = results.services ? [...results.services] : [];
//         this.filteredServices = [...this.services];
//         this.totalItems = this.services.length;
//         this.serviceVisible=results.serviceVisible
//         this.cdr.markForCheck();
//       } else {
//         swalHelper.showToast('Failed to fetch services!', 'warning');
//       }
//     } catch (error) {
//       console.error('Error fetching services: ', error);
//       swalHelper.showToast('Error fetching services!', 'error');
//     } finally {
//       this.isLoading = false;
//       this.cdr.markForCheck();
//     }
//   }

//   async addService() {
//     if (!this.validateService(this.newService)) {
//       return;
//     }

//     this.isLoading = true;
//     try {
//       let businessCardId = this.storage.get(common.BUSINESS_CARD);
//       const formData = new FormData();
//       formData.append('businessCardId', businessCardId);
//       formData.append('title', this.newService.title);
//       formData.append('description', this.newService.description || '');
//       if (this.newService.image) {
//         formData.append('file', this.newService.image);
//       }
//       formData.append('visible',this.newService.visible.toString())
//       const result = await this.authService.addServices(formData);
//       if (result) {
//         this.services = [result, ...this.services];
//         this.filteredServices = [...this.services];
//         this.totalItems = this.services.length;
        
//         await this.fetchWebsiteDetails();
//         this.resetForm();
//         this.modal.close('AddServiceModal')
//         swalHelper.showToast('Service added successfully!', 'success');
//       }
//     } catch (error) {
//       console.error('Error adding service: ', error);
//       swalHelper.showToast('Error adding service!', 'error');
//     } finally {
//       this.isLoading = false;
//       this.cdr.markForCheck();
//     }
//   }

//   onFileChange(event: any) {
//     if (event.target.files && event.target.files.length > 0) {
//       this.newService.image = event.target.files[0];
//     }
//   }

//   onEditFileChange(event: any) {
//     if (event.target.files && event.target.files.length > 0) {
//       this.editingService.image = event.target.files[0];
//     }
//   }

//   editService(service: any) {
//     this.editingService = {
//       _id: service._id,
//       title: service.title,
//       description: service.description || '',
//       image: null,
//       currentImage: service.image || '',
//       visible:service.visible
//     };
//     this.modal.open('EditServiceModal');
//     this.cdr.markForCheck();
//   }

//   async updateService() {
//     if (!this.validateService(this.editingService)) {
//       return;
//     }

//     this.isLoading = true;
//     try {
//       let businessCardId = this.storage.get(common.BUSINESS_CARD);
//       const formData = new FormData();
//       formData.append('businessCardId', businessCardId);
//       formData.append('serviceId', this.editingService._id);
//       formData.append('title', this.editingService.title);
//       formData.append('description', this.editingService.description || '');
//       if (this.editingService.image) {
//         formData.append('file', this.editingService.image);
//       }
//       formData.append('visible',this.editingService.visible.toString())
//       const result = await this.authService.updateServices(formData);
//       if (result) {
//         const index = this.services.findIndex(s => s._id === this.editingService._id);
//         if (index !== -1) {
//           this.services[index] = result;
//           this.filteredServices = [...this.services];
//         }
        
//         await this.fetchWebsiteDetails();
//         this.modal.close('EditServiceModal');
//         swalHelper.showToast('Service updated successfully!', 'success');
//       }
//     } catch (error) {
//       console.error('Error updating service: ', error);
//       swalHelper.showToast('Error updating service!', 'error');
//     } finally {
//       this.isLoading = false;
//       this.cdr.markForCheck();
//     }
//   }

//   prepareDeleteService=async(serviceID: string)=>{
//     this.serviceID = serviceID;
//     const confirm=await swalHelper.delete();
//       if(confirm.isConfirmed){
//         this.confirmDeleteService();
//       }
//     this.cdr.markForCheck();
//   }

//   async confirmDeleteService() {
//     this.isLoading = true;
//     try {
//       let businessCardId = this.storage.get(common.BUSINESS_CARD);
//       const data = { 
//         businessCardId: businessCardId, 
//         serviceId: this.serviceID 
//       };
      
//       const result = await this.authService.deleteServices(data);
      
//       if (result) {
//         this.services = this.services.filter(s => s._id !== this.serviceID);
//         this.filteredServices = [...this.services];
//         this.totalItems = this.services.length;
        
//         await this.fetchWebsiteDetails();
//         swalHelper.success('Service deleted successfully!');
//       }
//     } catch (error) {
//       console.error('Error deleting service: ', error);
//       swalHelper.showToast('Error deleting service!', 'error');
//     } finally {
//       this.isLoading = false;
//       this.cdr.markForCheck();
//     }
//   }

//   validateService(service: any): boolean {
//     if (!service.title.trim()) {
//       swalHelper.showToast('Service title is required!', 'warning');
//       return false;
//     }
//     if (!service.description.trim()) {
//       swalHelper.showToast('Service description is required!', 'warning');
//       return false;
//     }
    
//     return true;
//   }

//   onSearch() {
//     if (!this.searchTerm.trim()) {
//       this.filteredServices = [...this.services];
//     } else {
//       this.filteredServices = this.services.filter(service =>
//         service.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
//         (service.description && service.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
//       );
//     }
//     this.totalItems = this.filteredServices.length;
//     this.cdr.markForCheck();
//   }

//   onItemsPerPageChange() {
//     this.p = 1;
//     this.cdr.markForCheck();
//   }

//   pageChangeEvent(event: number) {
//     this.p = event;
//     this.cdr.markForCheck();
//   }

//   resetForm() {
//     this.newService = { title: '', description: '', image: null };
//     this.cdr.markForCheck();
//   }

//   onCloseModal(modal:string){
//     this.modal.close(modal);
//   }

//   serviceVisible:boolean=false
//   _updateVisibility=async()=>{
//     await this.websiteService.updateVisibility({serviceVisible:this.serviceVisible,businessCardId:this.businessCardId})
//   }
// }



import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { Editor, Toolbar } from 'ngx-editor';
import { NgxEditorModule } from 'ngx-editor';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';
import { WebsiteBuilderService } from 'src/app/services/website-builder.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Component({
  selector: 'app-our-services',
  templateUrl: './our-services.component.html',
  styleUrl: './our-services.component.scss',
})
export class OurServicesComponent implements OnInit, OnDestroy {
  baseURL = environment.baseURL;
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;

  services: any[] = [];
  filteredServices: any[] = [];
  serviceID: string = '';
  selectedImage: string = '';

  // ngx-editor instances
  addEditor!: Editor;
  editEditor!: Editor;
  addTitleEditor!: Editor;
  editTitleEditor!: Editor;
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

  newService: any = {
    title: '',
    description: '',
    image: null as File | null,
    visible: true
  };

  editingService = {
    _id: '',
    title: '',
    description: '',
    image: null as File | null,
    currentImage: '',
    visible: true
  };

  constructor(
    private storage: AppStorage,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    public modal: ModalService,
    private websiteService: WebsiteBuilderService,
    private sanitizer: DomSanitizer,

  ) {}

  businessCardId: any

  async ngOnInit() {
    // Initialize editors
    this.addEditor = new Editor();
    this.editEditor = new Editor();
    this.addTitleEditor = new Editor();
    this.editTitleEditor = new Editor();

    this.businessCardId = this.storage.get(common.BUSINESS_CARD);
    await this.fetchWebsiteDetails();
  }

  ngOnDestroy(): void {
    // Destroy editors to prevent memory leaks
    this.addEditor.destroy();
    this.editEditor.destroy();
    this.addTitleEditor.destroy();
    this.editTitleEditor.destroy();
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
}

  async fetchWebsiteDetails() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let results = await this.authService.getWebsiteDetails(businessCardId);

      if (results) {
        this.services = results.services ? [...results.services] : [];
        this.filteredServices = [...this.services];
        this.totalItems = this.services.length;
        this.serviceVisible = results.serviceVisible;
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

  async addService() {
    if (!this.validateService(this.newService)) {
      return;
    }

    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      const formData = new FormData();
      formData.append('businessCardId', businessCardId);
      formData.append('title', this.newService.title);
      formData.append('description', this.newService.description || '');
      if (this.newService.image) {
        formData.append('file', this.newService.image);
      }
      formData.append('visible', this.newService.visible.toString());
      
      const result = await this.authService.addServices(formData);
      if (result) {
        this.services = [result, ...this.services];
        this.filteredServices = [...this.services];
        this.totalItems = this.services.length;

        await this.fetchWebsiteDetails();
        this.resetForm();
        this.modal.close('AddServiceModal');
        swalHelper.showToast('Service added successfully!', 'success');
      }
    } catch (error) {
      console.error('Error adding service: ', error);
      swalHelper.showToast('Error adding service!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.newService.image = event.target.files[0];
    }
  }

  onEditFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.editingService.image = event.target.files[0];
    }
  }

  editService(service: any) {
    this.editingService = {
      _id: service._id,
      title: service.title,
      description: service.description || '',
      image: null,
      currentImage: service.image || '',
      visible: service.visible
    };
    this.modal.open('EditServiceModal');
    this.cdr.markForCheck();
  }

  async updateService() {
    if (!this.validateService(this.editingService)) {
      return;
    }

    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      const formData = new FormData();
      formData.append('businessCardId', businessCardId);
      formData.append('serviceId', this.editingService._id);
      formData.append('title', this.editingService.title);
      formData.append('description', this.editingService.description || '');
      if (this.editingService.image) {
        formData.append('file', this.editingService.image);
      }
      formData.append('visible', this.editingService.visible.toString());
      
      const result = await this.authService.updateServices(formData);
      if (result) {
        const index = this.services.findIndex(s => s._id === this.editingService._id);
        if (index !== -1) {
          this.services[index] = result;
          this.filteredServices = [...this.services];
        }

        await this.fetchWebsiteDetails();
        this.modal.close('EditServiceModal');
        swalHelper.showToast('Service updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating service: ', error);
      swalHelper.showToast('Error updating service!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  prepareDeleteService = async (serviceID: string) => {
    this.serviceID = serviceID;
    const confirm = await swalHelper.delete();
    if (confirm.isConfirmed) {
      this.confirmDeleteService();
    }
    this.cdr.markForCheck();
  }

  async confirmDeleteService() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      const data = {
        businessCardId: businessCardId,
        serviceId: this.serviceID
      };

      const result = await this.authService.deleteServices(data);

      if (result) {
        this.services = this.services.filter(s => s._id !== this.serviceID);
        this.filteredServices = [...this.services];
        this.totalItems = this.services.length;

        await this.fetchWebsiteDetails();
        swalHelper.success('Service deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting service: ', error);
      swalHelper.showToast('Error deleting service!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  validateService(service: any): boolean {
    if (!service.title.trim()) {
      swalHelper.showToast('Service title is required!', 'warning');
      return false;
    }
    if (!service.description.trim()) {
      swalHelper.showToast('Service description is required!', 'warning');
      return false;
    }

    return true;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredServices = [...this.services];
    } else {
      this.filteredServices = this.services.filter(service =>
        service.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
    this.totalItems = this.filteredServices.length;
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
    this.newService = { title: '', description: '', image: null, visible: true };
    this.cdr.markForCheck();
  }

  onCloseModal(modal: string) {
    this.modal.close(modal);
  }

  serviceVisible: boolean = false;
  
  _updateVisibility = async () => {
    await this.websiteService.updateVisibility({ 
      serviceVisible: this.serviceVisible, 
      businessCardId: this.businessCardId 
    });
  }

  // Helper method to strip HTML tags for display in table
  stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}