import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { common } from 'src/app/core/constants/common';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { RegularRegex } from 'src/app/core/constants/regular-regex';
import { ModalService } from 'src/app/core/utilities/modal';
import { WebsiteBuilderService } from 'src/app/services/website-builder.service';

@Component({
  selector: 'app-contact-details',
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


  RegularRegex = RegularRegex;
  newContact = {
    email: '',
    phone: '',
    address: ''
  };

  reset() {
    this.newContact = {
      email: '',
      phone: '',
      address: ''
    };
    this.selectedContactId = ""; // Reset selected contact ID
    this.fetchContacts()
  }

  sectionTitles: any = {
    contact: 'contact'
  };


  constructor(private storage: AppStorage, public authService: AuthService, public modal: ModalService, private websiteService: WebsiteBuilderService) { }

  businessCardId: any
  async ngOnInit() {
    this.businessCardId = this.storage.get(common.BUSINESS_CARD)
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
        this.contactVisible = results.contactVisible

        if (results.sectionTitles) {
          this.sectionTitles = results.sectionTitles;
        }

      }
      this.filteredContacts = [...this.contacts];
      this.totalItems = this.contacts.length;

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

    if (!email || !RegularRegex.email.test(email)) {
      swalHelper.showToast("Please enter a valid email address!", "warning");
      return;
    }

    if (!address || address.length < 5) {
      swalHelper.showToast("Address must be at least 5 characters long!", "warning");
      return;
    }

    const newContact = { email, phone, address };

    try {
      let response = await this.authService.AddContactData(businessCardId, newContact);

      if (response) {
        swalHelper.showToast("Contact Added Successfully!", "success");
        await this.fetchContacts();
        this.modal.close('AddContactModal');
        this.reset();
      } else {
        swalHelper.showToast("Failed to add contact!", "warning");
      }
    } catch (err) {
      swalHelper.showToast("Error adding contact!", "error");
      console.error("Error:", err);
    }
  }

  async editContact(contact: any) {
    this.selectedContactId = contact._id;

    // Populate the form with contact data
    this.newContact = {
      email: contact.email,
      phone: contact.phone,
      address: contact.address
    };

    // Open the modal
    this.modal.open('AddContactModal');
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

    if (!updatedContact.email || !RegularRegex.email.test(updatedContact.email)) {
      swalHelper.showToast("Please enter a valid email address!", "warning");
      return;
    }

    if (!updatedContact.address || updatedContact.address.length < 5) {
      swalHelper.showToast("Address must be at least 5 characters long!", "warning");
      return;
    }

    try {
      let response = await this.authService.updateContactData(businessCardId, this.selectedContactId, updatedContact);

      if (response) {
        swalHelper.showToast('Contact Updated Successfully!', 'success');
        this.reset();
        this.modal.close('AddContactModal');
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


  setSelectedContact = async (contact: any) => {
    this.selectedContact = contact;
    const confirm = await swalHelper.delete();
    if (confirm.isConfirmed) {
      this.confirmDelete()
    }
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
        swalHelper.success('Contact Deleted Successfully!');
        await this.fetchContacts();
      } else {
        swalHelper.showToast('Failed to delete contact!', 'warning');
      }
    } catch (err) {
      swalHelper.showToast('Error deleting contact!', 'error');
      console.error(err);
    }

    this.selectedContact = null;

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

  onCloseModal(modal: string) {
    this.modal.close(modal);
    // Reset form when modal is closed
    if (modal === 'AddContactModal') {
      this.reset();
    }
  }

  contactVisible: boolean = false
  _updateVisibility = async () => {
    await this.websiteService.updateVisibility({ contactVisible: this.contactVisible, businessCardId: this.businessCardId })
  }

    // Add this method to handle title edit
  editSectionTitle() {
    this.modal.open('EditTitleModal');
  }

  // Add this method to update section title
  async updateSectionTitle() {
    if (!this.sectionTitles.contact.trim()) {
      swalHelper.showToast('Section title is required!', 'warning');
      return;
    }

    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      const data = {
        businessCardId: businessCardId,
        sectionTitles: {
          contact: this.sectionTitles.contact
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