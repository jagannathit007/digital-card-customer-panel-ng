import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-our-clients',
  templateUrl: './our-clients.component.html',
  styleUrl: './our-clients.component.scss',
})
export class OurClientsComponent implements OnInit {
  baseURL = environment.baseURL;
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;

  clientsList: any[] = [];
  filteredClients: any[] = [];
  clientID: string = '';
  selectedImage: string = '';

  newClient = {
    name: '',
    url: '',
    image: null as File | null,
  };

  editingClient = {
    _id: '',
    name: '',
    url: '',
    image: null as File | null,
    currentImage: ''
  };

  constructor(private storage: AppStorage, public authService: AuthService) {}

  async ngOnInit() {
    await this.fetchWebsiteDetails();
  }

  async fetchWebsiteDetails() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let results = await this.authService.getWebsiteDetails(businessCardId);
      if (results) {
        this.clientsList = results.clients ? [...results.clients] : [];
        this.filteredClients = [...this.clientsList];
        this.totalItems = this.clientsList.length;
      } else {
        swalHelper.showToast('Failed to fetch clients!', 'warning');
      }
    } catch (error) {
      console.error('Error fetching clients: ', error);
      swalHelper.showToast('Error fetching clients!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async addClient() {
    if (!this.validateClient(this.newClient)) {
      return;
    }

    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      const formData = new FormData();
      formData.append('businessCardId', businessCardId);
      formData.append('name', this.newClient.name);
      formData.append('url', this.newClient.url || '');
      if (this.newClient.image) {
        formData.append('file', this.newClient.image);
      }

      const result = await this.authService.addClients(formData);
      if (result) {
        this.clientsList = [result, ...this.clientsList];
        this.filteredClients = [...this.clientsList];
        this.totalItems = this.clientsList.length;
        
        await this.fetchWebsiteDetails();
        this.resetForm();
        
        const modal = document.getElementById('AddClientModal');
        if (modal) {
          (modal as any).querySelector('.btn-close')?.click();
        }
        
        swalHelper.showToast('Client added successfully!', 'success');
      }
    } catch (error) {
      console.error('Error adding client: ', error);
      swalHelper.showToast('Error adding client!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.newClient.image = event.target.files[0];
    }
  }

  onEditFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.editingClient.image = event.target.files[0];
    }
  }

  editClient(client: any) {
    this.editingClient = {
      _id: client._id,
      name: client.name,
      url: client.url || '',
      image: null,
      currentImage: client.image || ''
    };
  }

  async updateClient() {
    if (!this.validateClient(this.editingClient)) {
      return;
    }

    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      const formData = new FormData();
      formData.append('businessCardId', businessCardId);
      formData.append('clientId', this.editingClient._id);
      formData.append('name', this.editingClient.name);
      formData.append('url', this.editingClient.url || '');
      if (this.editingClient.image) {
        formData.append('file', this.editingClient.image);
      }
      
      const result = await this.authService.updateClients(formData);
      if (result) {
        const index = this.clientsList.findIndex(c => c._id === this.editingClient._id);
        if (index !== -1) {
          this.clientsList[index] = result;
          this.filteredClients = [...this.clientsList];
        }
        
        await this.fetchWebsiteDetails();
        
        const modal = document.getElementById('EditClientModal');
        if (modal) {
          (modal as any).querySelector('.btn-close')?.click();
        }
        
        swalHelper.showToast('Client updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating client: ', error);
      swalHelper.showToast('Error updating client!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  prepareDeleteClient(clientID: string) {
    this.clientID = clientID;
  }

  async confirmDeleteClient() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      const data = { 
        businessCardId: businessCardId, 
        clientId: this.clientID 
      };
      
      const result = await this.authService.deleteClients(data);
      
      if (result) {
        this.clientsList = this.clientsList.filter(c => c._id !== this.clientID);
        this.filteredClients = [...this.clientsList];
        this.totalItems = this.clientsList.length;
        
        await this.fetchWebsiteDetails();
        
        const modal = document.getElementById('deleteClientModal');
        if (modal) {
          (modal as any).querySelector('.btn-close')?.click();
        }
        
        swalHelper.showToast('Client deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting client: ', error);
      swalHelper.showToast('Error deleting client!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  validateClient(client: any): boolean {
    if (!client.name.trim()) {
      swalHelper.showToast('Client name is required!', 'warning');
      return false;
    }
    
    return true;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredClients = [...this.clientsList];
    } else {
      this.filteredClients = this.clientsList.filter(client =>
        client.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (client.url && client.url.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
    this.totalItems = this.filteredClients.length;
  }

  onItemsPerPageChange() {
    this.p = 1;
  }

  pageChangeEvent(event: number) {
    this.p = event;
  }

  resetForm() {
    this.newClient = { name: '', url: '', image: null };
  }
}