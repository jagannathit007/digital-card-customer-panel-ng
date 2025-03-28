import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { common } from 'src/app/core/constants/common';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { RegularRegex } from 'src/app/core/constants/regular-regex';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './contact-detail.component.html',
  styleUrl: './contact-detail.component.scss',
})
export class ContactDetailComponent implements OnInit {
  isLoading: boolean = false;

  socialLinks: {
    instagram: string;
    facebook: string;
    linkedin: string;
    twitter: string;
  } = {
    instagram: '',
    facebook: '',
    linkedin: '',
    twitter: '',
  };

  p: number = 1;
  totalItems: number = 0;
  searchTerm: string = '';
  itemsPerPage: number = 10;
  

 

  contacts: any[] = [];
  filteredContacts: any[] = [];

  constructor(private storage: AppStorage, public authService: AuthService) {}

  async ngOnInit() {
    await this.fetchContacts();
    console.log("soicallinks", this.filteredContacts);
  }

  async fetchContacts() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      // console.log('business card from contact-details', businessCardId);
      let results = await this.authService.getWebsiteDetails(businessCardId);
      // console.log('website details: ', results);

      if (results) {
        this.socialLinks = {
          instagram: results.socialMedia?.instagram || '',
          facebook: results.socialMedia?.facebook || '',
          linkedin: results.socialMedia?.linkedin || '',
          twitter: results.socialMedia?.twitter || '',
        };

        this.contacts = results.contact ? [...results.contact] : [];
      }

      // console.log('Extracted Social Links: ', this.socialLinks);
      // console.log('Extracted Contacts: ', this.contacts);

      this.filteredContacts = [...this.contacts];
      // console.log(this.filteredContacts);
      this.totalItems = this.contacts.length;
      // console.log(this.totalItems);
    } catch (error) {
      console.error('Error fetching website details: ', error);
    } finally {
      this.isLoading = false;
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



  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredContacts = [...this.contacts];
    } else {
      this.filteredContacts = this.contacts.filter(contact =>
        contact.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  onItemsPerPageChange() {
    this.p = 1;
  }

  pageChangeEvent(event: number) {
    console.log("Page changed to:", event); // Debugging ke liye

    this.p = event;
  }

}
