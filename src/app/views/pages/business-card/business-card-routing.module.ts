import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BusinessCardComponent } from './business-card-compo/business-card.component';
import { PersonalDetailsComponent } from './business-card-compo/shared-details/personal-details/personal-details.component';
import { BusinessDetailsComponent } from './business-card-compo/shared-details/business-details/business-details.component';
import { DocumentDetailsComponent } from './business-card-compo/shared-details/document-details/document-details.component';
import { ThemeComponent } from './business-card-compo/shared-details/themes/themes.component';
import { GalleryDetailsComponent } from './business-card-compo/shared-details/gallery-details/gallery-details.component';
import { BusinessProductsComponent } from './business-card-compo/shared-details/business-products/business-products.component';
import { BusinessServicesComponent } from './business-card-compo/shared-details/business-services/business-services.component';
import { OffersComponent } from './business-card-compo/shared-details/offers/offers.component';

const routes: Routes = [
  {
    path: '',
    component: BusinessCardComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'personal-details' },
      { path: 'personal-details', component: PersonalDetailsComponent },
      { path: 'business-details', component: BusinessDetailsComponent },
      { path: 'document-details', component: DocumentDetailsComponent },
      { path: 'themes', component: ThemeComponent },
      { path: 'gallery-details', component: GalleryDetailsComponent },
      { path: 'products', component: BusinessProductsComponent },
      { path: 'services', component: BusinessServicesComponent },
      { path: 'offers', component: OffersComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusinessCardRoutingModule {}
