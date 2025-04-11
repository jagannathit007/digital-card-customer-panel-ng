import {  Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-our-services',
  templateUrl: './our-services.component.html',
  styleUrl: './our-services.component.scss',
})
export class OurServicesComponent implements OnInit {
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

  newService = {
    title: '',
    description: '',
    image: null as File | null,
  };

  editingService = {
    _id: '',
    title: '',
    description: '',
    image: null as File | null,
    currentImage: ''
  };

  constructor(
    private storage: AppStorage, 
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.fetchWebsiteDetails();
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

      const result = await this.authService.addServices(formData);
      if (result) {
        this.services = [result, ...this.services];
        this.filteredServices = [...this.services];
        this.totalItems = this.services.length;
        
        await this.fetchWebsiteDetails();
        this.resetForm();
        
        const modal = document.getElementById('AddServiceModal');
        if (modal) {
          (modal as any).querySelector('.btn-close')?.click();
        }
        
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
      currentImage: service.image || ''
    };
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
      
      const result = await this.authService.updateServices(formData);
      if (result) {
        const index = this.services.findIndex(s => s._id === this.editingService._id);
        if (index !== -1) {
          this.services[index] = result;
          this.filteredServices = [...this.services];
        }
        
        await this.fetchWebsiteDetails();
        
        const modal = document.getElementById('EditServiceModal');
        if (modal) {
          (modal as any).querySelector('.btn-close')?.click();
        }
        
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

  prepareDeleteService(serviceID: string) {
    this.serviceID = serviceID;
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
        
        const modal = document.getElementById('deleteServiceModal');
        if (modal) {
          (modal as any).querySelector('.btn-close')?.click();
        }
        
        swalHelper.showToast('Service deleted successfully!', 'success');
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
    this.newService = { title: '', description: '', image: null };
    this.cdr.markForCheck();
  }
}