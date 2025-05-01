import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { ModalService } from 'src/app/core/utilities/modal';
import { WebsiteBuilderService } from 'src/app/services/website-builder.service';

@Component({
  selector: 'app-getin-touch-enquiry',
  templateUrl: './getin-touch-enquiry.component.html',
  styleUrls: ['./getin-touch-enquiry.component.scss'],

})
export class GetinTouchEnquiryComponent implements OnInit {
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;
  getIntouchContact: any[] = [];
  filteredgetIntouchContact: any[] = [];
  selectedOrderId: string = '';
  selectedOrder: any = null;

  constructor(private storage: AppStorage, public authService: AuthService, public modal: ModalService,private websiteService:WebsiteBuilderService) {}
businessCardId:any
  async ngOnInit() {
    this.businessCardId=this.storage.get(common.BUSINESS_CARD)
    await this._fetchgetIntouchContact();

  }

  async _fetchgetIntouchContact() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let results = await this.authService.getWebsiteDetails(businessCardId); 
      if (results) {
        this.getIntouchContact = results.contactSubmissions ? [...results.contactSubmissions
        ] : []; 
      }
      this.filteredgetIntouchContact = [...this.getIntouchContact];
      this.totalItems = this.getIntouchContact.length;
    } catch (error) {
      console.error("Error fetching getIntouchContact: ", error);
    } finally {
      this.isLoading = false;
    }
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredgetIntouchContact = [...this.getIntouchContact];
    } else {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.filteredgetIntouchContact = this.getIntouchContact.filter(contact =>
        contact.email?.toLowerCase().includes(searchTermLower) ||
        contact.name?.toLowerCase().includes(searchTermLower) ||
        contact.message?.toLowerCase().includes(searchTermLower)
      );
    }
    this.totalItems = this.filteredgetIntouchContact.length;
    this.p = 1; 
  }


  onItemsPerPageChange() {
    this.p = 1;
  }

  pageChangeEvent(event: number) {
    this.p = event;
  }

  _deleteEnquiry=async(data:any)=>{
    
    const confirm=await swalHelper.delete();
      if(confirm.isConfirmed){
       let result= await this.websiteService.deleteContactEnquiry({businessCardId:this.businessCardId, _id: data._id })
       if(result){
        swalHelper.success('Enquiry deleted');
       }
       this._fetchgetIntouchContact();
      }
  }
}
