import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GalleryComponent } from "../all-members/gallery/gallery.component";
import { BasicDetailComponent } from "../all-members/basic-detail/basic-detail.component";
import { BankDetailsComponent } from "../all-members/bank-details/bank-details.component";
import { GeneralSettingsComponent } from "../all-members/general-settings/general-settings.component";
import { ChangeMobilenoComponent } from "../all-members/change-mobileno/change-mobileno.component";
import { SelectCardComponent } from "../all-members/select-card/select-card.component";
import { ServiceComponent } from "../all-members/service/service.component";
import { ViewInquiryComponent } from "../all-members/view-inquiry/view-inquiry.component";

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [
    GalleryComponent,
    BasicDetailComponent,
    BankDetailsComponent,
    GeneralSettingsComponent,
    ChangeMobilenoComponent,
    SelectCardComponent,
    ServiceComponent,
    ViewInquiryComponent,
  
  ],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.scss'
})
export class MemberDetailComponent {

}
