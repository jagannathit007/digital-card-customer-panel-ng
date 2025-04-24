import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { WebsiteBuilderService } from 'src/app/services/website-builder.service';
import { ModalService } from 'src/app/core/utilities/modal';

@Component({
  selector: 'app-about-section',
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss',
})
export class AboutSectionComponent implements OnInit {
 
  isLoading: boolean = false;
  aboutCompanyList: any

  constructor(
    private storage: AppStorage, 
    public authService: AuthService,
    private websiteService:WebsiteBuilderService,
    public modal:ModalService
  ) {}

  businessCardId:any
  ngOnInit() {
    this.businessCardId=this.storage.get(common.BUSINESS_CARD)
    this.fetchWebsiteDetails();
  }

  async fetchWebsiteDetails() {
    this.isLoading = true; 
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let results = await this.authService.getWebsiteDetails(businessCardId);

      if (results && results.aboutCompany) {
        this.aboutCompanyList = results.aboutCompany
        this.aboutCompanyVisible=results.aboutCompany.visible
      }
    } catch (error) {
      console.error('Error fetching company information: ', error);
      swalHelper.showToast('Error fetching company information!', 'error');
    } finally {
      this.isLoading = false; 
    }
  }

  aboutCompanyVisible:boolean=false
_updateVisibility=async()=>{
  await this.websiteService.updateVisibility({'aboutCompany.visible':this.aboutCompanyVisible,businessCardId:this.businessCardId})
}

payload={
  businessCardId:'',
  addAboutData:[{title:'',description:'',visible:true}]
}
onOpenaddAboutDetails(){
  this.payload.businessCardId=this.businessCardId
  this.modal.open('add-about')
}

onAddAboutData(){
  this.payload.addAboutData.push({title:'',description:'',visible:true})
}

onDelete(index: number) {
  this.payload.addAboutData.splice(index, 1);
}

reset(){
  addAboutData:[{title:'',description:''}]
  this.fetchWebsiteDetails();
}

_saveAboutData=async()=>{
  await this.websiteService.updateAboutSectionData(this.payload.addAboutData)
  this.reset()
}

}
