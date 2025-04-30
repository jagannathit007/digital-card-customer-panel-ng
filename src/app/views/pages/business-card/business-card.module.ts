import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BusinessCardRoutingModule } from './business-card-routing.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BusinessDetailsComponent } from './business-card-compo/shared-details/business-details/business-details.component';
import { BusinessProductsComponent } from './business-card-compo/shared-details/business-products/business-products.component';
import { BusinessServicesComponent } from './business-card-compo/shared-details/business-services/business-services.component';
import { DocumentDetailsComponent } from './business-card-compo/shared-details/document-details/document-details.component';
import { GalleryDetailsComponent } from './business-card-compo/shared-details/gallery-details/gallery-details.component';
import { PersonalDetailsComponent } from './business-card-compo/shared-details/personal-details/personal-details.component';
import { ThemeComponent } from './business-card-compo/shared-details/themes/themes.component';
import { BusinessCardComponent } from './business-card-compo/business-card.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { TooltipDirective } from '../../partials/tooltip/tooltip.directive';
import { OffersComponent } from './business-card-compo/shared-details/offers/offers.component';
import { GetInTouchComponent } from './business-card-compo/shared-details/get-in-touch/get-in-touch.component';
import { DebounceDirective } from 'src/app/core/directives/debounce';


@NgModule({
  declarations: [
    BusinessCardComponent,
    BusinessDetailsComponent,
    BusinessProductsComponent,
    BusinessServicesComponent,
    DocumentDetailsComponent,
    GalleryDetailsComponent,
    PersonalDetailsComponent,
    ThemeComponent,
    OffersComponent,
    GetInTouchComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgxPaginationModule,
    NgSelectModule,
    TooltipDirective,
    BusinessCardRoutingModule,
    DebounceDirective
  ]
})
export class BusinessCardModule { }
