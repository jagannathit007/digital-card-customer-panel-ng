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
  selector: 'app-products-enquiry',
  templateUrl: './products-enquiry.component.html',
  styleUrls: ['./products-enquiry.component.scss'],

})
export class ProductsEnquiryComponent implements OnInit {
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;
  orders: any[] = [];
  filteredOrders: any[] = [];
  selectedOrderId: string = '';
  selectedOrder: any = null;

  constructor(private storage: AppStorage, private authService: AuthService, public modal: ModalService,private webService:WebsiteBuilderService) {}

  businessCardId:string=''
  ngOnInit() {
    this.businessCardId=this.storage.get(common.BUSINESS_CARD);
    this._fetchOrders();
  }

  async _fetchOrders() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let results = await this.authService.getWebsiteDetails(businessCardId); 
      if (results) {
        this.orders = results.orders ? [...results.orders] : []; 
      }
      this.filteredOrders = [...this.orders];
      this.totalItems = this.orders.length;
    } catch (error) {
      console.error("Error fetching orders: ", error);
    } finally {
      this.isLoading = false;
    }
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(order =>
        order.customer.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }


  onItemsPerPageChange() {
    this.p = 1;
  }

  pageChangeEvent(event: number) {
    this.p = event;
  }

  _deleteEnquiry=async(id:any)=>{
    const confirm=await swalHelper.delete();
      if(confirm.isConfirmed){
       let result= await this.webService.deleteProductEnquiry({businessCardId:this.businessCardId, _id: id })
       if(result){
        swalHelper.success('Enquiry deleted');
       }
       this._fetchOrders();
      }
  }
}