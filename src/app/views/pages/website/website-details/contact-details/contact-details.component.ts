import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
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
  // @ViewChild('AddContactModal', { static: false }) modalRef!: ElementRef;
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;
  contacts: any[] = [];
  filteredContacts: any[] = [];
  socialLinks = {
    instagram: '',
    facebook: '',
    linkedin: '',
    twitter: ''
  };
  contactForm: any[] = [];
  selectedContactId: string = "";
  selectedContact: any = null;


  constructor(private storage: AppStorage, public authService: AuthService) { }

  async ngOnInit() {
    await this.fetchContacts();
  }

  async fetchContacts() {
    this.isLoading = true;
    try {

      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      // console.log("business card from contact-details", businessCardId);
      let results = await this.authService.getWebsiteDetails(businessCardId);
      // console.log("website details: ", results);

      if (results) {
        this.socialLinks = {
          instagram: results.socialMedia?.instagram || '',
          facebook: results.socialMedia?.facebook || '',
          linkedin: results.socialMedia?.linkedin || '',
          twitter: results.socialMedia?.twitter || ''
        };

        this.contacts = results.contact ? [...results.contact] : [];
      }

      console.log("Extracted Social Links: ", this.socialLinks);
      console.log("Extracted Contacts: ", this.contacts);

      this.filteredContacts = [...this.contacts];
      // console.log(this.filteredContacts);
      this.totalItems = this.contacts.length;
      // console.log(this.totalItems);

    } catch (error) {
      console.error("Error fetching website details: ", error);
    } finally {
      this.isLoading = false;
    }
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredContacts = [...this.contacts];
    } else {
      this.filteredContacts = this.contacts.filter(contact =>
        contact.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  async saveSocialMediaLinks() {
    const businessCardId = this.storage.get(common.BUSINESS_CARD);

    if (!businessCardId) {
      console.error("Business Card ID not found!");
      swalHelper.showToast("Business Card ID is missing!", "error");
      return;
    }

    try {
      let response = await this.authService.updateSocialLink(businessCardId, this.socialLinks);

      if (response) {
        swalHelper.showToast("Social Media Links Updated Successfully!", "success");
        console.log("Updated Social Media Links: ", response);
      } else {
        swalHelper.showToast("Failed to update social media links!", "warning");
      }
    } catch (err) {
      swalHelper.showToast("Error updating social media links!", "error");
      console.error("Error:", err);
    }
  }

  async addContact() {
    const businessCardId = this.storage.get(common.BUSINESS_CARD);

    if (!businessCardId) {
      console.error("Business Card ID not found!");
      swalHelper.showToast("Business Card ID is missing!", "error");
      return;
    }

    let email = (document.getElementById('contactEmail') as HTMLInputElement).value.trim();
    let phone = (document.getElementById('contactPhone') as HTMLInputElement).value.trim();
    let address = (document.getElementById('contactAddress') as HTMLTextAreaElement).value.trim();

    if (!email || !phone || !address) {
      swalHelper.showToast("Please fill all fields!", "warning");
      return;
    }

    const newContact = { email, phone, address };

    try {
      let response = await this.authService.AddContactData(businessCardId, newContact);

      if (response) {
        swalHelper.showToast("Contact Added Successfully!", "success");
        console.log("Added Contact:", response);

        await this.fetchContacts();


        const closeButton = document.querySelector('#AddContactModal .btn-close');
        if (closeButton) {
          (closeButton as HTMLButtonElement).click();
          (document.getElementById('contactEmail') as HTMLInputElement).value = '';
          (document.getElementById('contactPhone') as HTMLInputElement).value = '';
          (document.getElementById('contactAddress') as HTMLTextAreaElement).value = '';
        }

      } else {
        swalHelper.showToast("Failed to add contact!", "warning");
      }
    } catch (err) {
      swalHelper.showToast("Error adding contact!", "error");
      console.error("Error:", err);
    }
  }

  async editContact(contact: any) {
    console.log("Edit contact: ", contact);

    // // Populate form with existing contact data
    // this.contactForm.setValue({
    //   contactEmail: contact.email || '',
    //   contactPhone: contact.phone || '',
    //   contactAddress: contact.address || ''
    // });

    // Store the selected contact ID
    this.selectedContactId = contact._id;
    console.log(this.selectedContactId);
  }

  async updateContact() {
    if (!this.selectedContactId) {
      swalHelper.showToast('No contact selected for update!', 'warning');
      return;
    }

    const businessCardId = this.storage.get(common.BUSINESS_CARD);

    if (!businessCardId) {
      swalHelper.showToast('Business Card ID is missing!', 'error');
      return;
    }

    let updatedContact = {
      email: (document.getElementById('contactEmail') as HTMLInputElement).value.trim(),
      phone: (document.getElementById('contactPhone') as HTMLInputElement).value.trim(),
      address: (document.getElementById('contactAddress') as HTMLTextAreaElement).value.trim()
    };

    try {
      let response = await this.authService.updateContactData(businessCardId, this.selectedContactId, updatedContact);

      if (response) {
        swalHelper.showToast('Contact Updated Successfully!', 'success');
        await this.fetchContacts();

        // Close modal and reset form
        const closeButton = document.querySelector('#AddContactModal .btn-close');
        if (closeButton) {
          (closeButton as HTMLButtonElement).click();
        }
        // this.contactForm.reset();
        this.selectedContactId = "";
      } else {
        swalHelper.showToast('Failed to update contact!', 'warning');
      }
    } catch (err) {
      swalHelper.showToast('Error updating contact!', 'error');
      console.error(err);
    }
  }


  setSelectedContact(contact: any) {
    this.selectedContact = contact;
  }
  
  async confirmDelete() {
    if (!this.selectedContact) return;
  
    const businessCardId = this.storage.get(common.BUSINESS_CARD);
    const contactId = this.selectedContact._id;
  
    if (!businessCardId) {
      swalHelper.showToast('Business Card ID is missing!', 'error');
      return;
    }
  
    try {
      let response = await this.authService.deleteContactData(businessCardId, contactId);
  
      if (response) {
        swalHelper.showToast('Contact Deleted Successfully!', 'success');
        await this.fetchContacts();
      } else {
        swalHelper.showToast('Failed to delete contact!', 'warning');
      }
    } catch (err) {
      swalHelper.showToast('Error deleting contact!', 'error');
      console.error(err);
    }
  
    // Reset selected contact
  this.selectedContact = null;

  // Close modal
  let modalElement = document.getElementById('deleteContactModal');
  if (modalElement) {
    (modalElement as any).classList.remove('show');
    (modalElement as any).setAttribute('aria-hidden', 'true');
    (modalElement as any).setAttribute('style', 'display: none;');

    let backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }

  }



  onItemsPerPageChange() {
    this.p = 1;
  }

  pageChangeEvent(event: number) {
    this.p = event;
  }
}
