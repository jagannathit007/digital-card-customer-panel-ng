import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WebsiteRoutingModule } from './website-routing.module';
import { WebsiteComponent } from './components/website/website.component';
import { HomeComponent } from './components/website/shared/home/home.component';
import { OurProductsComponent } from './components/website/shared/our-products/our-products.component';
import { OurTeamComponent } from './components/website/shared/our-team/our-team.component';
import { OurServicesComponent } from './components/website/shared/our-services/our-services.component';
import { OurClientsComponent } from './components/website/shared/our-clients/our-clients.component';
import { AboutSectionComponent } from './components/website/shared/about-section/about-section.component';
import { TestimonialsComponent } from './components/website/shared/testimonials/testimonials.component';
import { ThemesComponent } from './components/website/shared/themes/themes.component';
import { SeoDetailsComponent } from './components/website/shared/seo-details/seo-details.component';
import { ContactDetailsComponent } from './components/website/shared/contact-details/contact-details.component';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { TooltipDirective } from '../../partials/tooltip/tooltip.directive';

@NgModule({
  declarations: [
    WebsiteComponent,
    HomeComponent,
    OurProductsComponent,
    OurTeamComponent,
    OurServicesComponent,
    OurClientsComponent,
    AboutSectionComponent,
    TestimonialsComponent,
    ThemesComponent,
    SeoDetailsComponent,
    ContactDetailsComponent
  ],
  imports: [
    CommonModule,
    WebsiteRoutingModule,
    RouterModule,
    NgxPaginationModule,
    FormsModule,
    TooltipDirective,
  ]
})
export class WebsiteModule { }
