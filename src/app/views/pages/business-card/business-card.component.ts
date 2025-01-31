import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PersonalDetailsComponent } from './shared-details/personal-details/personal-details.component';
import { DocumentDetailsComponent } from './shared-details/document-details/document-details.component';
import { BusinessDetailsComponent } from "./shared-details/business-details/business-details.component";
import { AuthService } from 'src/app/services/auth.service';
import { AsyncPipe } from '@angular/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-business-card',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    PersonalDetailsComponent,
    BusinessDetailsComponent,
    DocumentDetailsComponent,
    BusinessDetailsComponent
],
  templateUrl: './business-card.component.html',
  styleUrl: './business-card.component.scss',
})
export class BusinessCardComponent {

  constructor(public authService: AuthService, private storage: AppStorage){
    this.authService.selectedBusinessCard = this.storage.get(common.BUSINESS_CARD) ?? "";
  }

  onBusinessChange(){
    this.storage.set(common.BUSINESS_CARD, this.authService.selectedBusinessCard);
  }

  selectedTab = {
    title: "Personal Details",
    href: "personal-details"
  };

  tabs = [
    {
      title: "Personal Details",
      href: "personal-details"
    },
    {
      title: "Business Details",
      href: "business-details"
    },
    {
      title: "Document Details",
      href: "document-details"
    }
  ]

}
