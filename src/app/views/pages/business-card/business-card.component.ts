import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PersonalDetailsComponent } from './shared-details/personal-details/personal-details.component';
import { DocumentDetailsComponent } from './shared-details/document-details/document-details.component';
import { BusinessDetailsComponent } from "./shared-details/business-details/business-details.component";
import { GalleryDetailsComponent } from "./shared-details/gallery-details/gallery-details.component";
import { AuthService } from 'src/app/services/auth.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-business-card',
  standalone: true,
  imports: [
    FormsModule,
    PersonalDetailsComponent,
    BusinessDetailsComponent,
    DocumentDetailsComponent,
    GalleryDetailsComponent,
    BusinessDetailsComponent
],
  templateUrl: './business-card.component.html',
  styleUrl: './business-card.component.scss',
})
export class BusinessCardComponent {

  constructor(public authService: AuthService, private storage: AppStorage){
    this.authService.selectedBusinessCard = this.storage.get(common.BUSINESS_CARD) ?? "";
    this.selectedTab = {
      title: "Personal Details",
      href: "personal-details"
    };
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
    },
    {
      title: "Gallery Details",
      href: "gallery-details"
    },
  ]

}
