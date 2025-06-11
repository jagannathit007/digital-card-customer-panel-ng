import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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

const routes: Routes = [
  {
      path: '',
      component: WebsiteComponent,
      children: [
        { path: '', pathMatch: 'full', redirectTo: 'home' },
        { path: 'home', component: HomeComponent },
        { path: 'our-products', component: OurProductsComponent },
        { path: 'our-team', component: OurTeamComponent },
        { path: 'our-services', component: OurServicesComponent },
        { path: 'our-clients', component: OurClientsComponent },
        { path: 'about-section', component: AboutSectionComponent },
        { path: 'testimonials', component: TestimonialsComponent },
        { path: 'themes', component: ThemesComponent },
        { path: 'seo-details', component: SeoDetailsComponent },
        { path: 'contact-details', component: ContactDetailsComponent },
        
        { path: 'products-enquiry', component: ProductsEnquiryComponent },
        { path: 'getintouch-enquiry', component: GetinTouchEnquiryComponent },
        { path: 'our-certificate', component: OurCertificateComponent },
        { path: 'our-faq', component: FaqComponent },
        { path: 'our-blogs', component: BlogsComponent },
        

      ],
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebsiteRoutingModule { }
