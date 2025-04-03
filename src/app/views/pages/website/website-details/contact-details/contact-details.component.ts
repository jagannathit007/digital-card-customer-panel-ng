import { Component, OnInit, } from '@angular/core';
import { FormsModule, } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { common } from 'src/app/core/constants/common';
import { swalHelper } from 'src/app/core/constants/swal-helper';

@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
  ],
  templateUrl: './contact-details.component.html',
  styleUrl: './contact-details.component.scss',
})
export class ContactDetailsComponent implements OnInit {
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;
  contacts: any[] = [];
  filteredContacts: any[] = [];
  selectedContactId: string = "";
  
  socialLinks = {
    instagram: '',
    facebook: '',
    linkedin: '',
    twitter: ''
  };
  
  newContact = {
    email: '',
    phone: '',
    address: ''
  };
  
  editingContact = {
    _id: '',
    email: '',
    phone: '',
    address: ''
  };

  constructor(private storage: AppStorage, public authService: AuthService) { }

  async ngOnInit() {
    await this.fetchContacts();
  }

  async fetchContacts() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let results = await this.authService.getWebsiteDetails(businessCardId);

      if (results) {
        this.socialLinks = {
          instagram: results.socialMedia?.instagram || '',
          facebook: results.socialMedia?.facebook || '',
          linkedin: results.socialMedia?.linkedin || '',
          twitter: results.socialMedia?.twitter || ''
        };

        this.contacts = results.contact ? [...results.contact] : [];
      }

      this.filteredContacts = [...this.contacts];
      this.totalItems = this.contacts.length;
    } catch (error) {
      console.error("Error fetching website details: ", error);
      swalHelper.showToast('Error fetching contacts!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async saveSocialMediaLinks() {
    this.isLoading = true;
    try {
      let response = await this.authService.updateSocialLink(this.socialLinks);

      if (response) {
        swalHelper.showToast('Social Media Links updated successfully!', 'success');
        await this.fetchContacts();
      } else {
        swalHelper.showToast('Failed to update Social Media Links!', 'warning');
      }
    } catch (error) {
      console.error('Error updating Social Media Links:', error);
      swalHelper.showToast('Something went wrong!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  
  async addContact() {
    this.isLoading = true;
    try {
      const businessCardId = this.storage.get(common.BUSINESS_CARD);
      const contactData = {
        businessCardId: businessCardId,
        ...this.newContact
      };

      const result = await this.authService.addContact(contactData);
      if (result) {
        await this.fetchContacts();
        this.resetContactForm();
        
        const modal = document.getElementById('AddContactModal');
        if (modal) {
          (modal as any).querySelector('.btn-close')?.click();
        }
        
        swalHelper.showToast('Contact added successfully!', 'success');
      }
    } catch (error) {
      console.error('Error adding contact: ', error);
      swalHelper.showToast('Error adding contact!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  editContact(contact: any) {
    this.editingContact = {
      _id: contact._id,
      email: contact.email,
      phone: contact.phone,
      address: contact.address
    };
  }

  async updateContact() {
    this.isLoading = true;
    try {
      const businessCardId = this.storage.get(common.BUSINESS_CARD);
      const contactData = {
        businessCardId: businessCardId,
        contactId: this.editingContact._id,
        email: this.editingContact.email,
        phone: this.editingContact.phone,
        address: this.editingContact.address
      };

      const result = await this.authService.updateContact(contactData);
      if (result) {
        await this.fetchContacts();
        
        const modal = document.getElementById('EditContactModal');
        if (modal) {
          (modal as any).querySelector('.btn-close')?.click();
        }
        
        swalHelper.showToast('Contact updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating contact: ', error);
      swalHelper.showToast('Error updating contact!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  prepareDeleteContact(contactId: string) {
    this.selectedContactId = contactId;
  }

  async confirmDeleteContact() {
    this.isLoading = true;
    try {
      const businessCardId = this.storage.get(common.BUSINESS_CARD);
      const data = {
        businessCardId: businessCardId,
        contactId: this.selectedContactId
      };

      const result = await this.authService.deleteContact(data);
      if (result) {
        await this.fetchContacts();
        
        const modal = document.getElementById('deleteContactModal');
        if (modal) {
          (modal as any).querySelector('.btn-close')?.click();
        }
        
        swalHelper.showToast('Contact deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting contact: ', error);
      swalHelper.showToast('Error deleting contact!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  resetContactForm() {
    this.newContact = {
      email: '',
      phone: '',
      address: ''
    };
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredContacts = [...this.contacts];
    } else {
      this.filteredContacts = this.contacts.filter(contact =>
        contact.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        contact.phone.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        contact.address.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.totalItems = this.filteredContacts.length;
  }

  onItemsPerPageChange() {
    this.p = 1;
  }

  pageChangeEvent(event: number) {
    this.p = event;
  }
}