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

import { ProductsEnquiryComponent } from './components/website/shared/products-enquiry/products-enquiry.component';
import { GetinTouchEnquiryComponent } from './components/website/shared/getin-touch-enquiry/getin-touch-enquiry.component';
import { OurCertificateComponent } from './components/website/shared/our-certificate/our-certificate.component';
import { FaqComponent } from './components/website/shared/faq/faq.component';
import { BlogsComponent } from './components/website/shared/blogs/blogs.component';

import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TooltipDirective } from '../../partials/tooltip/tooltip.directive';
import { ToggleComponent } from '../../partials/toggle/toggle.component';
import { DebounceDirective } from 'src/app/core/directives/debounce';
import { NgxEditorModule } from 'ngx-editor';


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
    ContactDetailsComponent,
    ProductsEnquiryComponent,
    GetinTouchEnquiryComponent,
    OurCertificateComponent,
    FaqComponent,
    BlogsComponent
  ],
  imports: [
    CommonModule,
    WebsiteRoutingModule,
    RouterModule,
    NgxPaginationModule,
    NgSelectModule,
    FormsModule,
    TooltipDirective,
    ToggleComponent,
    DebounceDirective,
    NgxEditorModule
  ]
})
export class WebsiteModule { }
